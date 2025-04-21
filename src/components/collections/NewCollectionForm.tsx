import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { Collection, Field } from '../../types';
import { Card, CardContent, CardHeader, CardFooter } from '../ui/Card';
import { Kanban, Table, Calendar, X, Plus } from 'lucide-react';
import { createCollection, createFields } from '../../services/collections';

// Define the allowed field types based on the Field interface
type FieldType = Field['type'];

const NewCollectionForm: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📋');
  const [viewType, setViewType] = useState<'kanban' | 'table' | 'calendar'>('kanban');
  // Use the specific FieldType for the state
  const [fields, setFields] = useState<Array<{name: string; type: FieldType}>>([
    { name: 'Title', type: 'text' }
  ]);
  const [newFieldName, setNewFieldName] = useState('');
  // Use the specific FieldType for the state
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newCollectionData: Omit<Collection, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'fields' | 'statuses'> = {
        name,
        description: description || null,
        icon,
        viewType: viewType,
      };
      const createdCollection = await createCollection(newCollectionData);

      if (!createdCollection || !createdCollection.id) {
        throw new Error('Failed to create collection or get its ID.');
      }

      const fieldsToCreate: Omit<Field, 'id' | 'collectionId' | 'createdAt'>[] = fields.map((field, index) => ({
        name: field.name,
        type: field.type,
        options: field.type === 'select' ? [] : undefined,
        required: index === 0,
        order: index,
      }));

      await createFields(createdCollection.id, fieldsToCreate);
      
      navigate(`/collections/${createdCollection.id}`);

    } catch (err: any) {
      console.error('Failed to create collection:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const addField = () => {
    if (newFieldName.trim() === '') return;
    if (fields.some(f => f.name.toLowerCase() === newFieldName.trim().toLowerCase())) {
        setError(`Field "${newFieldName.trim()}" already exists.`);
        return;
    }
    setError(null);
    // Type is correctly FieldType here
    setFields([...fields, { name: newFieldName.trim(), type: newFieldType }]);
    setNewFieldName('');
    setNewFieldType('text');
  };
  
  const removeField = (index: number) => {
    if (index === 0) return;
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b">
            <h2 className="text-xl font-semibold text-gray-900">Create a new collection</h2>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Collection Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., Maintenance Requests"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <textarea
                id="description"
                value={description ?? ''} // Handle null for textarea value
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="What will this collection be used for?"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                View Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  disabled={loading}
                  className={`flex flex-col items-center p-4 border rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${viewType === 'kanban' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => !loading && setViewType('kanban')}
                >
                  <Kanban className={`h-8 w-8 ${viewType === 'kanban' ? 'text-blue-500' : 'text-gray-500'}`} />
                  <span className="mt-2 text-sm font-medium">Kanban</span>
                </button>
                
                <button
                  type="button"
                  disabled={loading}
                  className={`flex flex-col items-center p-4 border rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${viewType === 'table' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => !loading && setViewType('table')}
                >
                  <Table className={`h-8 w-8 ${viewType === 'table' ? 'text-blue-500' : 'text-gray-500'}`} />
                  <span className="mt-2 text-sm font-medium">Table</span>
                </button>
                
                <button
                  type="button"
                  disabled={loading}
                  className={`flex flex-col items-center p-4 border rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${viewType === 'calendar' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => !loading && setViewType('calendar')}
                >
                  <Calendar className={`h-8 w-8 ${viewType === 'calendar' ? 'text-blue-500' : 'text-gray-500'}`} />
                  <span className="mt-2 text-sm font-medium">Calendar</span>
                </button>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Fields <span className="text-red-500 text-xs">* 'Title' required</span>
                </label>
              </div>
              
              <div className="space-y-2 mb-4">
                {fields.map((field, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{field.name}</span>
                      <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                        {field.type}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeField(index)}
                      disabled={index === 0 || loading}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="New field name"
                    disabled={loading}
                  />
                </div>
                <div className="w-32">
                  <select
                    value={newFieldType}
                    // Cast the value to FieldType on change
                    onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    disabled={loading}
                  >
                    {/* Dynamically generate options if needed, or keep static */}
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                    <option value="date">Date</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="file">File</option>
                    <option value="number">Number</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addField}
                  icon={<Plus className="h-4 w-4" />}
                  disabled={loading || !newFieldName.trim()}
                >
                  Add
                </Button>
              </div>
              {error && fields.some(f => f.name.toLowerCase() === newFieldName.trim().toLowerCase()) && newFieldName.trim() !== '' && (
                 <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex-1 mr-4">
                {error && !fields.some(f => f.name.toLowerCase() === newFieldName.trim().toLowerCase()) && (
                    <p className="text-sm text-red-600">Error: {error}</p>
                )}
             </div>
            <div>
                <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
                >
                Cancel
                </Button>
                <Button type="submit" variant="primary" className="ml-2" disabled={loading || !name.trim()} >
                    {loading ? 'Creating...' : 'Create Collection'}
                </Button>
             </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default NewCollectionForm;