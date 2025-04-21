import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import Header from '../components/layout/Header';
// Import DND provider and backend
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FormFieldPalette from '../components/forms/FormFieldPalette';
import FormCanvas from '../components/forms/FormCanvas';
import FormPropertiesPanel from '../components/forms/FormPropertiesPanel';
import { FormField } from '../types/forms'; // Assuming a type for form fields

const FormBuilderPage: React.FC = () => {
  // State to hold the fields currently on the canvas
  const [canvasFields, setCanvasFields] = useState<FormField[]>([]);
  // State to hold the currently selected field for the properties panel
  const [selectedField, setSelectedField] = useState<FormField | null>(null);

  // Function to add a field to the canvas (called on drop)
  const addFieldToCanvas = (field: Omit<FormField, 'id'>) => {
    console.log("Adding field:", field);
    const newField: FormField = {
      ...field,
      id: `${field.type}-${Date.now()}` // Simple unique ID generation for now
    };
    setCanvasFields(prevFields => [...prevFields, newField]);
    setSelectedField(newField); // Select the newly added field
  };

  // Function to update a field on the canvas (called from properties panel)
  const updateFieldOnCanvas = (updatedField: FormField) => {
    setCanvasFields(prevFields => 
        prevFields.map(f => f.id === updatedField.id ? updatedField : f)
    );
     setSelectedField(updatedField); // Keep the updated field selected
  };
  
  // Function to remove a field from the canvas
  const removeFieldFromCanvas = (fieldId: string) => {
     setCanvasFields(prevFields => prevFields.filter(f => f.id !== fieldId));
     if (selectedField?.id === fieldId) {
       setSelectedField(null); // Deselect if the removed field was selected
     }
   };
   
   // Function to handle selecting a field on the canvas
   const handleSelectField = (field: FormField) => {
     setSelectedField(field);
   };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <main className="flex-1 flex p-4 gap-4 overflow-hidden">
          {/* Pass field types to the palette */}
          <FormFieldPalette /> 

          {/* Pass canvas state and handlers */}
          <FormCanvas 
            fields={canvasFields} 
            onDropField={addFieldToCanvas} 
            onSelectField={handleSelectField}
            selectedFieldId={selectedField?.id}
          />

          {/* Pass selected field and update handler */}
          <FormPropertiesPanel 
            selectedField={selectedField} 
            onUpdateField={updateFieldOnCanvas}
            onRemoveField={removeFieldFromCanvas}
          />
        </main>
      </div>
    </DndProvider>
  );
};

export default FormBuilderPage; 