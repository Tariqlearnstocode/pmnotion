import React, { useState, useEffect } from 'react';
import { Status, Entry, EntryValue, Field } from '../../types';
import { Plus, MoreHorizontal } from 'lucide-react';
import Button from '../ui/Button';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { updateEntryStatus } from '../../services/entries';

interface KanbanViewProps {
  statuses: Status[];
  entries: Entry[];
  fields: Field[];
  collectionId: string;
  onAddEntry: (statusId: string) => void;
}

interface GroupedEntries {
  [key: string]: Entry[];
}

const KanbanView: React.FC<KanbanViewProps> = ({ 
  statuses, 
  entries, 
  fields, 
  collectionId,
  onAddEntry
}) => {
  const [groupedEntries, setGroupedEntries] = useState<GroupedEntries>(() => 
    entries.reduce((acc, entry) => {
      const statusKey = entry.status_id;
      if (!acc[statusKey]) acc[statusKey] = [];
      acc[statusKey].push(entry);
      return acc;
    }, {} as GroupedEntries)
  );

  useEffect(() => {
    setGroupedEntries(entries.reduce((acc, entry) => {
      const statusKey = entry.status_id;
      if (!acc[statusKey]) acc[statusKey] = [];
      acc[statusKey].push(entry);
      return acc;
    }, {} as GroupedEntries));
  }, [entries]);
  
  const primaryField = fields.find(field => field.type === 'text');
  
  const getEntryValue = (entry: Entry, fieldId: string): string | null => {
    const valueObj = entry.entry_values.find(v => v.field_id === fieldId);
    return valueObj ? valueObj.value : null;
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceStatusId = source.droppableId;
    const destStatusId = destination.droppableId;

    if (destStatusId === sourceStatusId && destination.index === source.index) {
      return;
    }

    // Optimistic UI Update
    const sourceEntries = Array.from(groupedEntries[sourceStatusId] || []);
    const [movedEntry] = sourceEntries.splice(source.index, 1);

    // Update status_id on the moved entry optimistically
    const updatedMovedEntry = { ...movedEntry, status_id: destStatusId };

    const destEntries = Array.from(groupedEntries[destStatusId] || []);
    destEntries.splice(destination.index, 0, updatedMovedEntry);

    const newGroupedEntries = {
      ...groupedEntries,
      [sourceStatusId]: sourceEntries,
      [destStatusId]: destEntries,
    };
    setGroupedEntries(newGroupedEntries);

    // Call API to update status
    try {
      await updateEntryStatus(draggableId, destStatusId);
      // If successful, the optimistic state is correct.
      // Optionally, re-fetch data here for consistency, or rely on eventual consistency.
    } catch (error) {
      console.error("Failed to update entry status:", error);
      // Revert optimistic update on error
      setGroupedEntries(groupedEntries); 
      // Optionally notify parent component of the error
      alert("Failed to move card. Please try again."); // Simple alert for user feedback
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max">
          {statuses.map((status) => (
            <Droppable key={status.id} droppableId={status.id}>
              {(provided) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  className="flex-shrink-0 w-72"
                >
                  <div className="bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
                    <div 
                      className="p-3 border-b font-medium flex justify-between items-center sticky top-0 bg-gray-100 rounded-t-lg z-10"
                      style={{ borderBottomColor: status.color }}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: status.color }}
                        ></div>
                        <h3>{status.name}</h3>
                        <span className="ml-2 text-gray-500 text-sm">
                          {groupedEntries[status.id]?.length || 0}
                        </span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-500">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    
                    <div className="p-2 space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                      {groupedEntries[status.id]?.map((entry, index) => (
                        <Draggable key={entry.id} draggableId={entry.id} index={index}>
                          {(providedCard) => (
                            <div 
                              ref={providedCard.innerRef}
                              {...providedCard.draggableProps}
                              {...providedCard.dragHandleProps}
                              className="bg-white p-3 rounded shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                            >
                              {primaryField && (
                                <h4 className="font-medium mb-2 text-gray-900">
                                  {getEntryValue(entry, primaryField.id) || 'Untitled'}
                                </h4>
                              )}
                              
                              <div className="space-y-1">
                                {fields.slice(0, 3).filter(f => f.id !== primaryField?.id).map((field) => (
                                  <div key={field.id} className="flex items-baseline">
                                    <span className="text-xs text-gray-500 w-1/3">{field.name}:</span>
                                    <span className="text-sm text-gray-700 w-2/3 truncate">
                                      {getEntryValue(entry, field.id) || '-'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
                                Updated {new Date(entry.updated_at).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      <button 
                        className="mt-2 w-full py-2 px-3 border border-dashed border-gray-300 rounded-md text-sm text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center"
                        onClick={() => onAddEntry(status.id)}
                      >
                        <Plus size={16} className="mr-1" />
                        Add card
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Droppable>
          ))}
          
          <div className="flex-shrink-0 w-72 flex items-start pt-10">
            <Button 
              variant="outline" 
              className="w-full"
              icon={<Plus size={16} />}
              disabled
            >
              Add Status
            </Button>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export default KanbanView;