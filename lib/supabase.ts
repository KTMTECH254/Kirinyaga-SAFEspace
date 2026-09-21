// lib/supabase.ts - FIXED VERSION
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

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

  // Create user profile with username + password (no email)
  createUserWithPassword: async function(anonymousName: string, password: string) {
    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sign-up', anonymousName, password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to create profile.');
      return { profile: result.profile as UserProfile, error: null };
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

  // Sign in with username + password
  signInWithPassword: async function(anonymousName: string, password: string) {
    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sign-in', anonymousName, password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to sign in.');
      return { profile: result.profile as UserProfile, error: null };
    } catch (error) {
      console.error('Error signing in with password:', error);
      return { profile: null, error };
    }
  }
};
