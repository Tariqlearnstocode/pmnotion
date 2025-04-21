import React from 'react';
// Use DocumentMetadata type from the service
import { DocumentMetadata } from '../../services/documents'; 
import { FileText, Trash2, Download } from 'lucide-react';
import Button from '../ui/Button';

interface DocumentListProps {
  // Update prop type
  documents: DocumentMetadata[]; 
  // Update onDelete signature to just pass ID, as path is in the metadata
  onDelete: (documentId: string) => void; 
  loadingDeleteId: string | null; // Track which document is being deleted
}

// Simple utility to format bytes
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete, loadingDeleteId }) => {
  if (documents.length === 0) {
    // Updated message for clarity
    return <p className="text-gray-500 italic">No documents have been uploaded to this collection yet.</p>; 
  }

  // Removed getPathFromUrl, as storage_path is directly available in DocumentMetadata

  return (
    <ul className="space-y-3">
      {documents.map((doc) => {
         // Use doc.storage_path directly if needed, though delete only needs ID
         const isDeleting = loadingDeleteId === doc.id;
         return (
           <li key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 border rounded-md hover:bg-gray-100 transition-colors duration-150">
             <div className="flex items-center space-x-3 overflow-hidden">
               <FileText className="h-6 w-6 text-gray-500 flex-shrink-0" />
               <div className="overflow-hidden">
                 <p className="text-sm font-medium text-gray-800 truncate" title={doc.name}>{doc.name}</p>
                 <p className="text-xs text-gray-500">
                     {/* Use doc.content_type and doc.created_at */} 
                     {doc.content_type} - {formatBytes(doc.size)} - Added {new Date(doc.created_at).toLocaleDateString()}
                     {/* Optional: Display type if it exists */} 
                     {doc.type && ` - Type: ${doc.type}`}
                 </p>
               </div>
             </div>
             <div className="flex space-x-2 flex-shrink-0 ml-4">
                 {/* Direct Download Button */} 
                 <a 
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={doc.name} // Suggest original filename
                    className="p-1 text-gray-500 hover:text-blue-600"
                    title="Download"
                 >
                    <Download size={16} />
                 </a>
                 {/* Updated Delete Button */} 
                 <Button 
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-100 hover:text-red-700 p-1" 
                    // Pass only doc.id to onDelete
                    onClick={() => onDelete(doc.id)} 
                    disabled={isDeleting}
                    loading={isDeleting}
                    title="Delete"
                    aria-label="Delete document"
                 >
                     <Trash2 size={16}/>
                 </Button>
             </div>
           </li>
         );
      })}
    </ul>
  );
};

export default DocumentList; 