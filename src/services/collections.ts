import { supabase } from '../lib/supabaseClient';
import type { Collection, Field, Status } from '../types';
import type { FormField } from '../types/forms';

export async function getCollections() {
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      fields:fields(*),
      statuses:statuses(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createCollection(collection: Omit<Collection, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabase
    .from('collections')
    .insert([{
      ...collection,
      owner_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createFields(collectionId: string, fields: Omit<Field, 'id' | 'collectionId'>[]) {
  const { data, error } = await supabase
    .from('fields')
    .insert(
      fields.map(field => ({
        ...field,
        collection_id: collectionId
      }))
    )
    .select();

  if (error) throw error;
  return data;
}

export async function createStatuses(collectionId: string, statuses: Omit<Status, 'id' | 'collectionId'>[]) {
  const { data, error } = await supabase
    .from('statuses')
    .insert(
      statuses.map(status => ({
        ...status,
        collection_id: collectionId
      }))
    )
    .select();

  if (error) throw error;
  return data;
}

// New function to get a single collection by ID
export async function getCollectionById(id: string) {
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      fields:fields(*, options:options),
      statuses:statuses(*)
    `)
    .eq('id', id)
    // Order embedded fields and statuses
    .order('order', { foreignTable: 'fields', ascending: true })
    .order('order', { foreignTable: 'statuses', ascending: true })
    .single(); // Expect only one result

  if (error) {
    console.error('Error fetching collection:', error);
    // Handle specific errors like not found (PGRST116) if needed
    if (error.code === 'PGRST116') {
      throw new Error(`Collection with ID ${id} not found.`);
    }
    throw error;
  }
  
  // Ensure fields and statuses are arrays even if empty
  if (data && !data.fields) data.fields = [];
  if (data && !data.statuses) data.statuses = [];

  return data;
}

// Function to update a single field
export async function updateField(fieldId: string, updates: Partial<Omit<Field, 'id' | 'collectionId' | 'createdAt'>>): Promise<Field | null> {
   if (!fieldId) {
     console.error('updateField called without fieldId');
     return null;
   }
   // Ensure order is handled correctly if included in updates
   const { data, error } = await supabase
     .from('fields')
     .update(updates)
     .eq('id', fieldId)
     .select()
     .single();

   if (error) {
     console.error(`Error updating field ${fieldId}:`, error);
     throw error;
   }
   return data as Field | null;
}

// Function to update the order of multiple fields (example using transaction)
export async function updateFieldOrder(updates: Array<{ id: string; order: number }>): Promise<boolean> {
    if (!updates || updates.length === 0) return true;

    // Supabase doesn't directly support bulk updates in a single statement like this easily via JS client
    // Option 1: Loop and update one by one (simpler, less efficient, not transactional)
    // Option 2: Create a Database Function (RPC) to handle the bulk update transactionally
    
    // Let's go with Option 1 for simplicity for now:
    try {
        for (const update of updates) {
            const { error } = await supabase
                .from('fields')
                .update({ order: update.order })
                .eq('id', update.id);
            if (error) throw error; // Throw on first error
        }
        return true;
    } catch (error) {
        console.error('Error updating field order:', error);
        return false;
    }
    // If using Option 2 (RPC): 
    // const { error } = await supabase.rpc('update_field_orders', { updates });
    // if (error) { ... handle error ...; return false; }
    // return true;
}


// Function to delete a single field
export async function deleteField(fieldId: string): Promise<boolean> {
   if (!fieldId) {
     console.error('deleteField called without fieldId');
     return false;
   }
   // Check if there are entry_values associated with this field? Prevent deletion?
   // For now, assume deletion is allowed.
   const { error } = await supabase
     .from('fields')
     .delete()
     .eq('id', fieldId);

   if (error) {
     console.error(`Error deleting field ${fieldId}:`, error);
     // Handle specific errors like foreign key violations if needed
     throw error;
   }
   return true;
}

// --- Status Management Functions ---

// Function to update a single status
export async function updateStatus(statusId: string, updates: Partial<Omit<Status, 'id' | 'collectionId'>>): Promise<Status | null> {
   if (!statusId) {
     console.error('updateStatus called without statusId');
     return null;
   }
   const { data, error } = await supabase
     .from('statuses')
     .update(updates)
     .eq('id', statusId)
     .select()
     .single();

   if (error) {
     console.error(`Error updating status ${statusId}:`, error);
     throw error;
   }
   return data as Status | null;
}

// Function to update the order of multiple statuses
export async function updateStatusOrder(updates: Array<{ id: string; order: number }>): Promise<boolean> {
    if (!updates || updates.length === 0) return true;
    // Using Option 1 (looping updates) for simplicity like updateFieldOrder
    try {
        for (const update of updates) {
            const { error } = await supabase
                .from('statuses')
                .update({ order: update.order })
                .eq('id', update.id);
            if (error) throw error; 
        }
        return true;
    } catch (error) {
        console.error('Error updating status order:', error);
        return false;
    }
}

// Function to delete a single status
export async function deleteStatus(statusId: string): Promise<boolean> {
   if (!statusId) {
     console.error('deleteStatus called without statusId');
     return false;
   }
   // IMPORTANT: Check if entries use this status? 
   // Deleting a status might orphan entries or fail due to foreign key constraints (ON DELETE RESTRICT)
   // Need a strategy: prevent deletion, reassign entries, or allow orphan (if FK allows SET NULL)
   // For now, assume deletion attempt is made, DB constraint might block it.
   const { error } = await supabase
     .from('statuses')
     .delete()
     .eq('id', statusId);

   if (error) {
     console.error(`Error deleting status ${statusId}:`, error);
     // Check for specific FK violation error (e.g., 23503 in PostgreSQL)
     if (error.code === '23503') { 
       throw new Error('Cannot delete status: Entries are currently assigned to it.');
     }
     throw error;
   }
   return true;
}

/**
 * Updates the form definition JSONB for a specific collection.
 * @param collectionId The ID of the collection to update.
 * @param definition The form definition object (likely an array of FormField).
 * @returns The updated collection object (or just the form_definition part).
 */
export async function updateCollectionFormDefinition(
    collectionId: string, 
    definition: FormField[] // Assuming definition is an array of FormField
): Promise<{ form_definition: FormField[] } | null> { 
   if (!collectionId) {
     console.error('updateCollectionFormDefinition called without collectionId');
     return null;
   }

   // Ensure the definition structure matches your DB column expectations (e.g., JSON array)
   const { data, error } = await supabase
     .from('collections')
     .update({ form_definition: definition })
     .eq('id', collectionId)
     .select('form_definition') // Select only the updated column for confirmation
     .single();

   if (error) {
     console.error(`Error updating form definition for collection ${collectionId}:`, error);
     throw error;
   }
   // Type assertion might be needed depending on how Supabase returns JSONB
   return data as { form_definition: FormField[] } | null;
}