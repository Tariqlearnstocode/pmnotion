import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCollectionById } from '../services/collections'; // Reuse service
import { createEntry } from '../services/entries'; // Reuse service initially
import { Collection, Field, Status } from '../types';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Checkbox } from '../components/ui/Checkbox';
import { Select, SelectTrigger, SelectValue } from '../components/ui/Select';
import Button from '../components/ui/Button';
import { AlertCircle } from 'lucide-react';

// Define FetchedCollection type locally if not shared
type FetchedCollection = Collection & { fields: Field[]; statuses: Status[] };
type FormValues = Record<string, string | null>;

const PublicFormPage: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collection, setCollection] = useState<FetchedCollection | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!collectionId) {
      setError('No collection ID provided.');
      setLoading(false);
      return;
    }

    const fetchCollection = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Security check - is this collection actually public?
        // This might require a dedicated public endpoint or checking a flag on the collection.
        const data = await getCollectionById(collectionId);
        if (!data) {
          throw new Error('Collection not found or not accessible.');
        }
        setCollection(data as FetchedCollection);
        // Initialize form values
        const initialValues: FormValues = {};
        data.fields.forEach((field: Field) => { initialValues[field.id] = null; });
        setFormValues(initialValues);

      } catch (err: any) {
        console.error("Error fetching public form:", err);
        setError(err.message || 'Failed to load form.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();

  }, [collectionId]);

  const handleInputChange = (fieldId: string, value: string | boolean | null) => {
    const finalValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : value;
    setFormValues(prev => ({ ...prev, [fieldId]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collection || !collectionId) return;

    setSubmitStatus('submitting');
    setError(null);

    try {
      // TODO: Adjust createEntry or use a new service function for public submissions
      // It needs to handle anonymous user context (created_by = null?)
      // It assumes RLS policies allow anonymous inserts for this collection.
      
      // TEMP: For now, assume createEntry needs statusId. Use the first one if available.
      const firstStatusId = collection.statuses?.[0]?.id;
      if (!firstStatusId) {
          throw new Error('Collection has no statuses configured for submission.');
      }
      
      // This call might fail without auth unless RLS is configured for anon
      // and createEntry service handles null user.
      const newEntry = await createEntry(collectionId, firstStatusId, formValues, null);
      
      if (!newEntry) {
           throw new Error("Submission failed.");
      }
      
      setSubmitStatus('success');
      setFormValues({}); // Clear form on success

    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'Failed to submit form.');
      setSubmitStatus('error');
    } 
  };

  // --- Render Logic ---
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600">Loading form...</div>;
  }

  if (error && submitStatus !== 'success') {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="max-w-md w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                 <div className="flex">
                   <div className="py-1"><AlertCircle className="h-5 w-5 mr-3"/></div>
                   <div>
                     <p className="font-bold">Error</p>
                     <p className="text-sm">{error}</p>
                   </div>
                 </div>
             </div>
        </div>
    );
  }
  
   if (!collection) {
     // This case might be covered by the error state above, but good to have
     return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600">Form not found.</div>;
   }
   
   // Success Message
   if (submitStatus === 'success') {
       return (
         <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
             <div className="max-w-md w-full bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded shadow-md text-center">
                  <h1 className="text-xl font-semibold mb-3">Submission Received!</h1>
                  <p>Thank you, your response has been recorded.</p>
                  {/* Optional: Link back or allow another submission */}
                  <Button 
                      variant="outline"
                      className="mt-6"
                      onClick={() => setSubmitStatus('idle')} // Allow submitting another
                  >
                     Submit Another Response
                  </Button>
             </div>
         </div>
       );
   }

  // Form Rendering
  const sortedFields = [...collection.fields].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
             {collection.icon && <span className="text-3xl mb-2 inline-block">{collection.icon}</span>}
             <h1 className="text-2xl font-bold text-gray-800">{collection.name}</h1>
             {collection.description && <p className="text-gray-600 mt-2">{collection.description}</p>}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {sortedFields.map(field => (
            <div key={field.id}>
              <Label htmlFor={`field-${field.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                {field.name} {field.required ? <span className="text-red-500">*</span> : ''}
              </Label>
              {field.type === 'text' && (
                <Input
                  type="text"
                  id={`field-${field.id}`}
                  value={formValues[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  disabled={submitStatus === 'submitting'}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                />
              )}
              {field.type === 'date' && (
                  <Input
                    type="date"
                    id={`field-${field.id}`}
                    value={formValues[field.id] || ''} 
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    required={field.required}
                    disabled={submitStatus === 'submitting'}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                  />
              )}
               {field.type === 'select' && (
                  <Select
                      id={`field-${field.id}`}
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      disabled={submitStatus === 'submitting'}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                  >
                      <option value="">-- Select {field.name} --</option>
                      {field.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                      ))}
                  </Select>
               )}
               {field.type === 'checkbox' && (
                  <div className="flex items-center space-x-2 mt-2">
                     <Checkbox 
                        id={`field-${field.id}`} 
                        checked={formValues[field.id] === 'true'}
                        onChange={(e) => handleInputChange(field.id, e.target.checked)}
                        disabled={submitStatus === 'submitting'}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-70"
                     />
                     {/* Label is already above, maybe remove this one or adjust */} 
                     {/* <Label htmlFor={`field-${field.id}`}>Agree</Label> */} 
                  </div>
               )}
              {/* TODO: Add number, file, user inputs if needed for public forms */}
            </div>
          ))}
          
          {submitStatus === 'error' && error && (
              <div className="text-red-600 text-sm p-3 bg-red-50 rounded border border-red-200">
                  {error}
              </div>
          )} 

          <div>
            <Button 
                type="submit" 
                variant="primary" 
                className="w-full justify-center"
                disabled={submitStatus === 'submitting'}
                loading={submitStatus === 'submitting'}
            >
              {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Response'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicFormPage; 