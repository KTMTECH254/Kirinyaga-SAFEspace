import { SupabaseClient } from '@supabase/supabase-js';

export const getUserDisplayName = async (userId: string, supabase: SupabaseClient): Promise<string | null> => {
  if (!userId) return null;

  try {
    // Only query database if userId looks like a UUID (Supabase Auth ID)
    // Anonymous IDs usually start with "anon_" or "local_" and shouldn't trigger a DB lookup
    if (userId.length === 36 && userId.includes('-') && !userId.startsWith('anon_') && !userId.startsWith('local_')) {
      const { data, error } = await supabase
        .from('users')
        .select('name, username')
        .eq('id', userId)
        .single();

      if (!error && data) {
        return data.name || data.username || null;
      }
    }
  } catch (error) {
    console.error('Error fetching user display name:', error);
  }
  
  // Return null so the caller can fallback to localStorage name
  return null;
};