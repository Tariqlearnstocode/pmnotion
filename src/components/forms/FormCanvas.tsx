import React, { useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { FormField } from '../../types/forms';
import { ItemTypes } from './FormFieldPalette'; // Import item type
import FormFieldRenderer from './FormFieldRenderer'; // Component to render individual fields
import update from 'immutability-helper'; // Utility for immutable updates

interface FormCanvasProps {
  fields: FormField[];
  setFields: React.Dispatch<React.SetStateAction<FormField[]>>; // Pass setter directly
  onDropField: (item: Omit<FormField, 'id'>) => void;
  onSelectField: (field: FormField) => void;
  removeField: (id: string) => void; // Pass remove function down
  selectedFieldId?: string | null;
}

// Represents the area where fields are dropped and arranged
const FormCanvas: React.FC<FormCanvasProps> = ({ 
    fields, 
    setFields, // Receive setter
    onDropField, 
    onSelectField,
    removeField, // Receive remove function
    selectedFieldId
}) => {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.FORM_FIELD,
    drop: (item: Omit<FormField, 'id'> | { id: string, index: number, type: string }, monitor) => {
        // Check if the dropped item originated from the palette (no id/index) or the canvas
        const didDrop = monitor.didDrop();
        if (didDrop) { // Prevent dropping on nested targets (like FormFieldRenderer)
            return;
        }
        
        // Only handle drops from the palette here; reordering is handled by FormFieldRenderer's hover
        if (!(item as any).id) { 
            onDropField(item as Omit<FormField, 'id'>);
        }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }), // Use shallow for top-level drop zone
      canDrop: monitor.canDrop(),
    }),
  }));

  // Function to handle moving/reordering fields within the canvas
  const moveField = useCallback((dragIndex: number, hoverIndex: number) => {
    setFields((prevFields: FormField[]) =>
      update(prevFields, {
        $splice: [
          [dragIndex, 1], // Remove field from original position
          [hoverIndex, 0, prevFields[dragIndex] as FormField], // Insert field at new position
        ],
      }),
    );
  }, [setFields]);

  const isActive = canDrop && isOver;
  let dropZoneBg = 'bg-white';
  if (isActive) {
    dropZoneBg = 'bg-blue-100';
  } else if (canDrop) {
    // Optional: subtle indication that dropping is possible but not active
    // dropZoneBg = 'bg-gray-50'; 
  }

  return (
    <section 
      ref={drop} // Attach the drop target ref
      className={`flex-1 p-6 rounded shadow overflow-y-auto ${dropZoneBg}`}
    >
      <h2 className="text-xl font-semibold mb-6 border-b pb-2">Form Canvas</h2>
      <div className="min-h-[400px] border-2 border-dashed border-gray-300 rounded p-4 space-y-3">
        {fields.length === 0 && (
          <p className="text-center text-gray-500">
            {isActive ? 'Release to drop' : 'Drag fields here to build your form'}
          </p>
        )}
        {fields.map((field, index) => (
          <FormFieldRenderer 
            key={field.id} 
            index={index} // Pass index
            field={field} 
            onClick={() => onSelectField(field)}
            isSelected={field.id === selectedFieldId}
            moveField={moveField} // Pass move handler
            removeField={removeField} // Pass remove handler
          />
        ))}
      </div>
    </section>
  );
};

export default FormCanvas; 