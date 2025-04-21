import React, { useState, useEffect } from 'react';
import { Field } from '../../types';
import Button from '../ui/Button';
import { X, Plus, GripVertical } from 'lucide-react';
// Import DND library if implementing reordering
// import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface FieldManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: string;
  initialFields: Field[];
  // Callback when fields are saved
  onSave: (updatedFields: Field[]) => Promise<void>; // Make it async to handle saving
}

type FieldType = Field['type'];

// Simple state for a field being edited or created
interface EditableField extends Partial<Field> {
  name: string; // Name is always required
  type: FieldType;
  order: number;
  isNew?: boolean; // Flag for new fields
}

const FieldManagerModal: React.FC<FieldManagerModalProps> = ({
  isOpen,
  onClose,
  collectionId,
  initialFields,
  onSave,
}) => {
  const [fields, setFields] = useState<EditableField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize editable fields state when modal opens or initial fields change
  useEffect(() => {
    if (isOpen) {
      setFields(initialFields.map(f => ({ ...f }))); // Create copies
      setError(null); // Reset error on open
    }
  }, [isOpen, initialFields]);

  const handleFieldChange = (id: string | undefined, property: keyof EditableField, value: any) => {
     // Find by id for existing, or maybe use index for new ones without id yet?
     // This logic needs refinement if handling new fields directly in the list.
     // For now, assume we only edit existing fields or add via a separate mechanism.
     setFields(currentFields => 
       currentFields.map(f => f.id === id ? { ...f, [property]: value } : f)
     );
   };

  const handleAddField = () => {
    // Placeholder: Add a new field row
    console.log("TODO: Add new field row logic");
     const newOrder = fields.length > 0 ? Math.max(...fields.map(f => f.order)) + 1 : 0;
     setFields(currentFields => [
       ...currentFields,
       {
         // id will be assigned by the database
         name: 'New Field',
         type: 'text',
         order: newOrder,
         required: false,
         isNew: true // Flag it as new
       }
     ]);
  };

  const handleRemoveField = (fieldId: string | undefined, index: number) => {
    // Placeholder: Remove field
    console.log("TODO: Remove field logic", fieldId);
    // Prevent removing the first field (assuming it's required like 'Title')
    if (index === 0) {
        setError("Cannot remove the first field.");
        return;
    }
    setFields(currentFields => currentFields.filter((f, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    console.log("TODO: Implement saving fields", fields);
    // 1. Identify new fields (isNew flag)
    // 2. Identify updated fields (compare with initialFields)
    // 3. Identify deleted fields (compare initialFields with current fields)
    // 4. Update field orders if reordering is implemented
    // 5. Call service functions (createFields, updateField, deleteField, updateFieldOrder)
    try {
      // --- Placeholder save logic --- 
      // Assume fields state represents the desired final state
      // This simple version just calls the onSave callback for now
      // A real implementation needs to call the specific service functions.
      alert("Saving fields is not fully implemented yet!");
      // await onSave(fields as Field[]); // Pass the updated fields back (needs type assertion)
      // onClose(); // Close on success
      // --- End Placeholder --- 
    } catch (err: any) {
      console.error("Save fields error:", err);
      setError(err.message || "Failed to save fields.");
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for DND reordering
  // const onDragEnd = (result: DropResult) => {
  //   if (!result.destination) return;
  //   const items = Array.from(fields);
  //   const [reorderedItem] = items.splice(result.source.index, 1);
  //   items.splice(result.destination.index, 0, reorderedItem);
  //   // Update order property for all items
  //   const updatedItems = items.map((item, index) => ({ ...item, order: index }));
  //   setFields(updatedItems);
  // };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-start p-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Manage Fields
          </h3>
           <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              onClick={onClose}
              disabled={loading}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Add DND Context here if implementing reordering */} 
          {/* <DragDropContext onDragEnd={onDragEnd}> */} 
          {/* <Droppable droppableId="fields"> */} 
          {/* {(provided) => ( */} 
          {/* <div {...provided.droppableProps} ref={provided.innerRef}> */} 
          {fields.map((field, index) => (
             // Add Draggable wrapper here if implementing reordering
             // <Draggable key={field.id || `new-${index}`} draggableId={field.id || `new-${index}`} index={index}> 
             // {(providedDraggable) => (
             <div 
                key={field.id || `new-${index}`}
                // ref={providedDraggable.innerRef}
                // {...providedDraggable.draggableProps}
                className="flex items-center space-x-2 py-2 border-b border-gray-100 last:border-b-0"
             >
               {/* Drag Handle Placeholder */}
               {/* <div {...providedDraggable.dragHandleProps} className="cursor-grab text-gray-400">
                 <GripVertical size={18} />
               </div> */}
               
                {/* Field Name Input */}
               <div className="flex-1">
                 <input 
                   type="text" 
                   value={field.name}
                   onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)}
                   placeholder="Field Name" 
                   required
                   className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                 />
               </div>
                {/* Field Type Select */}
               <div className="w-36">
                  <select
                    value={field.type}
                    onChange={(e) => handleFieldChange(field.id, 'type', e.target.value as FieldType)}
                    className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                   > 
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                    <option value="date">Date</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="file">File</option>
                    <option value="number">Number</option>
                    <option value="user">User</option>
                   </select>
               </div>
               {/* Required Checkbox */}
                <div className="flex items-center space-x-2">
                   <input 
                     type="checkbox" 
                     id={`required-${field.id || index}`}
                     checked={field.required || false}
                     onChange={(e) => handleFieldChange(field.id, 'required', e.target.checked)}
                     className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                   />
                   <label htmlFor={`required-${field.id || index}`} className="text-sm text-gray-600">Required</label>
                 </div>
               {/* Delete Button */}
               <button 
                 type="button" 
                 onClick={() => handleRemoveField(field.id, index)}
                 disabled={index === 0} // Disable deleting first field
                 className="text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed p-1"
               >
                 <X size={16} />
               </button>
             </div>
              // )} 
             // </Draggable>
          ))}
           {/* {provided.placeholder} */} 
           {/* </div> */} 
           {/* )} */} 
           {/* </Droppable> */} 
           {/* </DragDropContext> */} 
          
           <div className="mt-4">
             <Button 
               type="button" 
               variant="outline" 
               onClick={handleAddField}
               icon={<Plus size={16} />}
               disabled={loading}
             >
               Add Field
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
            {loading ? 'Saving...' : 'Save Fields'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FieldManagerModal; 