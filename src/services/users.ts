import { supabase } from '../lib/supabaseClient';
import type { User } from '../types'; // Assuming User type is defined in types

/**
 * Fetches a user profile from the public.users table by user ID.
 * @param userId The UUID of the user.
 * @returns The user profile object or null if not found.
 */
export async function getUserProfileById(userId: string): Promise<User | null> {
  if (!userId) {
    console.warn('getUserProfileById called without userId');
    return null;
  }

  const { data, error } = await supabase
    .from('users') // Ensure this matches your public table name
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // Handle specific errors like 'not found' gracefully if needed
    if (error.code === 'PGRST116') { 
        console.log(`User profile not found for ID: ${userId}`);
        return null; // Not found is not necessarily a throw-worthy error here
    } else {
        console.error('Error fetching user profile:', error);
        throw error; // Rethrow other errors
    }
  }

  return data as User | null;
} 