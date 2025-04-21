import React from 'react';
import { Field, Entry } from '../../types';

interface TableViewProps {
  fields: Field[];
  entries: Entry[];
  // Add props for sorting, filtering, actions later
}

const TableView: React.FC<TableViewProps> = ({ fields, entries }) => {

  // Function to get the display value for an entry and field
  const getDisplayValue = (entry: Entry, field: Field): string => {
    const entryValue = entry.entry_values.find(ev => ev.field_id === field.id);
    let value = entryValue?.value ?? '-'; // Default to '-' if no value

    // Format based on field type (optional refinements)
    switch (field.type) {
      case 'date':
        try {
          value = value !== '-' ? new Date(value).toLocaleDateString() : '-';
        } catch (e) {
          value = 'Invalid Date';
        }
        break;
      case 'checkbox':
        value = value === 'true' ? 'Yes' : 'No';
        break;
      // Add formatting for file, user, number, select as needed
      default:
        break;
    }
    return value;
  };

  // Sort fields by their order property for column display
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {sortedFields.map((field) => (
                <th 
                  key={field.id} 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {field.name}
                </th>
              ))}
               {/* Optional: Add column for actions */}
               {/* <th scope="col" className="relative px-6 py-3">
                 <span className="sr-only">Actions</span>
               </th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={sortedFields.length} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No entries found.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  {sortedFields.map((field) => (
                    <td 
                      key={`${entry.id}-${field.id}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                    >
                      {/* Render the value - add links/previews for file/user later */}
                      {getDisplayValue(entry, field)}
                    </td>
                  ))}
                  {/* Optional: Add cell for actions */}
                  {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableView; 