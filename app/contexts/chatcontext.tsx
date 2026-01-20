// app/contexts/ChatContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Message {
  id: string;
  message: string;
  user_name: string;
  user_id: string;
  created_at: string;
  room_id: string;
  is_edited?: boolean;
  edited_at?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  parent_message_id?: string | null;
}

interface ChatContextType {
  // Connection status
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  
  // Online users
  onlineCount: number;
  
  // Chat functions
  setupRealtimeChannel: (
    roomId: string, 
    userId: string, 
    callbacks: {
      onMessageInsert?: (message: Message) => void;
      onMessageUpdate?: (message: Message) => void;
      onMessageDelete?: (messageId: string) => void;
      onPresenceUpdate?: (count: number) => void;
    }
  ) => RealtimeChannel;
  
  // Utility functions
  checkConnection: () => Promise<boolean>;
  sendMessage: (
    roomId: string, 
    userId: string, 
    userName: string, 
    message: string, 
    parentMessageId?: string | null
  ) => Promise<void>;
  editMessage: (messageId: string, userId: string, newText: string) => Promise<void>;
  deleteMessage: (messageId: string, userId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [onlineCount, setOnlineCount] = useState(0);
  const [channels, setChannels] = useState<Map<string, RealtimeChannel>>(new Map());

  // Cleanup channels on unmount
  useEffect(() => {
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [channels]);

  const checkConnection = useCallback(async (): Promise<boolean> => {
  try {
    console.log('🔌 Testing Supabase real-time connection...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');
    
    setConnectionStatus('connecting');
    const channel = supabase.channel('connection-test', {
      config: {
        broadcast: { self: true }
      }
    });
    
    const isConnected = await new Promise<boolean>((resolve) => {
      let timeoutId: NodeJS.Timeout;
      
      channel.subscribe((status) => {
        console.log('📡 Connection test status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time connected successfully!');
          clearTimeout(timeoutId);
          channel.unsubscribe();
          resolve(true);
        }
        
        if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time channel error');
          clearTimeout(timeoutId);
          channel.unsubscribe();
          resolve(false);
        }
        
        if (status === 'TIMED_OUT') {
          console.error('⏰ Real-time connection timeout');
          clearTimeout(timeoutId);
          channel.unsubscribe();
          resolve(false);
        }
      });
      
      timeoutId = setTimeout(() => {
        console.warn('⚠️ Connection test timeout after 5 seconds');
        channel.unsubscribe();
        resolve(false);
      }, 5000);
    });
    
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    setIsConnected(isConnected);
    
    if (!isConnected) {
      console.error('🚨 Real-time connection failed. Check:');
      console.error('1. Supabase URL & Key in .env.local');
      console.error('2. Realtime enabled in Supabase dashboard');
      console.error('3. Network connectivity');
    }
    
    return isConnected;
    
  } catch (error) {
    console.error('🔥 Connection check error:', error);
    setConnectionStatus('disconnected');
    setIsConnected(false);
    return false;
  }
}, []);

  const setupRealtimeChannel = useCallback((
    roomId: string,
    userId: string,
    callbacks: {
      onMessageInsert?: (message: Message) => void;
      onMessageUpdate?: (message: Message) => void;
      onMessageDelete?: (messageId: string) => void;
      onPresenceUpdate?: (count: number) => void;
    }
  ): RealtimeChannel => {
    // Clean up existing channel for this room
    const existingChannel = channels.get(roomId);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

const channel = supabase.channel(`realtime:${roomId}`, {
          config: {
        broadcast: { self: true },
        presence: { key: userId }
      }
    });

    // Presence tracking
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users = Object.keys(state);
      const count = users.length;
      setOnlineCount(count);
      callbacks.onPresenceUpdate?.(count);
    });

    // Message INSERT events
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        const newMessage = payload.new as Message;
        callbacks.onMessageInsert?.(newMessage);
      }
    );

    // Message UPDATE events
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        const updatedMessage = payload.new as Message;
        callbacks.onMessageUpdate?.(updatedMessage);
      }
    );

    // Message DELETE events
    channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        const deletedId = payload.old.id;
        callbacks.onMessageDelete?.(deletedId);
      }
    );

    // Subscribe to channel
    channel.subscribe(async (status) => {
      console.log(`Channel ${roomId} status:`, status);
      
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Track user presence
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
          room: roomId
        });
      }
      
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setIsConnected(false);
        setConnectionStatus('disconnected');
      }
    });

    // Store channel reference
    setChannels(prev => new Map(prev).set(roomId, channel));

    return channel;
  }, [channels]);

  const sendMessage = useCallback(async (
    roomId: string,
    userId: string,
    userName: string,
    message: string,
    parentMessageId?: string | null
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: userId,
          user_name: userName,
          message: message.trim(),
          parent_message_id: parentMessageId || null,
          created_at: new Date().toISOString(),
          is_edited: false,
          is_deleted: false
        });

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, []);

  const editMessage = useCallback(async (
    messageId: string,
    userId: string,
    newText: string
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({
          message: newText.trim(),
          is_edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error editing message:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
      throw error;
    }
  }, []);

  const deleteMessage = useCallback(async (
    messageId: string,
    userId: string
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          message: '[Message deleted]'
        })
        .eq('id', messageId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting message:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isConnected,
        connectionStatus,
        onlineCount,
        setupRealtimeChannel,
        checkConnection,
        sendMessage,
        editMessage,
        deleteMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};