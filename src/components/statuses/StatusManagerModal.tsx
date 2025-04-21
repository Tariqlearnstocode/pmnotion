import React, { useState, useEffect } from 'react';
import { Status } from '../../types';
import Button from '../ui/Button';
import { X, Plus, GripVertical } from 'lucide-react';
// Import necessary service functions
import { 
    createStatuses, 
    updateStatus, 
    deleteStatus, 
    updateStatusOrder 
} from '../../services/collections'; 
// Import DND library if implementing reordering
// import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface StatusManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: string;
  initialStatuses: Status[];
  onSave: () => Promise<void>; // Changed onSave signature - just triggers refetch
}

// Simple state for a status being edited or created
interface EditableStatus extends Partial<Status> {
  name: string; // Name is always required
  color: string;
  order: number;
  isNew?: boolean;
}

// Basic color palette for selection
const defaultColors = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#6B7280', // gray-500
];

const StatusManagerModal: React.FC<StatusManagerModalProps> = ({
  isOpen,
  onClose,
  collectionId,
  initialStatuses,
  onSave, // Now expects no arguments
}) => {
  const [statuses, setStatuses] = useState<EditableStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Store IDs of statuses removed during the session to handle deletion on save
  const [removedStatusIds, setRemovedStatusIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      // Deep copy initial statuses and ensure order is consistent
      const sortedInitial = [...initialStatuses].sort((a, b) => a.order - b.order);
      setStatuses(sortedInitial.map((s, index) => ({ ...s, order: index }))); 
      setRemovedStatusIds(new Set()); // Reset removed IDs on open
      setError(null);
    }
  }, [isOpen, initialStatuses]);

  const handleStatusChange = (index: number, property: keyof EditableStatus, value: any) => {
     setStatuses(currentStatuses => 
       currentStatuses.map((s, i) => i === index ? { ...s, [property]: value } : s)
     );
   };

  const handleAddStatus = () => {
     const newOrder = statuses.length; // Order is just the new length
     setStatuses(currentStatuses => [
       ...currentStatuses,
       {
         name: 'New Status',
         color: defaultColors[newOrder % defaultColors.length], 
         order: newOrder, // Assign order based on position
         isNew: true
       }
     ]);
  };

  // Mark status for deletion on save, or remove immediately if it's new
  const handleRemoveStatus = (index: number) => {
     const statusToRemove = statuses[index];

      if (statuses.length <= 1) { 
          setError("Cannot remove the only status.");
          return;
      }

      if (statusToRemove.id && !statusToRemove.isNew) {
          // Mark existing status for deletion
          setRemovedStatusIds(prev => new Set(prev).add(statusToRemove.id!));
      }
      
      // Remove from local state immediately
      setStatuses(currentStatuses => 
         currentStatuses
           .filter((_, i) => i !== index)
           // Re-assign order after removal
           .map((s, newIndex) => ({ ...s, order: newIndex })) 
      );
      setError(null); 
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    // Ensure orders are sequential based on current array index
    const finalStatuses = statuses.map((s, index) => ({ ...s, order: index }));

    try {
      // 1. Identify New Statuses
      const newStatuses = finalStatuses.filter(s => s.isNew);
      // 2. Identify Updated Statuses (existing ones whose name/color changed)
      const updatedStatuses = finalStatuses.filter(s => 
        !s.isNew && s.id && 
        initialStatuses.some(initial => 
           initial.id === s.id && (initial.name !== s.name || initial.color !== s.color)
        )
      );
      // 3. Identify Order Changes (any existing status whose order property differs from initial)
      const orderUpdates = finalStatuses
         .filter(s => !s.isNew && s.id && initialStatuses.some(initial => initial.id === s.id && initial.order !== s.order))
         .map(s => ({ id: s.id!, order: s.order }));
         
      // 4. Identify Deleted Statuses (use the removedStatusIds set)
      const deletedStatusIds = Array.from(removedStatusIds);

      // --- Execute DB Operations --- 
      // Wrap in Promise.all for potential parallel execution (or sequential if needed)
      
      // Deletions first (to avoid conflicts if renaming/reordering a status to be deleted)
      if (deletedStatusIds.length > 0) {
          console.log("Deleting statuses:", deletedStatusIds);
          await Promise.all(deletedStatusIds.map(id => deleteStatus(id)));
      }
      
      // Creations
      if (newStatuses.length > 0) {
          console.log("Creating statuses:", newStatuses);
          const statusesToCreate = newStatuses.map(({ id, isNew, ...rest }) => rest);
          await createStatuses(collectionId, statusesToCreate);
      }
      
      // Updates (name/color)
      if (updatedStatuses.length > 0) {
          console.log("Updating statuses:", updatedStatuses);
          await Promise.all(updatedStatuses.map(s => updateStatus(s.id!, { name: s.name, color: s.color })));
      }

      // Order Updates (can run separately or combined if your backend handles it)
      if (orderUpdates.length > 0) {
         console.log("Updating status order:", orderUpdates);
         await updateStatusOrder(orderUpdates); 
      }

      // Call the parent's onSave (which should trigger a refetch)
      await onSave(); 
      onClose(); // Close modal on success

    } catch (err: any) {
      console.error("Save statuses error:", err);
      // Specific error for FK violation on delete
      if (err.message?.includes('Cannot delete status: Entries are currently assigned to it')) {
           setError('Cannot delete one or more statuses as they are currently in use by entries.');
      } else {
          setError(err.message || "Failed to save statuses.");
      }
      // Optionally revert state or keep modal open for user to fix
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for DND reordering
  // const onDragEnd = (result: DropResult) => { ... update `statuses` state and order ... };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
         {/* Modal Header */} 
         <div className="flex justify-between items-start p-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Manage Statuses
          </h3>
           <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" onClick={onClose} disabled={loading} aria-label="Close modal">
              <X className="w-5 h-5" />
            </button>
        </div>

        {/* Modal Body */} 
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
           {/* Placeholder for DND list */}
           {statuses.map((status, index) => (
             <div key={status.id || `new-${index}`} className="flex items-center space-x-2 py-2 border-b border-gray-100 last:border-b-0">
                {/* Drag Handle */}
                {/* <div className="cursor-grab text-gray-400"><GripVertical size={18} /></div> */}
               
                {/* Color Picker */}
                <input 
                   type="color" 
                   value={status.color}
                   onChange={(e) => handleStatusChange(index, 'color', e.target.value)}
                   className="h-8 w-10 border border-gray-300 rounded p-0.5"
                   title="Select status color"
                   disabled={loading}
                 />
                {/* Name Input */}
                <input 
                   type="text" 
                   value={status.name}
                   onChange={(e) => handleStatusChange(index, 'name', e.target.value)}
                   placeholder="Status Name" 
                   required
                   className="flex-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                   disabled={loading}
                 />
                {/* Delete Button */}
                <button 
                 type="button" 
                 onClick={() => handleRemoveStatus(index)}
                 disabled={loading || statuses.length <= 1}
                 className="text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                 title="Remove status"
                >
                 <X size={16} />
               </button>
             </div>
           ))}

           <div className="mt-4">
             <Button 
               type="button" 
               variant="outline" 
               onClick={handleAddStatus}
               icon={<Plus size={16} />}
               disabled={loading}
             >
               Add Status
             </Button>
           </div>
           {error && <p className="text-sm text-red-600 mt-2">Error: {error}</p>}
        </div>

        {/* Modal Footer */} 
         <div className="flex items-center justify-end p-6 space-x-2 border-t border-gray-200 rounded-b">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Statuses'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatusManagerModal; 