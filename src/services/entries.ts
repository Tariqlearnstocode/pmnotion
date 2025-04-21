import { supabase } from '../lib/supabaseClient';
import type { Entry, EntryValue } from '../types';

// Function to fetch entries for a specific collection
export async function getEntriesByCollectionId(collectionId: string): Promise<Entry[]> {
  if (!collectionId) {
    console.warn('getEntriesByCollectionId called without collectionId');
    return [];
  }

  const { data, error } = await supabase
    .from('entries')
    .select(`
      id,
      collection_id,
      status_id, 
      created_by, 
      assigned_to,
      created_at,
      updated_at,
      entry_values (
        id,
        entry_id,
        field_id,
        value
      )
    `)
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: false }); // Or order as needed for display

  if (error) {
    console.error('Error fetching entries:', error);
    throw error;
  }

  // TODO: Adjust the return type and mapping based on the actual Entry type definition and joined user data
  return (data || []) as Entry[]; 
}

// Function to update the status of a single entry
export async function updateEntryStatus(entryId: string, newStatusId: string): Promise<Entry | null> {
  if (!entryId || !newStatusId) {
    console.error('updateEntryStatus called with missing entryId or newStatusId');
    return null;
  }

  const { data, error } = await supabase
    .from('entries')
    .update({ 
      status_id: newStatusId,
      // updated_at is handled by the trigger
    })
    .eq('id', entryId)
    .select('*') // Select the updated entry
    .single(); // Expect only one row to be updated

  if (error) {
    console.error(`Error updating status for entry ${entryId}:`, error);
    throw error;
  }

  return data as Entry | null;
}

// Type for the values data passed to create/update functions
// Using a Record (object map) from fieldId -> value
type EntryValuesData = Record<string, string | null>;

// Function to create a new entry and its values
export async function createEntry(
  collectionId: string, 
  statusId: string, 
  values: EntryValuesData,
  assignedTo?: string | null
): Promise<Entry | null> {
  
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  // 1. Create the entry
  const { data: newEntry, error: entryError } = await supabase
    .from('entries')
    .insert({
      collection_id: collectionId,
      status_id: statusId,
      created_by: userId,
      assigned_to: assignedTo || null,
    })
    .select()
    .single();

  if (entryError || !newEntry) {
    console.error('Error creating entry:', entryError);
    throw entryError || new Error('Failed to create entry');
  }

  // 2. Prepare and create the entry values
  const valuesToInsert = Object.entries(values)
    .filter(([_, value]) => value !== null && value !== undefined) // Filter out null/undefined values if needed
    .map(([fieldId, value]) => ({
      entry_id: newEntry.id,
      field_id: fieldId,
      value: value,
    }));

  if (valuesToInsert.length > 0) {
      const { error: valuesError } = await supabase
        .from('entry_values')
        .insert(valuesToInsert);

      if (valuesError) {
        console.error('Error creating entry values:', valuesError);
        // Optional: Attempt to delete the orphaned entry if values fail?
        // await deleteEntry(newEntry.id); 
        throw valuesError; 
      }
  }
  
  // Refetch the entry with its values to return the complete object
  // (Alternatively, construct the object manually if preferred)
  const { data: completeEntry, error: fetchError } = await supabase
    .from('entries')
    .select(`*, entry_values(*)`) // Ensure select matches getEntriesByCollectionId
    .eq('id', newEntry.id)
    .single();

  if (fetchError) {
    console.error('Error refetching created entry:', fetchError);
    // Return the basic entry even if refetch fails
    return newEntry as Entry;
  }

  return completeEntry as Entry | null;
}

// Function to update entry values (can be extended to update entry fields like assigned_to)
export async function updateEntryValues(
  entryId: string, 
  values: EntryValuesData
): Promise<EntryValue[]> {

  // This is complex: need to figure out which values are new, updated, or deleted.
  // A common approach is to delete all existing values for the entry and insert the new ones.
  // This is simpler but less efficient.
  // For now, let's implement an upsert approach.

  const valuesToUpsert = Object.entries(values)
     .filter(([_, value]) => value !== null && value !== undefined) // Handle nulls as needed
     .map(([fieldId, value]) => ({
      entry_id: entryId,
      field_id: fieldId,
      value: value,
    }));

  if (valuesToUpsert.length === 0) {
    // Maybe delete all existing values if the intention is to clear them?
    // Or just return empty array if no values to upsert.
    return [];
  }

  const { data, error } = await supabase
    .from('entry_values')
    .upsert(valuesToUpsert, { onConflict: 'entry_id, field_id' }) // Assumes unique constraint
    .select();

  if (error) {
    console.error(`Error upserting entry values for entry ${entryId}:`, error);
    throw error;
  }

  // TODO: Handle deletion of values for fields NOT present in the `values` object if needed.

  return (data || []) as EntryValue[];
}

// Function to delete an entry (will cascade delete entry_values via DB constraint)
export async function deleteEntry(entryId: string): Promise<boolean> {
  if (!entryId) {
     console.error('deleteEntry called without entryId');
     return false;
   }
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', entryId);

  if (error) {
    console.error(`Error deleting entry ${entryId}:`, error);
    throw error;
  }

  return true; // Return true on successful deletion (no error)
}

// Add functions for createEntry, updateEntry, deleteEntry later... 