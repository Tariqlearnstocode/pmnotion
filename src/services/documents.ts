import { supabase } from '../lib/supabaseClient';
import type { Document } from '../types';
import { getFileUrl as getGenericFileUrl, deleteFile as deleteGenericFile } from './storage'; // Reuse basic storage functions

// Define a separate bucket for structured documents
const DOCUMENT_STORAGE_BUCKET = 'collection_documents';

// Placeholder for document metadata type (matches Supabase 'documents' table structure)
interface DocumentMetadata {
  id: string; // UUID from Supabase
  created_at: string; // Timestamp from Supabase
  name: string;
  url: string; // URL to access the document (e.g., storage URL)
  size: number; // Size in bytes
  content_type: string; // MIME type
  entry_id?: string; // Optional: Link to a specific collection entry (FK)
  collection_id: string; // Link to the collection it belongs to (FK)
  created_by: string; // User ID (FK)
  type?: string; // Optional document type string
  storage_path: string; // Path in Supabase storage bucket
}

/**
 * Fetches documents associated with a specific collection.
 * @param collectionId The ID of the collection.
 * @returns An array of Document objects.
 */
export async function getDocumentsByCollection(collectionId: string): Promise<DocumentMetadata[]> {
    if (!collectionId) {
        console.warn('getDocumentsByCollection called without collectionId');
        return [];
    }
    console.log(`Fetching documents for collection: ${collectionId}`); // Added log
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching documents:', error);
        throw error;
    }
    console.log(`Found ${data?.length ?? 0} documents for collection ${collectionId}`); // Added log
    return (data || []) as DocumentMetadata[];
}


/**
 * Fetches documents associated with a specific collection entry.
 * @param collectionId The ID of the collection.
 * @param entryId The ID of the specific entry within the collection.
 * @returns An array of Document objects linked to the entry.
 */
export async function getDocumentsByEntry(collectionId: string, entryId: string): Promise<DocumentMetadata[]> {
    if (!collectionId || !entryId) {
        console.warn('getDocumentsByEntry called without collectionId or entryId');
        return [];
    }
    console.log(`Fetching documents for entry: ${entryId} in collection: ${collectionId}`); // Added log
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('collection_id', collectionId)
        .eq('entry_id', entryId) // Filter by entry_id
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching documents for entry:', error);
        throw error;
    }
     console.log(`Found ${data?.length ?? 0} documents for entry ${entryId}`); // Added log
    return (data || []) as DocumentMetadata[];
}


/**
 * Uploads a document file to storage and creates a record in the documents table.
 * @param file The file object to upload.
 * @param collectionId The ID of the collection this document belongs to.
 * @param documentData Metadata for the document record (name, type, etc.). Should match columns in 'documents' table.
 * @param entryId Optional ID of the entry this document is associated with.
 * @returns The newly created Document object.
 */
export async function uploadDocument(
    file: File,
    collectionId: string,
    documentData: Partial<Omit<DocumentMetadata, 'id' | 'collection_id' | 'entry_id' | 'url' | 'size' | 'created_by' | 'created_at' | 'storage_path'>>,
    entryId?: string
): Promise<DocumentMetadata | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be logged in to upload documents');
    if (!collectionId) throw new Error('Collection ID is required');

    // 1. Upload file to the dedicated bucket
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`; // Use random name to avoid collisions
    const pathPrefix = `${collectionId}/${entryId ?? 'collection_level'}`; // Organize by collection/entry
    const filePath = `${pathPrefix}/${fileName}`;

    console.log(`Attempting to upload ${file.name} to bucket ${DOCUMENT_STORAGE_BUCKET} at path ${filePath}`); // Added log

    try {
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(DOCUMENT_STORAGE_BUCKET)
            .upload(filePath, file, { upsert: false }); // Don't upsert by default

        if (uploadError) throw uploadError;
        if (!uploadData?.path) throw new Error('File upload failed to return path.');
        console.log('Document uploaded successfully to:', uploadData.path);

    } catch (uploadError: any) {
        console.error('Error uploading document file:', uploadError);
        // Handle potential RLS errors or bucket policies
        if (uploadError.message?.includes('policy')) {
             console.error('Potential RLS issue or incorrect bucket policy.');
        }
        throw uploadError; // Re-throw to stop execution
    }

    // 2. Get Public URL
     console.log(`Getting public URL for path: ${filePath}`); // Added log
    const { data: urlData } = supabase.storage
        .from(DOCUMENT_STORAGE_BUCKET)
        .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
        console.error(`Failed to get public URL for uploaded document: ${filePath}`);
        // Attempt to clean up the uploaded file if URL generation fails
        console.log(`Attempting to delete orphaned file: ${filePath}`);
        await deleteDocumentFile(filePath); // Use specific delete func
        throw new Error('Failed to get URL for uploaded document.');
    }
     console.log(`Public URL obtained: ${urlData.publicUrl}`); // Added log

    // 3. Create document record in the database
    const documentToInsert = {
        ...documentData, // Include fields like 'name', 'type', 'content_type'
        name: documentData.name || file.name, // Use provided name or fallback to filename
        content_type: file.type, // Always use the file's MIME type
        collection_id: collectionId,
        ...(entryId && { entry_id: entryId }), // Conditionally add entry_id
        url: urlData.publicUrl, // Store the public URL
        storage_path: filePath, // Store the storage path for deletion
        size: file.size,
        created_by: user.id,
    };

    console.log('Inserting document metadata into DB:', documentToInsert); // Added log

    const { data: dbData, error: dbError } = await supabase
        .from('documents')
        .insert(documentToInsert)
        .select()
        .single();

    if (dbError) {
        console.error('Error creating document record:', dbError);
        // Attempt to clean up the uploaded file if DB insert fails
        console.log(`Attempting to delete orphaned file due to DB error: ${filePath}`);
        await deleteDocumentFile(filePath);
        throw dbError;
    }

    console.log('Document record created successfully:', dbData); // Added log
    return dbData as DocumentMetadata | null;
}


/**
 * Deletes only the document file from storage.
 * @param filePath The path of the file in Supabase Storage.
 * @returns True if successful, false otherwise.
 */
async function deleteDocumentFile(filePath: string): Promise<boolean> {
    if (!filePath) {
        console.warn('deleteDocumentFile requires filePath');
        return false;
    }
    console.log(`Deleting document file from storage bucket ${DOCUMENT_STORAGE_BUCKET}: ${filePath}`); // Added log
    const { error: storageError } = await supabase.storage
        .from(DOCUMENT_STORAGE_BUCKET)
        .remove([filePath]);

    if (storageError) {
         console.error(`Error deleting document file ${filePath}:`, storageError);
         return false;
    }
    console.log(`Successfully deleted document file: ${filePath}`); // Added log
    return true;
}

/**
 * Deletes a document record from the database and its corresponding file from storage.
 * @param documentId The ID of the document record in the database.
 */
export async function deleteDocument(documentId: string): Promise<boolean> {
    if (!documentId) {
        console.warn('deleteDocument requires documentId');
        return false;
    }

    console.log(`Attempting to delete document with ID: ${documentId}`); // Added log

    // 1. Get the document record to find the storage path
    const { data: docData, error: fetchError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', documentId)
        .single();

    if (fetchError || !docData) {
        console.error(`Error fetching document ${documentId} for deletion:`, fetchError);
        return false; // Cannot proceed without storage path
    }

    const filePath = docData.storage_path;
    if (!filePath) {
         console.error(`Document ${documentId} found but has no storage_path.`);
        // Decide if we should still delete the DB record? Let's say no for safety.
        return false;
    }
    console.log(`Found storage path for document ${documentId}: ${filePath}`); // Added log


    // 2. Delete DB record first
     console.log(`Deleting DB record for document ID: ${documentId}`); // Added log
    const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

    if (dbError) {
        console.error(`Error deleting document record ${documentId}:`, dbError);
        return false; // Don't proceed to storage deletion if DB fails
    }
    console.log(`Successfully deleted DB record for document ID: ${documentId}`); // Added log


    // 3. Delete file from storage using the fetched path
    const fileDeleted = await deleteDocumentFile(filePath);

    if (!fileDeleted) {
        console.warn(`Document record ${documentId} deleted, but failed to delete file ${filePath}. Manual cleanup might be needed.`);
        // Return true because the primary record is gone, but log a warning.
        return true; // Or return false to indicate partial failure? Let's indicate success but warn.
    }

    console.log(`Successfully deleted document ${documentId} and its file ${filePath}.`); // Added log
    return true;
}


// --- Placeholder Service (for testing or if Supabase is unavailable) ---

// Set this flag to true to use placeholder functions instead of Supabase
const USE_PLACEHOLDER_SERVICE = process.env.NODE_ENV === 'development' && false; // Set to true for testing UI without Supabase

let placeholderDocuments: DocumentMetadata[] = [
  {
    id: 'doc-placeholder-1',
    created_at: new Date().toISOString(),
    name: 'Sample Document 1.pdf',
    url: '/placeholders/Sample Document 1.pdf',
    size: 1024 * 500, // 500 KB
    content_type: 'application/pdf',
    entry_id: 'entry-placeholder-1',
    collection_id: 'col-placeholder-1',
    created_by: 'user-placeholder-1',
    storage_path: 'public/col-placeholder-1/entry-placeholder-1/Sample Document 1.pdf'
  },
  {
    id: 'doc-placeholder-2',
    created_at: new Date().toISOString(),
    name: 'Another Image.png',
    url: '/placeholders/Another Image.png',
    size: 1024 * 150, // 150 KB
    content_type: 'image/png',
    entry_id: 'entry-placeholder-1',
    collection_id: 'col-placeholder-1',
    created_by: 'user-placeholder-1',
    storage_path: 'public/col-placeholder-1/entry-placeholder-1/Another Image.png'
  },
  {
    id: 'doc-placeholder-3',
    created_at: new Date().toISOString(),
    name: 'Spreadsheet.xlsx',
    url: '/placeholders/Spreadsheet.xlsx',
    size: 1024 * 800, // 800 KB
    content_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    entry_id: 'entry-placeholder-2',
    collection_id: 'col-placeholder-1',
    created_by: 'user-placeholder-2',
    storage_path: 'public/col-placeholder-1/entry-placeholder-2/Spreadsheet.xlsx'
  },
];

const uploadFilePlaceholder = async (
    file: File,
    collectionId: string,
    documentData: Partial<Omit<DocumentMetadata, 'id' | 'collection_id' | 'entry_id' | 'url' | 'size' | 'created_by' | 'created_at' | 'storage_path'>>,
    entryId?: string
): Promise<DocumentMetadata | null> => {
  console.log(`[Placeholder] Simulating upload for: ${file.name}, collection: ${collectionId}, entry: ${entryId}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate upload time

  const mockData: DocumentMetadata = {
    id: `placeholder_doc_${Date.now()}`,
    created_at: new Date().toISOString(),
    name: documentData.name || file.name,
    url: `/placeholder/uploads/${collectionId}/${entryId ?? 'collection_level'}/${file.name}`,
    size: file.size,
    content_type: file.type,
    collection_id: collectionId,
    ...(entryId && { entry_id: entryId }),
    created_by: 'placeholder_user', // Simulate a user ID
    storage_path: `/placeholder/uploads/${collectionId}/${entryId ?? 'collection_level'}/${file.name}`,
    type: documentData.type ?? 'placeholder_type'
  };
  placeholderDocuments.push(mockData);
  console.log('[Placeholder] File uploaded (simulation):', mockData);
  return mockData;
};

const getDocumentsPlaceholder = async (collectionId: string, entryId?: string): Promise<DocumentMetadata[]> => {
  console.log(`[Placeholder] Fetching documents for collection: ${collectionId}` + (entryId ? ` and entry: ${entryId}` : ''));
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate fetch time

  let results = placeholderDocuments.filter(doc => doc.collection_id === collectionId);
  if (entryId) {
    results = results.filter(doc => doc.entry_id === entryId);
  }
  console.log('[Placeholder] Found documents:', results.length);
  return results;
};

const deleteDocumentPlaceholder = async (documentId: string): Promise<boolean> => {
  console.log(`[Placeholder] Deleting document: ${documentId}`);
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate deletion time
  const initialLength = placeholderDocuments.length;
  placeholderDocuments = placeholderDocuments.filter(doc => doc.id !== documentId);
  const deleted = placeholderDocuments.length < initialLength;
  if (deleted) {
    console.log(`[Placeholder] Document ${documentId} deleted (simulation).`);
  } else {
    console.warn(`[Placeholder] Document ${documentId} not found for deletion.`);
  }
  return deleted; // Simulate success/failure
};


// --- Export appropriate service ---

export const documentService = USE_PLACEHOLDER_SERVICE
  ? {
      getDocumentsByCollection: getDocumentsPlaceholder,
      getDocumentsByEntry: getDocumentsPlaceholder,
      uploadDocument: uploadFilePlaceholder,
      deleteDocument: deleteDocumentPlaceholder,
    }
  : {
      getDocumentsByCollection,
      getDocumentsByEntry,
      uploadDocument,
      deleteDocument,
    };

// Export types if needed elsewhere
export type { DocumentMetadata }; 