import React, { useRef } from 'react';
import { useDrag, useDrop, XYCoord } from 'react-dnd';
import { FormField } from '../../types/forms';
import { Input } from '../ui/Input'; // Correct path
import { Label } from '../ui/Label'; // Correct path
import { Checkbox } from '../ui/Checkbox'; // Correct path
import { Select, SelectTrigger, SelectValue } from '../ui/Select'; // Correct path
import { GripVertical, Trash2 } from 'lucide-react';
import { ItemTypes } from './FormFieldPalette';

// Define the type for the dragged item within the canvas
interface CanvasFieldDragItem {
  id: string;
  index: number;
  type: string; // Ensure type is FORM_FIELD for canvas items too
}

interface FormFieldRendererProps {
  field: FormField;
  index: number; // Need index for reordering
  onClick: () => void;
  isSelected: boolean;
  moveField: (dragIndex: number, hoverIndex: number) => void; // Function to handle reorder
  removeField: (id: string) => void; // Add remove function
}

// Renders a single field on the canvas based on its type
const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({ 
    field, 
    index,
    onClick,
    isSelected, 
    moveField,
    removeField
}) => {
  const ref = useRef<HTMLDivElement>(null); // Ref for the entire draggable element

  // --- Drop Target Logic (for reordering) ---
  const [{ handlerId }, drop] = useDrop<CanvasFieldDragItem, void, { handlerId: string | symbol | null }>({
    accept: ItemTypes.FORM_FIELD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(), // Unique ID for the drop target instance
      };
    },
    hover(item: CanvasFieldDragItem, monitor) {
      if (!ref.current || !item.id) return;
      
      // We only care about reordering items already on the canvas
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      // Time to actually perform the action
      moveField(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // This is generally discouraged, but here it avoids flickering and searching.
      item.index = hoverIndex;
    },
  });

  // --- Drag Source Logic --- 
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: ItemTypes.FORM_FIELD,
    // Item includes id and original index for reordering logic
    item: () => ({ id: field.id, index, type: ItemTypes.FORM_FIELD }), // Ensure type is set for canvas items
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Attach drag and drop refs to the same div
  drag(drop(ref)); 

  const opacity = isDragging ? 0.4 : 1; // Style for dragging state
  const baseClasses = "p-3 border rounded cursor-pointer transition-colors duration-150 relative group";
  const selectedClasses = isSelected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300" : "border-gray-300 bg-white hover:bg-gray-50";

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'date': // Treat date like text for now
      case 'user': // Treat user like text for now
      case 'file': // Treat file like text for now
        return (
          <div>
            <Label htmlFor={field.id}>{field.label}{field.required && '*'}</Label>
            <Input 
              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} 
              id={field.id} 
              placeholder={field.placeholder || ''} 
              readOnly // Make inputs read-only on the canvas
              className="mt-1 bg-white pointer-events-none" // Prevent interaction
            />
          </div>
        );
      case 'select':
        return (
          <div>
            <Label htmlFor={field.id}>{field.label}{field.required && '*'}</Label>
             <Select disabled> {/* Disable Select on canvas */} 
               <SelectTrigger id={field.id} className="w-full mt-1 bg-white pointer-events-none">
                 <SelectValue placeholder={field.placeholder || 'Select...'} />
               </SelectTrigger>
             </Select>
          </div>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox id={field.id} disabled className="pointer-events-none" />
            <Label htmlFor={field.id} className="mb-0">
              {field.label}{field.required && '*'}
            </Label>
          </div>
        );
      default:
        return <p>Unsupported field type: {field.type}</p>;
    }
  };

  return (
    <div 
      ref={ref} // Use the combined ref here
      className={`${baseClasses} ${selectedClasses}`}
      style={{ opacity }}
      onClick={onClick} // Still allow selecting by clicking the main body
      data-handler-id={handlerId} // Important for DND backend
    >
       {/* Drag Handle Area (covers left side) */} 
      <div 
          ref={drag} // Attach drag source specifically to the handle
          className="absolute top-0 left-0 bottom-0 w-6 flex items-center justify-center cursor-grab text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
      > 
         <GripVertical size={18} />
      </div>
      
       {/* Remove Button */} 
      <button 
         onClick={(e) => { e.stopPropagation(); removeField(field.id); }} 
         className="absolute top-1 right-1 p-1 rounded text-gray-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
         title="Remove field"
      >
          <Trash2 size={14}/>
      </button>
      
       {/* Content Area (with padding to avoid handle/button) */} 
      <div className="pl-7 pr-7" ref={dragPreview}> {/* Use dragPreview for the visual feedback */} 
          {renderField()}
      </div>
    </div>
  );
};

export default FormFieldRenderer; 