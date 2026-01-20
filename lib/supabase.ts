// lib/supabase.ts - PROFESSIONAL FIX
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validate environment variables at build time
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create a properly configured Supabase client
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
    },
    global: {
      headers: {
        'x-client-info': 'kirinyaga-safespace/1.0'
      }
    }
  }
);

// Remove circular dependency - create separate helper
export const fetchUserDisplayName = async (userId: string): Promise<string> => {
  if (!userId || userId.startsWith('temp_')) return 'Anonymous';
  
  try {
    // Priority 1: Check anonymous_users table
    const { data: anonymousData } = await supabase
      .from('anonymous_users')
      .select('anonymous_name')
      .eq('id', userId)
      .maybeSingle();
    
    if (anonymousData?.anonymous_name) {
      return anonymousData.anonymous_name;
    }
    
    // Priority 2: Extract from localStorage
    try {
      const storedUser = localStorage.getItem('anonymousUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.id === userId && parsedUser.anonymous_name) {
          return parsedUser.anonymous_name;
        }
      }
    } catch (e) {
      // Silent fail for localStorage
    }
    
    // Fallback: Generate readable ID
    return `User_${userId.substring(0, 8)}`;
    
  } catch (error) {
    console.warn('Failed to fetch user display name:', error);
    return 'Anonymous';
  }
};

/**
 * Check if real-time connection is working
 */
export const checkRealtimeConnection = async (): Promise<boolean> => {
  try {
    // Create a test channel
    const channel = supabase.channel('connection-test', {
      config: {
        broadcast: { self: true }
      }
    });
    
    return new Promise((resolve) => {
      let timeoutId: NodeJS.Timeout;
      
      channel.subscribe((status) => {
        console.log('Connection test status:', status);
        
        if (status === 'SUBSCRIBED') {
          clearTimeout(timeoutId);
          channel.unsubscribe();
          resolve(true);
        }
        
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          clearTimeout(timeoutId);
          channel.unsubscribe();
          resolve(false);
        }
      });
      
      // Timeout after 5 seconds
      timeoutId = setTimeout(() => {
        channel.unsubscribe();
        resolve(false);
      }, 5000);
    });
  } catch (error) {
    console.error('Error checking real-time connection:', error);
    return false;
  }
};

/**
 * Setup real-time chat for a specific room
 */
export const setupChatRealtime = (roomId: string, userId: string) => {
  try {
    console.log(`Setting up real-time for room: ${roomId}, user: ${userId}`);
    
    return supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: userId }
      }
    });
  } catch (error) {
    console.error('Error setting up chat real-time:', error);
    throw error;
  }
};