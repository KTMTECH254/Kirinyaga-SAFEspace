'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Message {
  id: string;
  message: string;
  user_name: string;
  user_id: string;
  created_at: string;
  room_id: string;
}

const roomId = 'stress';

// Psychological themes
const themes = {
  calm: {
    name: 'Calm & Peaceful',
    light: {
      bg: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50',
      primary: 'text-cyan-600',
      secondary: 'text-teal-500',
      text: 'text-slate-900',
      subtext: 'text-slate-600',
      border: 'border-cyan-200',
      card: 'bg-gradient-to-br from-cyan-50/95 to-blue-50/95 border-cyan-200',
      button: 'bg-gradient-to-r from-cyan-600 to-teal-600',
      messageBg: 'bg-cyan-600',
      otherMessageBg: 'bg-emerald-900'
    },
    dark: {
      bg: 'bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900',
      primary: 'text-cyan-300',
      secondary: 'text-teal-300',
      text: 'text-white',
      subtext: 'text-gray-300',
      border: 'border-cyan-700',
      card: 'bg-gradient-to-br from-cyan-900/80 to-blue-900/80 border-cyan-700',
      button: 'bg-gradient-to-r from-cyan-500 to-teal-500',
      messageBg: 'bg-cyan-700',
      otherMessageBg: 'bg-emerald-800'
    }
  },
  energetic: {
    name: 'Energetic & Hopeful',
    light: {
      bg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50',
      primary: 'text-orange-600',
      secondary: 'text-rose-500',
      text: 'text-slate-900',
      subtext: 'text-slate-600',
      border: 'border-orange-200',
      card: 'bg-gradient-to-br from-orange-50/95 to-amber-50/95 border-orange-200',
      button: 'bg-gradient-to-r from-orange-600 to-rose-600',
      messageBg: 'bg-orange-600',
      otherMessageBg: 'bg-rose-900'
    },
    dark: {
      bg: 'bg-gradient-to-br from-slate-900 via-orange-900 to-rose-900',
      primary: 'text-orange-300',
      secondary: 'text-rose-300',
      text: 'text-white',
      subtext: 'text-gray-300',
      border: 'border-orange-700',
      card: 'bg-gradient-to-br from-orange-900/80 to-rose-900/80 border-orange-700',
      button: 'bg-gradient-to-r from-orange-500 to-rose-500',
      messageBg: 'bg-orange-700',
      otherMessageBg: 'bg-rose-800'
    }
  },
  growth: {
    name: 'Growth & Recovery',
    light: {
      bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50',
      primary: 'text-emerald-600',
      secondary: 'text-green-500',
      text: 'text-slate-900',
      subtext: 'text-slate-600',
      border: 'border-emerald-200',
      card: 'bg-gradient-to-br from-emerald-50/95 to-green-50/95 border-emerald-200',
      button: 'bg-gradient-to-r from-emerald-600 to-green-600',
      messageBg: 'bg-emerald-600',
      otherMessageBg: 'bg-teal-900'
    },
    dark: {
      bg: 'bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900',
      primary: 'text-emerald-300',
      secondary: 'text-green-300',
      text: 'text-white',
      subtext: 'text-gray-300',
      border: 'border-emerald-700',
      card: 'bg-gradient-to-br from-emerald-900/80 to-green-900/80 border-emerald-700',
      button: 'bg-gradient-to-r from-emerald-500 to-green-500',
      messageBg: 'bg-emerald-700',
      otherMessageBg: 'bg-teal-800'
    }
  },
  focus: {
    name: 'Focus & Clarity',
    light: {
      bg: 'bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50',
      primary: 'text-indigo-600',
      secondary: 'text-purple-500',
      text: 'text-slate-900',
      subtext: 'text-slate-600',
      border: 'border-indigo-200',
      card: 'bg-gradient-to-br from-indigo-50/95 to-purple-50/95 border-indigo-200',
      button: 'bg-gradient-to-r from-indigo-600 to-purple-600',
      messageBg: 'bg-indigo-600',
      otherMessageBg: 'bg-purple-900'
    },
    dark: {
      bg: 'bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900',
      primary: 'text-indigo-300',
      secondary: 'text-purple-300',
      text: 'text-white',
      subtext: 'text-gray-300',
      border: 'border-indigo-700',
      card: 'bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border-indigo-700',
      button: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      messageBg: 'bg-indigo-700',
      otherMessageBg: 'bg-purple-800'
    }
  },
  warmth: {
    name: 'Warmth & Connection',
    light: {
      bg: 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50',
      primary: 'text-rose-600',
      secondary: 'text-red-500',
      text: 'text-slate-900',
      subtext: 'text-slate-600',
      border: 'border-rose-200',
      card: 'bg-gradient-to-br from-rose-50/95 to-red-50/95 border-rose-200',
      button: 'bg-gradient-to-r from-rose-600 to-red-600',
      messageBg: 'bg-rose-600',
      otherMessageBg: 'bg-red-900'
    },
    dark: {
      bg: 'bg-gradient-to-br from-slate-900 via-rose-900 to-red-900',
      primary: 'text-rose-300',
      secondary: 'text-red-300',
      text: 'text-white',
      subtext: 'text-gray-300',
      border: 'border-rose-700',
      card: 'bg-gradient-to-br from-rose-900/80 to-red-900/80 border-rose-700',
      button: 'bg-gradient-to-r from-rose-500 to-red-500',
      messageBg: 'bg-rose-700',
      otherMessageBg: 'bg-red-800'
    }
  }
};

const roomInfo = {
  stress: {
    name: 'Stress Management Room',
    description: 'Share stress relief techniques and daily coping methods',
    rules: ['Practical tips only', 'No venting without solutions', 'Keep it constructive']
  },
};

export default function StressChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [onlineCount, setOnlineCount] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('appTheme') as keyof typeof themes) || 'calm';
    }
    return 'calm';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('appDarkMode') === 'true';
    }
    return false;
  });
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const addedMessageIdsRef = useRef<Set<string>>(new Set());
  
  const roomData = roomInfo[roomId];
  const currentThemeConfig = themes[currentTheme][isDarkMode ? 'dark' : 'light'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {

    const userData = localStorage.getItem('anonymousUser');
    if (!userData && !isLoading) {
      router.push('/login');
    }
  }, [isLoading, router]);

  const setupRealtime = async (userId: string) => {
    try {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      console.log('Setting up real-time for room:', roomId);
      
      const channel = supabase.channel(`room:${roomId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: userId }
        }
      });

      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        setOnlineCount(users.length);
        console.log('Online count updated to:', users.length, 'Users:', state);
      });

      channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key);
        const state = channel.presenceState();
        const users = Object.keys(state);
        setOnlineCount(users.length);
      });

      channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key);
        const state = channel.presenceState();
        const users = Object.keys(state);
        setOnlineCount(users.length);
      });

      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('📨 REAL-TIME MESSAGE RECEIVED FROM SUPABASE:', payload.new);
          
          if (addedMessageIdsRef.current.has(payload.new.id)) {
            console.log('Skipping duplicate message ID:', payload.new.id);
            return;
          }
          
          addedMessageIdsRef.current.add(payload.new.id);
          
          console.log('Adding new message to chat:', payload.new);
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === payload.new.id);
            if (exists) {
              console.log('Message already in state, skipping');
              return prev;
            }
            return [...prev, payload.new as Message];
          });
        }
      );

      channel.subscribe(async (status) => {
        console.log('Realtime subscription status:', status);
        setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time ACTIVE for room:', roomId);
          
          await channel.track({
            user_id: userId,
            user_name: currentUser?.name || 'Anonymous',
            online_at: new Date().toISOString(),
            room: roomId
          });
        }
        
        if (status === 'CHANNEL_ERROR') {
          console.error('Channel error - attempting reconnect in 3 seconds...');
          setTimeout(() => setupRealtime(userId), 3000);
        }
      });

      channelRef.current = channel;

    } catch (error) {
      console.error('Error setting up real-time:', error);
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const userData = localStorage.getItem('anonymousUser');
        if (!userData) {
          setIsLoading(false);
          return;
        }
        
        let user = JSON.parse(userData);
        
        if (!user.id) {
          user.id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('anonymousUser', JSON.stringify(user));
        }
        
        setCurrentUser(user);

        console.log('Loading initial messages...');
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true })
          .limit(100);

        if (error) {
          console.error('Error loading messages:', error);
          throw error;
        }
        
        if (data) {
          console.log('Loaded', data.length, 'messages');
          setMessages(data);
        }

        await setupRealtime(user.id);

      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up real-time channel');
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('anonymousUser')!);
      const messageText = newMessage.trim();
      
      console.log('Sending message:', { user: user.name, length: messageText.length });
      
      const tempId = `temp_${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        room_id: roomId,
        user_id: user.id,
        user_name: user.name,
        message: messageText,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          user_name: user.name,
          message: messageText
        })
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        
        alert(`Failed to send: ${error.message}`);
        return;
      }
      
      console.log('Message sent successfully:', data);
      
      if (data && data[0]) {
        addedMessageIdsRef.current.add(data[0].id);
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? data[0] : msg
          )
        );
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const refreshMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && data) {
        setMessages(data);
        console.log('Manually refreshed', data.length, 'messages');
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${currentThemeConfig.bg}`}>
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading {roomData.name}...</p>
          <p className="text-zinc-400 text-sm mt-2">Connecting to real-time chat...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className={`flex min-h-screen items-center justify-center ${currentThemeConfig.bg} font-sans`}>
      <main className={`flex min-h-screen w-full max-w-5xl flex-col py-8 px-4 ${currentThemeConfig.bg}`}>
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <button 
                onClick={() => router.push('/chat-rooms')}
                className={`${currentThemeConfig.primary} hover:opacity-80 mb-2`}
              >
                ← Back to Rooms
              </button>
              <h1 className={`text-3xl font-bold ${currentThemeConfig.text}`}>{roomData.name}</h1>
              <p className={`${currentThemeConfig.subtext} text-sm mt-1`}>{roomData.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <p className={`${currentThemeConfig.subtext} text-sm`}>● Real-time • 🔒 Anonymous</p>
              </div>
            </div>
            <p className={`text-2xl font-bold ${currentThemeConfig.primary} mt-0`}>{onlineCount} online</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`${currentThemeConfig.card} rounded-lg p-3`}>
              <p className={`${currentThemeConfig.subtext} text-sm mb-1`}>💬 Messages</p>
              <p className={`${currentThemeConfig.text} font-bold`}>{messages.length}</p>
            </div>
            <div className={`${currentThemeConfig.card} rounded-lg p-3`}>
              <p className={`${currentThemeConfig.subtext} text-sm mb-1`}>📋 Room Rules</p>
              <ul className={`${currentThemeConfig.subtext} text-xs space-y-1`}>
                {roomData.rules.map((rule: string, i: number) => (
                  <li key={i}>• {rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className={`flex-1 border-2 ${currentThemeConfig.border} rounded-lg p-4 mb-4 h-96 overflow-y-auto ${currentThemeConfig.bg}`}>
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className={`${currentThemeConfig.subtext}`}>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div 
                  key={`${msg.id}-${index}`} 
                  className={`flex ${msg.user_id === currentUser.id ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs px-4 py-2 rounded-2xl text-white ${msg.user_id === currentUser.id ? `${currentThemeConfig.messageBg} rounded-br-none` : `${currentThemeConfig.otherMessageBg} rounded-bl-none`}`}>
                    <p className="text-xs opacity-70 mb-1">
                      {msg.user_name} 
                      <span className="ml-2 text-xs">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.id.startsWith('temp_') && ' (sending...)'}
                      </span>
                    </p>
                    <p>{msg.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Type message in ${roomData.name}...`}
            className={`flex-1 border ${currentThemeConfig.border} rounded-full px-4 py-3 ${currentThemeConfig.card} ${currentThemeConfig.text}`}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`${currentThemeConfig.button} text-white px-6 py-3 rounded-full hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Send
          </button>
        </div>
        
        <div className={`mt-4 p-3 rounded border ${currentThemeConfig.card}`}>
          <p className={`${currentThemeConfig.subtext} text-sm mb-2`}>Debug Info:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={currentThemeConfig.subtext}>
              Status: <span className={connectionStatus === 'connected' ? 'text-green-500' : 'text-red-500'}>
                {connectionStatus}
              </span>
            </div>
            <div className={currentThemeConfig.subtext}>
              Messages: <span className={currentThemeConfig.text}>{messages.length}</span>
            </div>
            <div className={currentThemeConfig.subtext}>
              Online: <span className={currentThemeConfig.text}>{onlineCount}</span>
            </div>
            <div className={`${currentThemeConfig.subtext} col-span-3`}>
              User ID: <span className={`${currentThemeConfig.text} text-xs`}>{currentUser.id?.substring(0, 20)}...</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}