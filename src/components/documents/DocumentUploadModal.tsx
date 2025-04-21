import React, { useState } from 'react';
// Use DocumentMetadata type from the service
import { DocumentMetadata } from '../../services/documents'; 
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { X, UploadCloud } from 'lucide-react';

// Define allowed document types based on DocumentMetadata if possible, or keep as string
// Assuming DocumentMetadata.type is optional string for flexibility
type DocumentTypeOption = 'lease' | 'inspection' | 'maintenance' | 'application' | 'other';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: string; // Still needed for context
  // Update the onUpload prop to expect metadata matching the service call
  onUpload: (file: File, metadata: Omit<DocumentMetadata, 'id' | 'collection_id' | 'entry_id' | 'url' | 'size' | 'created_by' | 'created_at' | 'storage_path'>) => Promise<void>; 
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ 
    isOpen, 
    onClose, 
    collectionId,
    onUpload
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  // Use the specific types for state, map to string if needed for service
  const [documentType, setDocumentType] = useState<DocumentTypeOption>('other'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setSelectedFile(file);
        if (!documentName) {
            setDocumentName(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
        }
    } else {
        setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !documentName.trim() || !documentType) {
        setError('Please select a file, provide a name, and select a type.');
        return;
    }
    setLoading(true);
    setError(null);

    try {
        // Construct metadata object matching the expected type for the service call
        const metadata: Omit<DocumentMetadata, 'id' | 'collection_id' | 'entry_id' | 'url' | 'size' | 'created_by' | 'created_at' | 'storage_path'> = {
            name: documentName.trim(),
            // Pass the string value for type
            type: documentType, 
            // Pass content_type from the file
            content_type: selectedFile.type, 
            // Add other necessary fields from DocumentMetadata if the Omit<> allows
            // For now, assuming only name, type, content_type are needed here
        };
        
        await onUpload(selectedFile, metadata);
        handleClose(); // Close on success
    } catch (err: any) {
        console.error('Document upload failed:', err);
        setError(err.message || 'Failed to upload document.');
    } finally {
        setLoading(false);
    }
  };

  // Reset state on close
  const handleClose = () => {
     setSelectedFile(null);
     setDocumentName('');
     setDocumentType('other');
     setError(null);
     setLoading(false);
     onClose();
   };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto">
        <form onSubmit={handleSubmit}>
           {/* Header */}
           <div className="flex justify-between items-center p-5 border-b border-gray-200">
             <h3 className="text-lg font-medium text-gray-900">Upload New Document</h3>
             <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" onClick={handleClose} aria-label="Close modal" disabled={loading}>
               <X className="w-5 h-5" />
             </button>
           </div>

           {/* Body */} 
           <div className="p-6 space-y-4">
             {/* File Input */} 
             <div>
                 <Label htmlFor="doc-file-upload" className="block text-sm font-medium text-gray-700 mb-1">Document File</Label>
                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                         <div className="flex text-sm text-gray-600">
                             <label htmlFor="doc-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                 <span>{selectedFile ? 'Change file' : 'Upload a file'}</span>
                                 <input id="doc-file-upload" name="doc-file-upload" type="file" className="sr-only" onChange={handleFileChange} required disabled={loading} />
                             </label>
                             <p className="pl-1">or drag and drop</p> { /* Drag/drop not implemented */}
                         </div>
                         {selectedFile ? (
                            <p className="text-xs text-gray-500">Selected: {selectedFile.name} ({selectedFile.type})</p>
                         ) : (
                             <p className="text-xs text-gray-500">PDF, DOCX, PNG, JPG etc.</p>
                         )}
                    </div>
                 </div>
             </div>
             
             {/* Document Name */} 
             <div>
                 <Label htmlFor="doc-name">Document Name</Label>
                 <Input 
                    id="doc-name"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    required
                    disabled={loading}
                    className="mt-1"
                    placeholder="e.g., Lease Agreement - Unit 101"
                 />
             </div>
             
             {/* Document Type */} 
             <div>
                 <Label htmlFor="doc-type">Document Type</Label>
                 <Select 
                     id="doc-type"
                     value={documentType}
                     onChange={(e) => setDocumentType(e.target.value as DocumentTypeOption)}
                     required
                     disabled={loading}
                     className="mt-1"
                 >
                     {/* Use DocumentTypeOption values */}
                     <option value="lease">Lease</option>
                     <option value="inspection">Inspection</option>
                     <option value="maintenance">Maintenance</option>
                     <option value="application">Application</option>
                     <option value="other">Other</option>
                 </Select>
             </div>

             {/* TODO: Add other metadata fields here (expiry, tags) */} 

             {error && <p className="text-sm text-red-600 mt-2">Error: {error}</p>}
           </div>

           {/* Footer */} 
           <div className="flex items-center justify-end p-6 space-x-2 border-t border-gray-200 rounded-b">
             <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
             <Button type="submit" variant="primary" disabled={loading || !selectedFile} loading={loading}>Upload Document</Button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal; 