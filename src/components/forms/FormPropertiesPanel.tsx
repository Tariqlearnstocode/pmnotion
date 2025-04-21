import React, { useState, useEffect } from 'react';
import { FormField } from '../../types/forms';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Checkbox } from '../ui/Checkbox';
import Button from '../ui/Button';
import { Trash2 } from 'lucide-react';

interface FormPropertiesPanelProps {
  selectedField: FormField | null;
  onUpdateField: (updatedField: FormField) => void;
  onRemoveField: (fieldId: string) => void;
}

// Extend FormField to include potential type-specific properties
// Note: These should ideally be part of the main FormField type definition
// if they are to be saved/loaded consistently.
interface EditableFormField extends FormField {
    min?: number;
    max?: number;
    defaultValue?: string;
    helpText?: string;
}

// Panel to edit properties of the selected form field
const FormPropertiesPanel: React.FC<FormPropertiesPanelProps> = ({ 
    selectedField, 
    onUpdateField,
    onRemoveField
}) => {
  // Use the extended type for local state
  const [localField, setLocalField] = useState<EditableFormField | null>(null);

  useEffect(() => {
    // Ensure type compatibility when setting initial state
    setLocalField(selectedField ? { ...(selectedField as EditableFormField) } : null);
  }, [selectedField]);

  // Update handleChange to work with EditableFormField
  const handleChange = (prop: keyof EditableFormField, value: any) => {
    if (!localField) return;
    // Handle number conversion for min/max
    let processedValue = value;
    if ((prop === 'min' || prop === 'max') && value !== '') {
       processedValue = parseInt(value, 10);
       if (isNaN(processedValue)) processedValue = undefined; // Set to undefined if not a valid number
    } else if ((prop === 'min' || prop === 'max') && value === ''){
       processedValue = undefined; // Allow clearing min/max
    }
    
    const updated = { ...localField, [prop]: processedValue };
    setLocalField(updated);
    onUpdateField(updated as FormField); // Pass back the base FormField type
  };

  const handleCheckboxChange = (prop: keyof EditableFormField, event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(prop, event.target.checked);
  };
  
  const handleRemove = () => {
     if (localField?.id) {
       onRemoveField(localField.id);
     }
   };

  if (!localField) {
    return (
      <aside className="w-72 bg-white p-4 rounded shadow flex-shrink-0">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Properties</h2>
        <div className="text-center text-gray-500 pt-4">
          Select a field on the canvas to edit its properties.
        </div>
      </aside>
    );
  }

  // Render specific properties based on field type later
  return (
    <aside className="w-72 bg-white p-4 rounded shadow flex-shrink-0 overflow-y-auto">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
         <h2 className="text-lg font-semibold">Properties</h2>
         <Button 
            variant="danger"
            size="sm" 
            onClick={handleRemove} 
            icon={<Trash2 size={14}/>}
            title="Remove Field"
         > 
            Remove
         </Button>
      </div>
       
      <div className="space-y-4">
        {/* Common Properties */}
        <div>
          <Label htmlFor={`prop-${localField.id}-label`}>Label</Label>
          <Input 
            id={`prop-${localField.id}-label`} 
            value={localField.label || ''} 
            onChange={(e) => handleChange('label', e.target.value)} 
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`prop-${localField.id}-placeholder`}>Placeholder</Label>
          <Input 
            id={`prop-${localField.id}-placeholder`} 
            value={localField.placeholder || ''} 
            onChange={(e) => handleChange('placeholder', e.target.value)} 
            className="mt-1"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id={`prop-${localField.id}-required`}
            checked={localField.required || false} 
            onChange={(e) => handleCheckboxChange('required', e)}
          />
          <Label htmlFor={`prop-${localField.id}-required`}>Required</Label>
        </div>
        
        {/* Default Value (Relevant for Text, Number, Date, Select?) */} 
        {['text', 'number', 'date', 'select'].includes(localField.type) && (
           <div>
             <Label htmlFor={`prop-${localField.id}-defaultValue`}>Default Value</Label>
             <Input 
                id={`prop-${localField.id}-defaultValue`} 
                type={localField.type === 'date' ? 'date' : 'text'} // Use text for select/number default
                value={localField.defaultValue || ''} 
                onChange={(e) => handleChange('defaultValue', e.target.value)} 
                className="mt-1"
               />
           </div>
        )}
        
        {/* Help Text */}
        <div>
          <Label htmlFor={`prop-${localField.id}-helpText`}>Help Text</Label>
          <textarea 
            id={`prop-${localField.id}-helpText`} 
            rows={2} 
            value={localField.helpText || ''} 
            onChange={(e) => handleChange('helpText', e.target.value)} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
            placeholder="Optional instructions for the user"
           />
        </div>

        <hr className="my-4"/> 
        
        {/* Type-specific properties (e.g., options for select) */} 
        {localField.type === 'select' && (
             <div>
               <Label htmlFor={`prop-${localField.id}-options`}>Options (one per line)</Label>
               <textarea
                 id={`prop-${localField.id}-options`}
                 rows={3}
                 value={localField.options?.join('\n') || ''}
                 onChange={(e) => handleChange('options', e.target.value.split('\n'))}
                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                 placeholder="Option 1\nOption 2"
               />
             </div>
           )}

        {/* Number Min/Max */} 
        {localField.type === 'number' && (
            <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor={`prop-${localField.id}-min`}>Min Value</Label>
                   <Input 
                     id={`prop-${localField.id}-min`} 
                     type="number"
                     // Use empty string for undefined/null to clear input
                     value={localField.min ?? ''} 
                     onChange={(e) => handleChange('min', e.target.value)} 
                     className="mt-1"
                    />
                 </div>
                 <div>
                   <Label htmlFor={`prop-${localField.id}-max`}>Max Value</Label>
                   <Input 
                     id={`prop-${localField.id}-max`} 
                     type="number"
                     value={localField.max ?? ''} 
                     onChange={(e) => handleChange('max', e.target.value)} 
                     className="mt-1"
                    />
                 </div>
             </div>
        )}

        {/* Display Field ID (for debugging) */} 
        <div className="pt-4 border-t mt-4">
            <p className="text-xs text-gray-500">Field ID: {localField.id}</p>
            <p className="text-xs text-gray-500">Field Type: {localField.type}</p>
        </div>

      </div>
    </aside>
  );
};

export default FormPropertiesPanel; 