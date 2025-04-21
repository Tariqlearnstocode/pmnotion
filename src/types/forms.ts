import { Field as CollectionField } from './index'; // Import base Field type

// Define allowed field types for the Form Builder
export type FormFieldType = CollectionField['type']; 

// Interface for a field within the form builder canvas
export interface FormField {
  id: string; // Unique identifier for the field on the canvas
  type: FormFieldType;
  label: string; // Display name for the field
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select type
  // Add other common properties like defaultValue, helpText, etc.
  // We might need specific properties per type later
} 