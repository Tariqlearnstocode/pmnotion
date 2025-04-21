import React from 'react';
import { useDrag } from 'react-dnd';
import { FormFieldType } from '../../types/forms';

// Define item types for DND
export const ItemTypes = {
  FORM_FIELD: 'formField',
};

interface PaletteItemProps {
  type: FormFieldType;
  label: string;
}

// Represents a draggable field type in the palette
const DraggablePaletteItem: React.FC<PaletteItemProps> = ({ type, label }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FORM_FIELD,
    // The item being dragged: contains the essential info to create the field
    item: { type, label }, 
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag} // Attach the drag source ref
      className={`p-2 border rounded bg-gray-50 cursor-grab ${isDragging ? 'opacity-50 ring-2 ring-blue-400' : ''}`}
    >
      {label}
    </div>
  );
};

// The main palette component
const FormFieldPalette: React.FC = () => {
  // Define the available field types
  const fieldTypes: PaletteItemProps[] = [
    { type: 'text', label: 'Text Input' },
    { type: 'select', label: 'Select Dropdown' },
    { type: 'date', label: 'Date Picker' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'file', label: 'File Upload' },
    { type: 'number', label: 'Number Input' },
    { type: 'user', label: 'User Select' },
  ];

  return (
    <aside className="w-64 bg-white p-4 rounded shadow flex-shrink-0">
      <h2 className="text-lg font-semibold mb-4">Fields</h2>
      <div className="space-y-2">
        {fieldTypes.map((field) => (
          <DraggablePaletteItem key={field.type} type={field.type} label={field.label} />
        ))}
      </div>
    </aside>
  );
};

export default FormFieldPalette; 