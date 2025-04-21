import React, { useState, useEffect } from 'react';
import { Field, Entry, EntryValue, Comment, User } from '../../types'; // Add Comment, User types
import Button from '../ui/Button';
import { createEntry, updateEntryValues } from '../../services/entries'; // Import services
import { uploadFile, getFileUrl } from '../../services/storage'; // Import storage service
import { useAuth } from '../../context/AuthContext'; // Needed for user ID in path prefix
import { Input } from '../ui/Input'; // Import standard Input
import { Label } from '../ui/Label'; // Import Label
import { Checkbox } from '../ui/Checkbox'; // Import Checkbox
import { Select } from '../ui/Select'; // Import Select
import { getCommentsByEntryId, createComment, deleteComment } from '../../services/comments'; // Import comments service
import { Trash2 } from 'lucide-react'; // Import Trash icon
// Potentially use a Modal component from a library or a custom one
// import Modal from '../ui/Modal'; 

interface EntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: string;
  fields: Field[];
  entry?: Entry | null; // Pass existing entry for editing
  statusId?: string; // Pass statusId for creating in a specific column
  // Add callback for successful save
  onSave: (savedEntry: Entry) => void; 
}

// State for form values (fieldId -> value)
type FormValues = Record<string, string | null>;
// State for selected files (fieldId -> File object)
type SelectedFiles = Record<string, File | null>;

const EntryFormModal: React.FC<EntryFormModalProps> = ({
  isOpen,
  onClose,
  collectionId,
  fields,
  entry = null, // Default to null for creating
  statusId,
  onSave,
}) => {
  const { authUser, userProfile } = useAuth(); // Get authUser for checks
  const [formValues, setFormValues] = useState<FormValues>({});
  // Add state for file inputs
  const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const isEditing = entry !== null;

  useEffect(() => {
    if (isOpen) {
      // Reset files state on open
      setSelectedFiles({}); 
      if (isEditing && entry) {
        const initialValues: FormValues = {};
        fields.forEach(field => {
          const entryValue = entry.entry_values.find(ev => ev.field_id === field.id);
          initialValues[field.id] = entryValue?.value ?? null;
        });
        setFormValues(initialValues);
      } else {
        setFormValues({});
      }
    }

    // Fetch comments when opening for an existing entry
    if (isOpen && isEditing && entry?.id) {
        const fetchComments = async () => {
            setCommentsLoading(true);
            setCommentsError(null);
            try {
                const fetchedComments = await getCommentsByEntryId(entry.id);
                setComments(fetchedComments);
            } catch (err) {
                console.error("Error fetching comments:", err);
                setCommentsError("Failed to load comments.");
            } finally {
                setCommentsLoading(false);
            }
        };
        fetchComments();
    } else if (isOpen) {
         // Clear comments when opening for create
         setComments([]);
         setNewComment('');
         setCommentsError(null);
    }
  }, [isOpen, isEditing, entry, fields]);

  const handleInputChange = (fieldId: string, value: string | boolean | null) => {
    const finalValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : value;
    setFormValues(prev => ({ ...prev, [fieldId]: finalValue }));
  };

  // Handler for file input changes
  const handleFileChange = (fieldId: string, file: File | null) => {
    setSelectedFiles(prev => ({ ...prev, [fieldId]: file }));
    // Clear existing text value for this field if a new file is selected
    if (file) {
        setFormValues(prev => ({ ...prev, [fieldId]: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Create a mutable copy of form values to update with file URLs
    let submissionValues = { ...formValues };

    try {
        // --- File Upload Logic --- 
        const uploadPromises = Object.entries(selectedFiles)
            .filter(([_, file]) => file !== null)
            .map(async ([fieldId, file]) => {
                if (!file) return; // Should not happen due to filter, but type safety
                
                // Construct a path prefix (optional, adjust as needed)
                const pathPrefix = authUser ? `${authUser.id}/` : 'public/'; 
                
                console.log(`Uploading file for field ${fieldId}...`);
                const filePath = await uploadFile(file, pathPrefix);
                console.log(`File uploaded to path: ${filePath}`);
                
                // Get public URL (assuming bucket allows public access)
                const urlData = getFileUrl(filePath);
                if (!urlData?.publicUrl) {
                    console.warn(`Could not get public URL for uploaded file: ${filePath}`);
                     // Store the path if URL fails? Or throw error?
                    // For now, let's store the path as fallback.
                    submissionValues[fieldId] = filePath; 
                    // throw new Error(`Failed to get public URL for ${file.name}`);
                } else {
                     console.log(`Public URL: ${urlData.publicUrl}`);
                     submissionValues[fieldId] = urlData.publicUrl;
                }
            });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
        console.log("All uploads finished. Submission values:", submissionValues);

      // --- Create/Update Logic --- 
      if (isEditing && entry) {
        await updateEntryValues(entry.id, submissionValues); // Use updated values
        // Construct updated entry locally (consider refetching for consistency)
        const updatedEntry: Entry = {
          ...entry,
          entry_values: Object.entries(submissionValues).map(([field_id, value]) => ({
             id: entry.entry_values.find(ev => ev.field_id === field_id)?.id || `temp-${field_id}`,
             entry_id: entry.id,
             field_id,
             value
          })).filter(ev => ev.value !== null),
          updated_at: new Date().toISOString(),
        };
        onSave(updatedEntry);

      } else if (statusId) {
        // Pass assigned_to (null for now) if needed by createEntry signature
        const newEntry = await createEntry(collectionId, statusId, submissionValues, null); // Use updated values
        if (newEntry) {
          onSave(newEntry);
        } else {
           throw new Error("Failed to create entry or returned data was null.");
        }
      }
      onClose();
    } catch (err: any) {
      console.error('Save error (incl. upload):', err);
      setError(err.message || 'Failed to save entry.');
    } finally {
      setLoading(false);
    }
  };

  // --- Comment Submit Handler --- 
  const handleCommentSubmit = async () => {
    if (!entry?.id || !newComment.trim()) return;
    setCommentSubmitting(true);
    setCommentsError(null);
    try {
        const created = await createComment(entry.id, newComment);
        if (created) {
            setComments(prev => [...prev, created]); 
            setNewComment('');
        } else {
            throw new Error('Failed to save comment.');
        }
    } catch (err: any) {
        console.error("Error submitting comment:", err);
        setCommentsError(err.message || "Failed to send comment.");
    } finally {
        setCommentSubmitting(false);
    }
  };
  
  // --- Comment Delete Handler --- 
  const handleCommentDelete = async (commentId: string) => {
     if (!confirm('Are you sure you want to delete this comment?')) return;
     
     // Optimistic deletion from UI
     const originalComments = comments;
     setComments(prev => prev.filter(c => c.id !== commentId));
     
     try {
         const success = await deleteComment(commentId);
         if (!success) {
            throw new Error('Failed to delete comment on server.');
         }
         // Success - UI already updated
     } catch (err: any) { 
         console.error("Error deleting comment:", err);
         setCommentsError("Failed to delete comment. Please try again.");
         // Revert optimistic deletion
         setComments(originalComments); 
     }
   };

  if (!isOpen) {
    return null;
  }

  // Sort fields by order for display
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  // Basic Modal Structure (replace with actual modal component later)
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-auto flex flex-col max-h-[90vh]">
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Entry' : 'Create New Entry'}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
          </div>

          {/* Scrollable Content Area (Form + Comments) */}
          <div className="p-6 flex-grow overflow-y-auto space-y-6">
            {/* Form Fields Area */} 
            <div className="space-y-4">
                {sortedFields.map(field => (
                  <div key={field.id}>
                    <Label htmlFor={`field-${field.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      {field.name} {field.required ? <span className="text-red-500">*</span> : ''}
                    </Label>
                    {/* Updated Input Handling */}
                    {field.type === 'text' && (
                      <Input
                        type="text"
                        id={`field-${field.id}`}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                        disabled={loading}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50"
                      />
                    )}
                    {field.type === 'date' && (
                      <Input
                        type="date"
                        id={`field-${field.id}`}
                        value={formValues[field.id] || ''} 
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                        disabled={loading}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50"
                      />
                    )}
                     {field.type === 'select' && (
                      <Select
                          id={`field-${field.id}`}
                          value={formValues[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          required={field.required}
                          disabled={loading}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50"
                      >
                          <option value="">-- Select --</option>
                          {field.options?.map(option => (
                              <option key={option} value={option}>{option}</option>
                          ))}
                      </Select>
                     )}
                     {field.type === 'checkbox' && (
                      <div className="flex items-center h-10">
                       <Checkbox
                           id={`field-${field.id}`}
                           checked={formValues[field.id] === 'true'}
                           onChange={(e) => handleInputChange(field.id, e.target.checked)}
                           disabled={loading}
                           className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-50"/>
                      </div>
                     )}
                     {/* --- File Input --- */} 
                     {field.type === 'file' && (
                        <div>
                             <Input 
                                 type="file"
                                 id={`field-${field.id}`}
                                 onChange={(e) => handleFileChange(field.id, e.target.files ? e.target.files[0] : null)}
                                 required={field.required}
                                 disabled={loading}
                                 className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:pointer-events-none"
                             />
                             {/* Optional: Display existing file URL if editing */}
                             {isEditing && formValues[field.id] && !selectedFiles[field.id] && (
                                 <div className="mt-2 text-sm">
                                     Current file: <a href={formValues[field.id]!} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate inline-block max-w-xs align-bottom">{formValues[field.id]}</a>
                                     {/* TODO: Add option to remove/replace existing file? */}
                                 </div>
                             )}
                             {/* Display selected file name */}
                              {selectedFiles[field.id] && (
                                 <div className="mt-2 text-sm text-gray-600">
                                     Selected: {selectedFiles[field.id]?.name}
                                 </div>
                             )}
                        </div>
                     )}
                    {/* TODO: Add inputs for number, user types */} 

                  </div>
                ))}
                {error && <p className="text-sm text-red-600 mt-2">Error: {error}</p>}
            </div>

             {/* Comments Section (only for existing entries) */} 
            {isEditing && entry && (
                <div className="pt-6 border-t">
                    <h4 className="text-md font-semibold mb-3 text-gray-800">Comments</h4>
                    {commentsLoading && <p className="text-sm text-gray-500">Loading comments...</p>}
                    {commentsError && <p className="text-sm text-red-600">Error: {commentsError}</p>}
                    
                    {/* Comment List */} 
                    <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                       {comments.length === 0 && !commentsLoading && (
                          <p className="text-sm text-gray-500">No comments yet.</p>
                       )}
                       {comments.map(comment => (
                          <div key={comment.id} className="flex items-start space-x-3 group">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                               {comment.user?.name?.charAt(0)?.toUpperCase() || comment.user?.email?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm">
                                    <span className="font-medium text-gray-900">{comment.user?.name || comment.user?.email || 'Unknown User'}</span>
                                    <span className="text-gray-500 text-xs ml-2">{new Date(comment.created_at).toLocaleString()}</span>
                                </p>
                                <p className="text-gray-700 mt-1">{comment.content}</p>
                            </div>
                             {/* Delete Button - Show only for own comments or admin? */} 
                             {(authUser?.id === comment.user_id) && (
                                 <button 
                                    onClick={() => handleCommentDelete(comment.id)}
                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"
                                    title="Delete comment"
                                 >
                                    <Trash2 size={14} />
                                </button>
                             )}
                          </div>
                       ))}
                    </div>

                    {/* New Comment Form */} 
                    <div className="flex items-start space-x-3">
                       <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white">
                           {userProfile?.name?.charAt(0)?.toUpperCase() || authUser?.email?.charAt(0)?.toUpperCase() || '?'}
                       </div>
                       <div className="flex-1">
                           <textarea 
                               rows={2}
                               value={newComment}
                               onChange={(e) => setNewComment(e.target.value)}
                               placeholder="Add a comment..."
                               className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                               disabled={commentSubmitting}
                           />
                           <div className="mt-2 flex justify-end">
                               <Button 
                                   type="button" 
                                   variant="primary"
                                   size="sm"
                                   onClick={handleCommentSubmit}
                                   disabled={!newComment.trim() || commentSubmitting}
                                   loading={commentSubmitting}
                               >
                                  Comment
                               </Button>
                           </div>
                       </div>
                    </div>
                </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end p-6 space-x-2 border-t border-gray-200 rounded-b flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading} loading={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Entry')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntryFormModal; 