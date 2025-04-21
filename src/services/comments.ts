import { supabase } from '../lib/supabaseClient';
import type { Comment } from '../types'; // Assuming Comment type is defined

/**
 * Fetches all comments for a specific entry ID.
 * Includes basic user info (id, name, email) for the commenter.
 * @param entryId The ID of the entry.
 * @returns An array of comments.
 */
export async function getCommentsByEntryId(entryId: string): Promise<Comment[]> {
  if (!entryId) {
    console.warn('getCommentsByEntryId called without entryId');
    return [];
  }

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:users ( id, name, email ) 
    `)
    .eq('entry_id', entryId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  // We might need to adjust the type mapping if `users` is nested differently
  return (data || []) as Comment[];
}

/**
 * Creates a new comment for an entry.
 * @param entryId The ID of the entry to comment on.
 * @param content The text content of the comment.
 * @returns The newly created comment object.
 */
export async function createComment(entryId: string, content: string): Promise<Comment | null> {
   const userId = (await supabase.auth.getUser()).data.user?.id;
   if (!userId) throw new Error('User must be logged in to comment');
   if (!entryId) throw new Error('Entry ID is required to create a comment');
   if (!content.trim()) throw new Error('Comment content cannot be empty');
   
   const { data, error } = await supabase
        .from('comments')
        .insert({
            entry_id: entryId,
            user_id: userId,
            content: content.trim(),
        })
        .select('*, user:users ( id, name, email )') // Select the newly created comment with user info
        .single();

    if (error) {
        console.error('Error creating comment:', error);
        throw error;
    }

    return data as Comment | null;
}

/**
 * Deletes a specific comment.
 * TODO: Add RLS policy to ensure only the comment owner or an admin can delete.
 * @param commentId The ID of the comment to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export async function deleteComment(commentId: string): Promise<boolean> {
     if (!commentId) {
         console.warn('deleteComment called without commentId');
         return false;
     }
     
     // Add permission check here in the future based on RLS or user ID comparison
     
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
        
    if (error) {
        console.error(`Error deleting comment ${commentId}:`, error);
        return false; // Don't throw, just return false on failure
    }
    
    return true;
} 