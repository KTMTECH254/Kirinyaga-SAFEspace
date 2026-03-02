// lib/supabase.ts - FIXED VERSION
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { hash as bcryptHash, compare as bcryptCompare } from 'bcryptjs';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Service role key for bypassing RLS
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcGdscnhmYXR0emtlbnBydnRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkzNjM5NywiZXhwIjoyMDgyNTEyMzk3fQ.WFiFmtCkeEsjlvappsgv5mAzdCOat-cXXY2hDuJiw1g';

// Create Supabase client with anon key
export const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
        reconnect: true,
        heartbeatIntervalMs: 30000
      }
    }
  }
);

// Create service role client for operations that need to bypass RLS
export const supabaseAdmin: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// Resource type definition
export interface Resource {
  id: string;
  title: string;
  description: string;
  author: string;
  institution: string;
  file_url: string;
  file_type: string;
  file_size: string;
  status: 'pending' | 'approved' | 'rejected';
  tags: string[];
  upvotes: number;
  downvotes: number;
  downloads: number;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

// User profile type definition
export interface UserProfile {
  id: string;
  user_id: string | null;
  anonymous_name: string;
  password_hash?: string | null;
  display_name?: string | null;
  preferences?: Record<string, unknown> | null;
  created_at: string;
}

// Upvote tracking type
export interface UserUpvote {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
}

// Functions for resource operations
export const resourceFunctions = {
  // Fetch approved resources
  async getApprovedResources() {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching approved resources:', error);
      return { data: [], error };
    }
  },

  // Fetch all resources (for admin)
  async getAllResources() {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching all resources:', error);
      return { data: [], error };
    }
  },

  // Check if user has already upvoted
  async hasUserUpvoted(userId: string, resourceId: string) {
    try {
      const { data, error } = await supabase
        .from('resource_upvotes')
        .select('id')
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No row found - user hasn't upvoted
        return { hasUpvoted: false, error: null };
      }

      if (error) throw error;
      return { hasUpvoted: !!data, error: null };
    } catch (error) {
      console.error('Error checking upvote status:', error);
      return { hasUpvoted: false, error };
    }
  },

  // Add upvote
  async addUpvote(userId: string, resourceId: string) {
    try {
      // First check if already upvoted
      const { hasUpvoted, error: checkError } = await this.hasUserUpvoted(
        userId,
        resourceId
      );

      if (checkError) throw checkError;
      if (hasUpvoted) {
        return { success: false, error: 'Already upvoted', data: null };
      }

      // Add upvote record
      const { error: insertError } = await supabase
        .from('resource_upvotes')
        .insert({
          user_id: userId,
          resource_id: resourceId
        });

      if (insertError) throw insertError;

      // Increment upvote count in resources table
      const { data: resource, error: fetchError } = await supabase
        .from('resources')
        .select('upvotes')
        .eq('id', resourceId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('resources')
        .update({ 
          upvotes: (resource?.upvotes || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', resourceId);

      if (updateError) throw updateError;

      return { success: true, error: null, data: null };
    } catch (error) {
      console.error('Error adding upvote:', error);
      return { success: false, error, data: null };
    }
  },

  // Remove upvote
  async removeUpvote(userId: string, resourceId: string) {
    try {
      // Remove upvote record
      const { error: deleteError } = await supabase
        .from('resource_upvotes')
        .delete()
        .eq('user_id', userId)
        .eq('resource_id', resourceId);

      if (deleteError) throw deleteError;

      // Decrement upvote count
      const { data: resource, error: fetchError } = await supabase
        .from('resources')
        .select('upvotes')
        .eq('id', resourceId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('resources')
        .update({ 
          upvotes: Math.max(0, (resource?.upvotes || 1) - 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', resourceId);

      if (updateError) throw updateError;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error removing upvote:', error);
      return { success: false, error };
    }
  },

  // Approve resource (admin only)
  async approveResource(resourceId: string) {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ status: 'approved' })
        .eq('id', resourceId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error approving resource:', error);
      return { success: false, error };
    }
  },

  // Reject resource (admin only)
  async rejectResource(resourceId: string) {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ status: 'rejected' })
        .eq('id', resourceId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error rejecting resource:', error);
      return { success: false, error };
    }
  }
};

// Functions for authentication and user profile operations
export const authFunctions = {
  // Sign in anonymously with Supabase (fallback)
  signInAnonymously: async function() {
    try {
      console.log('Attempting Supabase anonymous sign-in...');
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.warn('Supabase anonymous sign-in failed:', error.message);
        return { user: null, error };
      }
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      return { user: null, error };
    }
  },

  // Hash password for username/password auth
  hashPassword: async function(password: string) {
    const saltRounds = 10;
    return bcryptHash(password, saltRounds);
  },

  // Create user profile with username + password (no email)
  createUserWithPassword: async function(anonymousName: string, password: string) {
    try {
      // Check if anonymous name is already taken
      const { data: nameCheck, error: nameCheckError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('anonymous_name', anonymousName)
        .single();

      if (nameCheckError && nameCheckError.code !== 'PGRST116') {
        console.error('Error checking name availability:', nameCheckError);
        throw nameCheckError;
      }

      if (nameCheck) {
        throw new Error('Anonymous name already taken. Please choose a different name.');
      }

      const password_hash = await this.hashPassword(password);

      // Use service role client to bypass RLS for user_profiles inserts
      const { data: newProfile, error: insertError, status, statusText } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          anonymous_name: anonymousName,
          password_hash
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting profile:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
          name: (insertError as { name?: string }).name,
          status,
          statusText
        });
        console.error('Error inserting profile raw:', insertError);
        throw insertError;
      }

      return { profile: newProfile as UserProfile, error: null };
    } catch (error) {
      console.error('Error creating user with password:', error);
      return { profile: null, error };
    }
  },

  // Get current user
  getCurrentUser: async function() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { user: null, error };
    }
  },

  // Sign out
  signOut: async function() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  },

  // Create or get user profile by anonymous name
  getOrCreateUserProfile: async function(anonymousName: string, userId?: string) {
    try {
      let currentUserId = userId;

      // If no userId provided, try to get current user
      if (!currentUserId) {
        const { user, error: userError } = await this.getCurrentUser();
        if (userError || !user) {
          throw new Error('No authenticated user found. Please sign in first.');
        }
        currentUserId = user.id;
      }

      const isUuid =
        typeof currentUserId === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          currentUserId
        );

      if (!isUuid) {
        throw new Error('Invalid user id. Supabase anonymous auth is unavailable or misconfigured.');
      }

      console.log('Creating profile for userId:', currentUserId);

      // Check if anonymous name is already taken
      const { data: nameCheck, error: nameCheckError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('anonymous_name', anonymousName)
        .single();

      if (nameCheckError && nameCheckError.code !== 'PGRST116') {
        console.error('Error checking name availability:', nameCheckError);
        throw nameCheckError;
      }

      if (nameCheck) {
        console.log('Name already taken:', nameCheck);
        throw new Error('Anonymous name already taken. Please choose a different name.');
      }

      console.log('Name is available, creating profile in database...');

      // Create new profile - use service role client to bypass RLS
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: currentUserId,
          anonymous_name: anonymousName
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting profile:', insertError);
        throw insertError;
      }

      console.log('Profile created successfully in database:', newProfile);
      return { profile: newProfile, error: null };
    } catch (error) {
      console.error('Error getting or creating user profile:', error);
      return { profile: null, error };
    }
  },

  // Get user profile by anonymous name (for sign-in)
  getUserProfileByName: async function(anonymousName: string) {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('anonymous_name', anonymousName)
        .single();

      if (error && error.code === 'PGRST116') {
        console.log('Profile not found in database:', anonymousName);
        return { profile: null, error: null }; // Name not found
      }

      if (error) {
        console.error('Error getting user profile by name:', error);
        throw error;
      }

      console.log('Profile found in database:', profile);
      return { profile, error: null };
    } catch (error) {
      console.error('Error getting user profile by name:', error);
      return { profile: null, error };
    }
  },

  // Sign in with username + password
  signInWithPassword: async function(anonymousName: string, password: string) {
    try {
      // Use service role client to bypass RLS for password-based auth
      const { data: profile, error } = await supabaseAdmin
        .from('user_profiles')
        .select('id, user_id, anonymous_name, password_hash, created_at')
        .eq('anonymous_name', anonymousName)
        .single();

      if (error && error.code === 'PGRST116') {
        return { profile: null, error: new Error('This anonymous name does not exist. Please sign up first.') };
      }

      if (error) {
        throw error;
      }

      const passwordOk = await bcryptCompare(password, profile?.password_hash || '');
      if (!passwordOk) {
        return { profile: null, error: new Error('Incorrect password. Please try again.') };
      }

      return { profile: profile as UserProfile, error: null };
    } catch (error) {
      console.error('Error signing in with password:', error);
      return { profile: null, error };
    }
  },

  // Update profile display name / preferences
  updateUserProfile: async function(profileId: string, updates: { displayName?: string; preferences?: Record<string, unknown> }) {
    try {
      const payload: Record<string, unknown> = {};
      if (typeof updates.displayName === 'string') {
        payload.display_name = updates.displayName;
      }
      if (updates.preferences) {
        payload.preferences = updates.preferences;
      }

      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .update(payload)
        .eq('id', profileId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      return { profile: data as UserProfile, error: null };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { profile: null, error };
    }
  },

  // Change password for username/password auth
  changePassword: async function(profileId: string, currentPassword: string, newPassword: string) {
    try {
      const { data: profile, error } = await supabaseAdmin
        .from('user_profiles')
        .select('id, password_hash')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching profile for password change:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      const passwordOk = await bcryptCompare(currentPassword, profile?.password_hash || '');
      if (!passwordOk) {
        return { success: false, error: new Error('Current password is incorrect.') };
      }

      const nextHash = await bcryptHash(newPassword, 10);
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ password_hash: nextHash })
        .eq('id', profileId);

      if (updateError) {
        console.error('Error updating password hash:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        throw updateError;
      }
      return { success: true, error: null };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error };
    }
  }
};
