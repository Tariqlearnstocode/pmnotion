import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import KanbanView from '../components/collections/KanbanView';
import TableView from '../components/collections/TableView';
import CalendarView from '../components/collections/CalendarView';
import Button from '../components/ui/Button';
import EntryFormModal from '../components/entries/EntryFormModal';
import FieldManagerModal from '../components/fields/FieldManagerModal';
import StatusManagerModal from '../components/statuses/StatusManagerModal';
import DocumentList from '../components/documents/DocumentList';
import DocumentUploadModal from '../components/documents/DocumentUploadModal';
import { Kanban, Table, Calendar, Plus, Filter, Settings, Columns, Upload, FileText } from 'lucide-react';
import { Collection, Entry, Status, Field } from '../types';
import { getCollectionById, getCollections } from '../services/collections';
import { getEntriesByCollectionId } from '../services/entries';
import { documentService, DocumentMetadata } from '../services/documents';
import { useAuth } from '../context/AuthContext';

// Define a type for the fetched collection including nested fields/statuses
type FetchedCollection = Collection & { fields: Field[]; statuses: Status[] };

const CollectionPage: React.FC = () => {
  const { id: collectionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authUser, loading: authLoading } = useAuth();

  // State for the fetched collection data
  const [collection, setCollection] = useState<FetchedCollection | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for all collections (for Sidebar)
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  // State for the modal
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [creatingStatusId, setCreatingStatusId] = useState<string | null>(null);

  // State for Field Manager modal
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);

  // State for Status Manager modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // --- Document Management State --- 
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);

  // Wrap data loading in useCallback to potentially optimize child components
  const loadCollectionData = useCallback(async () => {
    if (!collectionId || authLoading || !authUser) return;

    setLoading(true);
    setDocumentsLoading(true);
    setError(null);
    setDocumentsError(null);

    try {
      const [collectionData, entriesData, documentsData] = await Promise.all([
        getCollectionById(collectionId as string),
        getEntriesByCollectionId(collectionId as string),
        documentService.getDocumentsByCollection(collectionId as string)
      ]);
      
      setCollection(collectionData as FetchedCollection);
      setEntries(entriesData);
      setDocuments(documentsData);

    } catch (err) {
      console.error('Error loading collection data:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to load collection data';
      setError(errorMsg);
      setDocumentsError(errorMsg);
    } finally {
      setLoading(false);
      setDocumentsLoading(false);
    }
  }, [collectionId, authUser, authLoading]);

  // Fetch collection details, entries, and documents
  useEffect(() => {
    if (authLoading || !authUser) {
      if (!authLoading && !authUser) {
         setError("You must be logged in to view collections.");
         setLoading(false);
         setDocumentsLoading(false);
      }
      return;
    }
    if (!collectionId) {
      setError('Collection ID is missing.');
      setLoading(false);
      setDocumentsLoading(false);
      return;
    }
    loadCollectionData();
  }, [loadCollectionData, collectionId, authUser, authLoading]);

  useEffect(() => {
    if (authLoading || !authUser) return;

    async function loadAllCollections() {
      setSidebarLoading(true);
      try {
        const data = await getCollections();
        setAllCollections(data || []);
      } catch (err) {
        console.error('Error loading all collections for sidebar:', err);
      } finally {
        setSidebarLoading(false);
      }
    }
    loadAllCollections();
  }, [authUser, authLoading]);

  // --- Document Management Handlers --- 
  const openUploadModal = () => {
      setIsUploadModalOpen(true);
  };
  
  const closeUploadModal = () => {
      setIsUploadModalOpen(false);
      setDocumentsError(null);
  };
  
  const handleUploadDocument = useCallback(async (file: File, metadata: Omit<DocumentMetadata, 'id' | 'collection_id' | 'entry_id' | 'url' | 'size' | 'created_by' | 'created_at' | 'storage_path'>) => {
      if (!collectionId || !authUser) {
          throw new Error("Collection or user information is missing.");
      }
      try {
          const newDocument = await documentService.uploadDocument(file, collectionId, metadata /*, undefined */); 
          if (newDocument) {
              setDocuments(prevDocs => [newDocument, ...prevDocs]);
              closeUploadModal();
          }
      } catch (error: any) {
          console.error("Upload failed:", error);
          throw new Error(error.message || "Failed to upload document."); 
      }
  }, [collectionId, authUser]);
  
  const handleDeleteDocument = useCallback(async (documentId: string) => {
      setDeletingDocumentId(documentId);
      setDocumentsError(null);
      try {
          const success = await documentService.deleteDocument(documentId);
          if (success) {
              setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
          } else {
              throw new Error("Deletion failed or document not found.");
          }
      } catch (error: any) {
          console.error("Deletion failed:", error);
          setDocumentsError(error.message || "Failed to delete document.");
      } finally {
          setDeletingDocumentId(null);
      }
  }, []);

  // --- Entry Modal Handlers ---
  const openCreateEntryModal = (statusId: string) => {
    setEditingEntry(null);
    setCreatingStatusId(statusId);
    setIsEntryModalOpen(true);
  };

  const openEditEntryModal = (entryToEdit: Entry) => {
     setEditingEntry(entryToEdit);
     setCreatingStatusId(null);
     setIsEntryModalOpen(true);
  };

  const closeEntryModal = () => {
    setIsEntryModalOpen(false);
    setEditingEntry(null);
    setCreatingStatusId(null);
  };

  const handleSaveEntry = (savedEntry: Entry) => {
    if (editingEntry) {
      setEntries(prevEntries => 
        prevEntries.map(entry => entry.id === savedEntry.id ? savedEntry : entry)
      );
    } else {
      setEntries(prevEntries => [savedEntry, ...prevEntries]);
    }
    closeEntryModal();
  };

  // --- Field Modal Handlers ---
  const openFieldModal = () => {
    setIsFieldModalOpen(true);
  };

  const closeFieldModal = () => {
     setIsFieldModalOpen(false);
  };

  const handleSaveFields = async (/* updatedFields: Field[] */) => {
    console.log("Fields saved in modal, refetching collection...");
    closeFieldModal();
    await loadCollectionData();
  };

  // --- Status Modal Handlers ---
  const openStatusModal = () => {
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
  };

  const handleSaveStatuses = async () => {
    console.log("Statuses saved in modal, refetching collection...");
    closeStatusModal();
    await loadCollectionData();
  };

  const isLoading = loading || authLoading || sidebarLoading;
  if (isLoading && !collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-500">Loading collection data...</div>
        </div>
      </div>
    );
  }

  if (error && !collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-red-500 p-6 text-center">
            <p>Error loading collection:</p>
            <p className="mt-2 font-mono bg-red-100 p-2 rounded">{error}</p>
             <Button variant="outline" onClick={() => navigate('/collections')} className="mt-4">
               Back to Collections
             </Button>
           </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
       <div className="min-h-screen bg-gray-50 flex flex-col">
         <Header />
         <div className="flex flex-1 items-center justify-center">
           <div className="text-center text-gray-500">
             <p>Collection not found or still loading...</p>
              <Button variant="outline" onClick={() => navigate('/collections')} className="mt-4">
                Back to Collections
              </Button>
            </div>
         </div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collections={allCollections} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
            <div className="container mx-auto px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    {collection.icon} {collection.name}
                    <Button 
                      variant="ghost" 
                      icon={<Settings size={18} />} 
                      className="ml-2 text-gray-400 hover:text-gray-600 p-1"
                      onClick={openFieldModal} 
                      title="Manage Fields"
                     />
                    {collection.viewType === 'kanban' && (
                      <Button 
                        variant="ghost" 
                        icon={<Columns size={18} />} 
                        className="ml-1 text-gray-400 hover:text-gray-600 p-1"
                        onClick={openStatusModal} 
                        title="Manage Statuses"
                       />
                    )}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">{collection.description}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    icon={<Filter className="h-4 w-4" />}
                    disabled
                    title="Filter (Not implemented)"
                  >
                    Filter
                  </Button>
                  
                  <div className="border-l border-gray-300 h-8"></div>
                  
                  <div className="flex border border-gray-300 rounded-md">
                    <button 
                      className={`p-2 ${collection.viewType === 'kanban' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                      title="Kanban view"
                      disabled
                    >
                      <Kanban className="h-5 w-5" />
                    </button>
                    <button 
                      className={`p-2 ${collection.viewType === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                      title="Table view"
                      disabled
                    >
                      <Table className="h-5 w-5" />
                    </button>
                    <button 
                      className={`p-2 ${collection.viewType === 'calendar' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                      title="Calendar view"
                      disabled
                    >
                      <Calendar className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="border-l border-gray-300 h-8"></div>
                  
                  <Button
                    variant="primary"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => collection.statuses && collection.statuses.length > 0 && openCreateEntryModal(collection.statuses[0].id)}
                    disabled={!collection.statuses || collection.statuses.length === 0 || collection.viewType !== 'kanban'}
                    title={collection.viewType !== 'kanban' ? "Add Entry (Available in Kanban View)" : "Add New Entry"}
                  >
                    Add Entry
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              {collection.viewType === 'kanban' && (
                <KanbanView 
                  statuses={collection.statuses}
                  fields={collection.fields}
                  collectionId={collection.id}
                  onAddEntry={openCreateEntryModal}
                  entries={entries}
                />
              )}
              {collection.viewType === 'table' && (
                <TableView 
                  fields={collection.fields}
                  entries={entries}
                />
              )}
              {collection.viewType === 'calendar' && (
                <CalendarView 
                  fields={collection.fields}
                  entries={entries}
                />
              )}
            </div>
            
            <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                   <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                       <FileText size={20} className="mr-2 text-gray-500"/> 
                       Documents
                    </h2>
                   <Button 
                      variant="secondary" 
                      icon={<Upload size={16} />} 
                      onClick={openUploadModal}
                    >
                       Upload Document
                   </Button>
                </div>
                
                {documentsLoading && <p className="text-gray-500">Loading documents...</p>} 
                {documentsError && <p className="text-red-500">Error loading documents: {documentsError}</p>}
                {!documentsLoading && !documentsError && (
                    <DocumentList 
                        documents={documents}
                        onDelete={handleDeleteDocument}
                        loadingDeleteId={deletingDocumentId}
                    />
                )} 
            </div>
          </div>
        </main>
      </div>

      {collectionId && (
        <EntryFormModal 
          isOpen={isEntryModalOpen}
          onClose={closeEntryModal}
          collectionId={collectionId} 
          fields={collection.fields}
          entry={editingEntry}
          statusId={creatingStatusId ?? undefined}
          onSave={handleSaveEntry}
        />
      )}
      {collectionId && (
        <FieldManagerModal
          isOpen={isFieldModalOpen}
          onClose={closeFieldModal}
          collectionId={collectionId}
          initialFields={collection.fields}
          onSave={handleSaveFields}
        />
      )}
      {collectionId && collection.viewType === 'kanban' && (
        <StatusManagerModal
          isOpen={isStatusModalOpen}
          onClose={closeStatusModal}
          collectionId={collectionId}
          initialStatuses={collection.statuses}
          onSave={handleSaveStatuses}
        />
      )}
      {collectionId && (
          <DocumentUploadModal
              isOpen={isUploadModalOpen}
              onClose={closeUploadModal}
              collectionId={collectionId}
              onUpload={handleUploadDocument}
          />
      )}
    </div>
  );
};

export default CollectionPage;