// app/chat/anxiety/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../providers';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ensureSessionAnonymousName } from '@/utils/sessionAnon';
import { 
  Edit2, 
  Trash2, 
  Send, 
  Check, 
  X, 
  MoreVertical,
  Reply,
  CornerDownRight,
  AlertCircle,
  Heart,
  ShieldCheck,
  Sparkles,
  Brain,
  Waves,
  Bell,
  CheckCircle2,
  LogOut
} from 'lucide-react';

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

interface ReplyData {
  parentId: string;
  parentUserName: string;
  parentMessage: string;
}

const roomId = 'anxiety';

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
      otherMessageBg: 'bg-emerald-900',
      editBg: 'bg-cyan-50',
      deleteBg: 'bg-red-50',
      replyBg: 'bg-teal-50'
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
      otherMessageBg: 'bg-emerald-800',
      editBg: 'bg-cyan-900/50',
      deleteBg: 'bg-red-900/50',
      replyBg: 'bg-teal-900/50'
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
      otherMessageBg: 'bg-rose-900',
      editBg: 'bg-orange-50',
      deleteBg: 'bg-red-50',
      replyBg: 'bg-rose-50'
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
      otherMessageBg: 'bg-rose-800',
      editBg: 'bg-orange-900/50',
      deleteBg: 'bg-red-900/50',
      replyBg: 'bg-rose-900/50'
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
      otherMessageBg: 'bg-teal-900',
      editBg: 'bg-emerald-50',
      deleteBg: 'bg-red-50',
      replyBg: 'bg-green-50'
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
      otherMessageBg: 'bg-teal-800',
      editBg: 'bg-emerald-900/50',
      deleteBg: 'bg-red-900/50',
      replyBg: 'bg-green-900/50'
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
      otherMessageBg: 'bg-purple-900',
      editBg: 'bg-indigo-50',
      deleteBg: 'bg-red-50',
      replyBg: 'bg-purple-50'
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
      otherMessageBg: 'bg-purple-800',
      editBg: 'bg-indigo-900/50',
      deleteBg: 'bg-red-900/50',
      replyBg: 'bg-purple-900/50'
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
      otherMessageBg: 'bg-red-900',
      editBg: 'bg-rose-50',
      deleteBg: 'bg-red-50',
      replyBg: 'bg-pink-50'
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
      otherMessageBg: 'bg-red-800',
      editBg: 'bg-rose-900/50',
      deleteBg: 'bg-red-900/50',
      replyBg: 'bg-pink-900/50'
    }
  }
};

const roomInfo = {
  anxiety: {
    name: 'Anxiety Support Room',
    description: 'A calm space to unpack stress, find grounding, and feel supported without judgment.',
    rules: ['Be kind and supportive', 'No medical advice', 'Respect privacy']
  }
};

const supportPrompts = [
  'What feels heavy right now?',
  'What helps you feel a little safer today?',
  'What would a calmer next step look like?',
  'What part of your day feels most tiring?'
];

const groundingSteps = [
  { label: 'Breathe', detail: 'In for 4, out for 6.', icon: Waves },
  { label: 'Notice', detail: 'Name 5 things you can see.', icon: Sparkles },
  { label: 'Reset', detail: 'Place one hand on your chest.', icon: Heart },
  { label: 'Reflect', detail: 'Choose one supportive thought.', icon: Brain }
];

const quickSupportMessages = [
  'You are not alone in this moment.',
  'It is okay to pause and breathe.',
  'Small steps are still progress.',
  'You deserve gentleness right now.'
];

// User utility functions (moved from utils/userUtils.ts for simplicity)
const getUserFromLocalStorage = () => {
  try {
    const userData = localStorage.getItem('anonymousUser');
    
    if (!userData) {
      // Create new anonymous user
      return createNewAnonymousUser();
    }
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(userData);
      
      // If it's a string (old format), migrate it
      if (typeof parsed === 'string') {
        console.log('Migrating string user data to object format');
        return migrateStringUser(parsed);
      }
      
      // If it's an object but missing required fields, fix it
      if (typeof parsed === 'object' && parsed !== null) {
        return fixUserObject(parsed);
      }
      
      // If we get here, it's some other type
      return createNewAnonymousUser();
      
    } catch (parseError) {
      // Data is not valid JSON - it's a plain string
      console.log('User data is not JSON, migrating:', userData);
      return migrateStringUser(userData);
    }
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    // Fallback to creating a new user
    return createNewAnonymousUser();
  }
};

type AnonymousUser = {
  id: string;
  name: string;
  avatar: string | null;
  color: string;
  created: string;
};

const saveUserToLocalStorage = (user: AnonymousUser) => {
  try {
    localStorage.setItem('anonymousUser', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

const createNewAnonymousUser = (): AnonymousUser => {
  const userId = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const userName = `Anonymous_${Math.random().toString(36).slice(2, 8)}`;
  
  const newUser: AnonymousUser = {
    id: userId,
    name: userName,
    avatar: null,
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    created: new Date().toISOString()
  };
  
  saveUserToLocalStorage(newUser);
  return newUser;
};

const migrateStringUser = (userString: string): AnonymousUser => {
  const migratedUser: AnonymousUser = {
    id: `anon_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    name: userString.substring(0, 30),
    avatar: null,
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    created: new Date().toISOString()
  };
  
  saveUserToLocalStorage(migratedUser);
  return migratedUser;
};

const fixUserObject = (userObj: Partial<AnonymousUser> & { user_name?: string }): AnonymousUser => {
  const fixedUser: AnonymousUser = {
    id: userObj.id || `anon_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    name: userObj.name || userObj.user_name || `Anonymous_${Math.random().toString(36).slice(2, 8)}`,
    avatar: userObj.avatar || null,
    color: userObj.color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
    created: userObj.created || new Date().toISOString()
  };
  
  if (!userObj.id || !userObj.name) {
    saveUserToLocalStorage(fixedUser);
  }
  
  return fixedUser;
};

const getUserForChat = () => {
  const user = getUserFromLocalStorage();
  return {
    id: user.id,
    name: user.name
  };
};

export default function AnxietyChatPage() {
  const router = useRouter();
  const { isDark: isDarkMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<AnonymousUser | null>(null);
  const [sessionAnonymousName, setSessionAnonymousName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [onlineCount, setOnlineCount] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('appTheme') as keyof typeof themes) || 'calm';
    }
    return 'calm';
  });
  
  // CRUD States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showActionsId, setShowActionsId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ReplyData | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/admin/session')
      .then(response => response.json())
      .then(data => setIsAdmin(data.authenticated === true))
      .catch(() => {
      setIsAdmin(false);
      });
  }, []);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const pendingMessageScrollRef = useRef<string | null>(null);
  const initialMessagesLoadedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addedMessageIdsRef = useRef<Set<string>>(new Set());
  
  const roomData = roomInfo[roomId];
  const currentThemeConfig = themes[currentTheme][isDarkMode ? 'dark' : 'light'];

  const exitAdminMode = async () => {
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error(`Admin sign-out failed with status ${response.status}`);
      }
      setIsAdmin(false);
      setShowActionsId(null);
    } catch (error) {
      console.error('Error ending admin session from anxiety room:', error);
      alert('Could not exit admin mode. Please try again.');
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (initialMessagesLoadedRef.current) {
      initialMessagesLoadedRef.current = false;
      container.scrollTop = container.scrollHeight;
      return;
    }

    const pendingMessageId = pendingMessageScrollRef.current;
    if (pendingMessageId && messages.some(message => message.id === pendingMessageId)) {
      pendingMessageScrollRef.current = null;
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Handle click outside to close action menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && !target.closest('[data-message-actions]')) {
        setShowActionsId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keep the room-specific color palette while honoring the site-wide color mode.
  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') as keyof typeof themes || 'calm';
    setCurrentTheme(savedTheme);
  }, []);

  const supportedMessage = quickSupportMessages[Math.floor((messages.length + Date.now()) % quickSupportMessages.length)];

  // Handle redirect
  useEffect(() => {
    const userData = localStorage.getItem('anonymousUser');
    if (!userData && !isLoading) {
      router.push('/login');
    }
  }, [isLoading, router]);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('appTheme') !== null) {
      const storedTheme = localStorage.getItem('appTheme') as keyof typeof themes;
      if (storedTheme && themes[storedTheme]) {
        setCurrentTheme(storedTheme);
      }
    }
  }, []);

  // Setup real-time subscription
  const setupRealtime = async (userId: string, sessionName: string) => {
    try {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase.channel(`room:${roomId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: userId }
        }
      });

      // Track presence
      const updateOnlineCount = () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        setOnlineCount(users.length);
      };

      channel.on('presence', { event: 'sync' }, updateOnlineCount);
      channel.on('presence', { event: 'join' }, updateOnlineCount);
      channel.on('presence', { event: 'leave' }, updateOnlineCount);

      // Handle ALL database changes (INSERT, UPDATE, DELETE)
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          console.log('Real-time update:', payload.eventType, payload.new || payload.old);
          
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message;
            if (!addedMessageIdsRef.current.has(newMsg.id)) {
              addedMessageIdsRef.current.add(newMsg.id);
              setMessages(prev => {
                const exists = prev.some(msg => msg.id === newMsg.id);
                return exists ? prev : [...prev, newMsg];
              });
            }
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as Message;
            setMessages(prev => 
              prev.map(msg => 
                msg.id === updatedMsg.id ? updatedMsg : msg
              )
            );
            // Exit edit mode if we were editing this message
            if (editingId === updatedMsg.id) {
              setEditingId(null);
              setEditText('');
            }
          } 
          else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            // Soft delete - mark as deleted in UI
            setMessages(prev => 
              prev.map(msg => 
                msg.id === deletedId 
                  ? { ...msg, is_deleted: true, message: '[Message deleted]' } 
                  : msg
              )
            );
            setConfirmDeleteId(null);
          }
        }
      );

      channel.subscribe(async (status) => {
        console.log('Realtime subscription status:', status);
        setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
        
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            user_name: sessionName || 'Anonymous',
            online_at: new Date().toISOString(),
            room: roomId
          });
        }
        
        if (status === 'CHANNEL_ERROR') {
          setTimeout(() => setupRealtime(userId, sessionName), 3000);
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
        // Use the utility function to get user
        const user = getUserFromLocalStorage();
        setCurrentUser(user);
        const currentSessionName = ensureSessionAnonymousName();
        setSessionAnonymousName(currentSessionName);

        // Load messages with CRUD columns
        console.log('Loading initial messages...');
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true })
          .limit(100);

        if (error) {
          console.error('Error loading messages:', error);
          throw error;
        }
        
        if (data) {
          console.log('Loaded', data.length, 'messages');
          initialMessagesLoadedRef.current = true;
          setMessages(data);
        }

        await setupRealtime(user.id, currentSessionName);

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

  // ==================== CRUD OPERATIONS ====================

  // CREATE: Send new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    
    try {
      const user = getUserForChat();
      const currentSessionName = sessionAnonymousName || ensureSessionAnonymousName();
      const messageText = newMessage.trim();
      const replyTarget = replyingTo;
      
      // Create temporary message for optimistic update
      const tempId = `temp_${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        room_id: roomId,
        user_id: user.id,
        user_name: currentSessionName,
        message: messageText,
        created_at: new Date().toISOString(),
        is_edited: false,
        is_deleted: false
      };

      // If replying, add parent message ID
      if (replyTarget) {
        tempMessage.parent_message_id = replyTarget.parentId;
      }

      // Optimistic update
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      setReplyingTo(null);
      
      // Send to Supabase
      const messageData: {
        room_id: string;
        user_id: string;
        user_name: string;
        message: string;
        is_edited: boolean;
        is_deleted: boolean;
        parent_message_id?: string;
      } = {
        room_id: roomId,
        user_id: user.id,
        user_name: currentSessionName,
        message: messageText,
        is_edited: false,
        is_deleted: false
      };

      if (replyTarget) {
        messageData.parent_message_id = replyTarget.parentId;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        setReplyingTo(replyTarget);
        setNewMessage(messageText);
        alert(`Failed to send: ${error.message}`);
        return;
      }
      
      // Replace temp message with real one
      if (data && data[0]) {
        addedMessageIdsRef.current.add(data[0].id);
        pendingMessageScrollRef.current = data[0].id;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? data[0] : msg
          )
        );
      } else {
        pendingMessageScrollRef.current = tempId;
        setMessages(prev => [...prev]);
      }
      
      // Focus back on input
      inputRef.current?.focus();
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  // UPDATE: Start editing a message
  const startEdit = (message: Message) => {
    if (!isOwnMessage(message.user_id, message.user_name) || message.is_deleted) return;
    setEditingId(message.id);
    setEditText(message.message);
    setShowActionsId(null);
    setConfirmDeleteId(null);
  };

  // UPDATE: Save edited message
  const saveEdit = async () => {
    if (!editingId || !editText.trim() || !currentUser) return;
    
    try {
      const payload: Record<string, string | boolean> = {
        message: editText.trim(),
        is_edited: true,
        edited_at: new Date().toISOString()
      };

      // Diagnostic pre-check
      const fetch = await supabase
        .from('chat_messages')
        .select('id,user_id,message,deleted_at,is_deleted')
        .eq('id', editingId)
        .limit(1);

      if (fetch.error) {
        console.warn('Failed to fetch message for diagnostic check', fetch.error);
      } else if (!fetch.data || (Array.isArray(fetch.data) && fetch.data.length === 0)) {
        console.warn('Message not found during diagnostic check', { editingId });
        alert('Failed to edit message: message not found');
        return;
      } else {
        const row = Array.isArray(fetch.data) ? fetch.data[0] : fetch.data;
        if (row.is_deleted) {
          alert('You cannot edit this message because it is already deleted.');
          return;
        }
        if (row.user_id !== currentUser.id) {
          console.warn('Permission mismatch', { editingId, owner: row.user_id, currentUser: currentUser.id });
          alert('Failed to edit message: permission denied');
          return;
        }
      }

      // Try update
      let res = await supabase
        .from('chat_messages')
        .update(payload)
        .eq('id', editingId)
        .eq('user_id', currentUser.id)
        .select();

      if (res.error) {
        const errMsg = (res.error.message || '').toString();
        const match = errMsg.match(/Could not find the '([^']+)' column/);
        if (match && payload.hasOwnProperty(match[1])) {
          delete payload[match[1]];
          res = await supabase
            .from('chat_messages')
            .update(payload)
            .eq('id', editingId)
            .eq('user_id', currentUser.id)
            .select();
        }
      }

      if (res.error) {
        console.error('Error editing message:', res.error);
        alert(`Failed to edit message: ${res.error.message}`);
        return;
      }

      // Check results
      if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
        console.warn('Edit update succeeded but returned no rows', { editingId, payload, res });
        alert('Failed to edit message: no rows updated');
        return;
      }

      const updatedMsg = Array.isArray(res.data) ? res.data[0] : res.data;

      // Optimistically update UI
      setMessages(prev => prev.map(m => m.id === editingId ? {
        ...m,
        message: updatedMsg.message || editText.trim(),
        is_edited: typeof updatedMsg.is_edited !== 'undefined' ? updatedMsg.is_edited : true,
        edited_at: updatedMsg.edited_at || new Date().toISOString()
      } : m));

      setEditingId(null);
      setEditText('');

    } catch (err) {
      console.error('Error editing message:', err);
      alert(`Failed to edit message: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // DELETE: Confirm and delete message
  const confirmDelete = (messageId: string) => {
    setConfirmDeleteId(messageId);
    setShowActionsId(null);
  };

  // DELETE: Execute delete
  const deleteMessage = async () => {
    if (!confirmDeleteId || (!currentUser && !isAdmin)) return;
    
    try {
      if (isAdmin) {
        const response = await fetch(
          `/api/admin/chat/anxiety/messages/${encodeURIComponent(confirmDeleteId)}`,
          { method: 'DELETE' }
        );
        const result = await response.json();
        if (!response.ok) {
          alert(result.error || 'Failed to delete message.');
          return;
        }
        setMessages(prev => prev.map(message => message.id === confirmDeleteId
          ? { ...message, ...result.message }
          : message
        ));
        setConfirmDeleteId(null);
        return;
      }

      if (!currentUser) return;
      const payload: Record<string, string | boolean> = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        message: '[Message deleted]'
      };

      // Diagnostic pre-check
      const fetchDelete = await supabase
        .from('chat_messages')
        .select('id,user_id,message,is_deleted,deleted_at')
        .eq('id', confirmDeleteId)
        .limit(1);

      if (fetchDelete.error) {
        console.warn('Failed to fetch message for delete diagnostic check', fetchDelete.error);
      } else if (!fetchDelete.data || (Array.isArray(fetchDelete.data) && fetchDelete.data.length === 0)) {
        console.warn('Message not found during delete diagnostic check', { confirmDeleteId });
        alert('Failed to delete message: message not found');
        return;
      } else {
        const row = Array.isArray(fetchDelete.data) ? fetchDelete.data[0] : fetchDelete.data;
        if (row.is_deleted) {
          alert('Message is already deleted.');
          setConfirmDeleteId(null);
          return;
        }
        if (row.user_id !== currentUser.id) {
          console.warn('Permission mismatch', { confirmDeleteId, owner: row.user_id, currentUser: currentUser.id });
          alert('Failed to delete message: permission denied');
          return;
        }
      }

      // Try update
      let res = await supabase
        .from('chat_messages')
        .update(payload)
        .eq('id', confirmDeleteId)
        .eq('user_id', currentUser.id)
        .select();

      if (res.error) {
        const errMsg = (res.error.message || '').toString();
        const match = errMsg.match(/Could not find the '([^']+)' column/);
        if (match && payload.hasOwnProperty(match[1])) {
          delete payload[match[1]];
          res = await supabase
            .from('chat_messages')
            .update(payload)
            .eq('id', confirmDeleteId)
            .eq('user_id', currentUser.id)
            .select();
        }
      }

      if (res.error) {
        console.error('Error deleting message:', res.error);
        alert(`Failed to delete message: ${res.error.message}`);
        return;
      }

      if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
        console.warn('Delete update succeeded but returned no rows', { confirmDeleteId, payload, res });
        alert('Failed to delete message: no rows updated');
        return;
      }

      const deletedMsg = Array.isArray(res.data) ? res.data[0] : res.data;

      // Optimistically update UI
      setMessages(prev => prev.map(m => m.id === confirmDeleteId ? {
        ...m,
        is_deleted: true,
        message: deletedMsg.message || '[Message deleted]',
        deleted_at: deletedMsg.deleted_at || new Date().toISOString()
      } : m));

      setConfirmDeleteId(null);

    } catch (err) {
      console.error('Error deleting message:', err);
      alert(`Failed to delete message: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // REPLY: Set up reply
  const startReply = (message: Message) => {
    if (message.is_deleted) return;
    setReplyingTo({
      parentId: message.id,
      parentUserName: message.user_name,
      parentMessage: message.message.length > 100 
        ? message.message.substring(0, 100) + '...' 
        : message.message
    });
    setShowActionsId(null);
    inputRef.current?.focus();
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // Format timestamp
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Check if message is from current user
  const isOwnMessage = (messageUserId?: string, messageUserName?: string) => {
    const normalize = (value?: string | null) => value?.trim().toLowerCase() || '';
    const activeSessionName = normalize(sessionAnonymousName);
    const incomingName = normalize(messageUserName);

    const currentUserId = currentUser?.id?.toString();
    if (currentUserId && messageUserId) {
      return messageUserId.toString() === currentUserId;
    }

    const localStoredName = (() => {
      try {
        const raw = localStorage.getItem('anonymousUser');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.name || parsed?.anonymous_name || null;
      } catch {
        return null;
      }
    })();

    const activeNames = new Set(
      [sessionAnonymousName, currentUser?.name, localStoredName].filter(
        (value): value is string => typeof value === 'string' && value.trim().length > 0
      )
    );

    if (messageUserName && activeNames.has(messageUserName)) {
      return true;
    }

    return !!(incomingName && activeNames.has(incomingName)) ||
      (!!activeSessionName && incomingName === activeSessionName);
  };

  // Get parent message for replies
  const getParentMessage = (parentId: string) => {
    return messages.find(msg => msg.id === parentId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
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
      <main className={`flex min-h-[100dvh] w-full max-w-6xl flex-col py-4 px-3 sm:py-8 sm:px-6 ${currentThemeConfig.bg}`}>
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-700 backdrop-blur-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                Safe space
              </div>
              <h1 className={`text-2xl font-bold sm:text-3xl ${currentThemeConfig.text}`}>{roomData.name}</h1>
              <p className={`${currentThemeConfig.subtext} mt-1 max-w-2xl text-sm md:text-base`}>{roomData.description}</p>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-white/30 bg-white/15 px-3 py-2 backdrop-blur-sm">
              <div className={`h-2.5 w-2.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <p className={`${currentThemeConfig.subtext} text-sm`}>
                {connectionStatus === 'connected' ? 'Live support room' : 'Connecting...'}
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={exitAdminMode}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${isDarkMode ? 'border-amber-700 bg-amber-950/50 text-amber-200 hover:bg-amber-900' : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'}`}
              >
                <LogOut className="h-4 w-4" />
                Exit admin mode
              </button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr]">
            <div className={`rounded-2xl border p-4 ${currentThemeConfig.card}`}>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Bell className="h-4 w-4" />
                Gentle check-in
              </div>
              <p className={`mt-2 text-sm ${currentThemeConfig.subtext}`}>
                {supportedMessage}
              </p>
            </div>

            <div className={`rounded-2xl border p-4 ${currentThemeConfig.card}`}>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4" />
                Community support
              </div>
              <p className={`mt-2 text-sm ${currentThemeConfig.subtext}`}>
                {onlineCount} people are here with you right now.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-5 sm:gap-3 md:grid-cols-4">
          {groundingSteps.map(({ label, detail, icon: Icon }) => (
            <div key={label} className={`rounded-2xl border p-3 ${currentThemeConfig.card}`}>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-slate-700">
                <Icon className="h-4 w-4" />
              </div>
              <p className={`text-sm font-semibold ${currentThemeConfig.text}`}>{label}</p>
              <p className={`mt-1 text-xs ${currentThemeConfig.subtext}`}>{detail}</p>
            </div>
          ))}
        </div>

        <div className={`mb-4 rounded-2xl border p-3 ${currentThemeConfig.card}`}>
          <div className="flex flex-wrap gap-2">
            {supportPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setNewMessage(prompt)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition hover:scale-[1.02] ${isDarkMode ? 'border-slate-600 bg-slate-800/70 text-slate-200' : 'border-slate-200 bg-white/80 text-slate-700'}`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          className={`mb-3 h-[42dvh] min-h-64 max-h-[42rem] touch-pan-y overscroll-contain overflow-y-auto rounded-2xl border-2 p-3 shadow-inner sm:mb-4 sm:h-[26rem] sm:p-4 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-gray-300'}`}
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <Sparkles className={`mx-auto mb-3 h-10 w-10 ${currentThemeConfig.primary}`} />
                <p className={currentThemeConfig.subtext}>Start the conversation and let the room hold space for you.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOwn = isOwnMessage(msg.user_id, msg.user_name);
                const parentMsg = msg.parent_message_id ? getParentMessage(msg.parent_message_id) : null;
                
                return (
                  <div 
                    key={msg.id} 
                    className={`relative group ${isOwn ? "pr-11 sm:pr-12" : "pl-11 sm:pl-12"}`}
                  >
                    {/* Reply indicator */}
                    {parentMsg && !parentMsg.is_deleted && (
                      <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
                        <CornerDownRight className={`w-3 h-3 ${currentThemeConfig.subtext}`} />
                        <span className={`text-xs ${currentThemeConfig.subtext}`}>
                          Replying to {parentMsg.user_name}
                        </span>
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div className={`max-w-[88%] break-words px-3 py-3 rounded-2xl shadow-sm sm:max-w-md sm:px-4 ${
                      msg.is_deleted 
                        ? `${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} ${currentThemeConfig.subtext} italic`
                        : isOwn 
                          ? `${currentThemeConfig.messageBg} text-white rounded-br-none ml-auto`
                          : `${currentThemeConfig.otherMessageBg} text-white rounded-bl-none`
                    }`}>
                      {/* Message header */}
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs opacity-70">{msg.user_name}</p>
                        <div className="flex items-center gap-1">
                          {msg.is_edited && !msg.is_deleted && (
                            <span className="text-xs opacity-50 italic" title={`Edited at ${msg.edited_at ? formatTime(msg.edited_at) : ''}`}>
                              (edited)
                            </span>
                          )}
                          <span className="text-xs opacity-50">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Message content or edit form */}
                      {editingId === msg.id ? (
                        <div className="mt-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className={`w-full p-2 rounded ${isDarkMode ? 'bg-black/30 text-white' : 'bg-white/30 text-slate-900'} border ${currentThemeConfig.border}`}
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={saveEdit}
                              className={`px-3 py-1 ${currentThemeConfig.button} rounded text-sm text-white`}
                            >
                              <Check className="w-4 h-4 inline mr-1" />
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className={`px-3 py-1 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'} rounded text-sm`}
                            >
                              <X className="w-4 h-4 inline mr-1" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className={msg.is_deleted ? 'italic' : ''}>
                            {msg.message}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Action buttons (only for non-deleted messages) */}
                    {!msg.is_deleted && !editingId && (
                      <div
                        data-message-actions
                        className={`absolute top-0 ${isOwn ? 'left-0' : 'right-0'} opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100`}
                      >
                        <button
                          onClick={() => setShowActionsId(showActionsId === msg.id ? null : msg.id)}
                          aria-label={`Actions for ${msg.user_name}'s message`}
                          aria-expanded={showActionsId === msg.id}
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${isDarkMode ? 'text-gray-300 hover:bg-slate-700 hover:text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-slate-950'}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {/* Action menu */}
                        {showActionsId === msg.id && (
                          <div className={`absolute ${isOwn ? 'left-9' : 'right-9'} top-0 z-20 min-w-40 overflow-hidden rounded-xl border shadow-xl ${isDarkMode ? 'border-slate-600 bg-slate-900 text-white' : 'border-gray-300 bg-white text-gray-900'}`}>
                            {/* Reply button (for all messages) */}
                            <button
                              onClick={() => startReply(msg)}
                              className={`flex min-h-11 w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium ${isDarkMode ? 'text-gray-100 hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}`}
                            >
                              <Reply className="w-3 h-3" />
                              Reply
                            </button>
                            
                            {/* Edit & Delete buttons (only for own messages) */}
                            {(isOwn || isAdmin) && (
                              <>
                                {isOwn && (
                                  <>
                                    <button
                                      onClick={() => startEdit(msg)}
                                      className={`flex min-h-11 w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium ${isDarkMode ? 'text-gray-100 hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}`}
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => confirmDelete(msg.id)}
                                      className={`flex min-h-11 w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium ${isDarkMode ? 'text-red-300 hover:bg-slate-700 hover:text-red-200' : 'text-red-700 hover:bg-gray-100 hover:text-red-800'}`}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      Delete
                                    </button>
                                  </>
                                )}
                                {isAdmin && !isOwn && (
                                  <button
                                    onClick={() => confirmDelete(msg.id)}
                                    className={`flex min-h-11 w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium ${isDarkMode ? 'text-red-300 hover:bg-slate-700 hover:text-red-200' : 'text-red-700 hover:bg-gray-100 hover:text-red-800'}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete as admin
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Reply Preview */}
        {replyingTo && (
          <div className={`mb-3 rounded-2xl border p-3 ${currentThemeConfig.replyBg} ${currentThemeConfig.border}`}>
            <div className="flex items-center justify-between mb-1">
              <p className={`text-sm ${currentThemeConfig.primary}`}>
                <Reply className="w-3 h-3 inline mr-1" />
                Replying to <span className="font-semibold">{replyingTo.parentUserName}</span>
              </p>
              <button
                onClick={cancelReply}
                className={`${currentThemeConfig.subtext} hover:${currentThemeConfig.text}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className={`text-sm ${currentThemeConfig.text} truncate`}>
                &ldquo;{replyingTo.parentMessage}&rdquo;
            </p>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div className={`mb-3 p-4 rounded-lg border ${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-100 border-red-300'}`}>
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              <p className={`font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                Delete Message
              </p>
            </div>
            <p className={`${currentThemeConfig.subtext} mb-4`}>
              {isAdmin
                ? 'This will hide the message from the anxiety room. This action cannot be undone from the chat.'
                : 'Are you sure you want to delete this message? This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={deleteMessage}
                className={`px-4 py-2 ${isDarkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg text-sm font-medium`}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className={`px-4 py-2 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-300 hover:bg-gray-400'} rounded-lg text-sm font-medium`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Message Input */}
        <div className={`rounded-2xl border p-3 ${currentThemeConfig.card}`}>
          <div className="mb-2 flex items-center justify-between">
            <p className={`text-xs font-medium uppercase tracking-[0.2em] ${currentThemeConfig.subtext}`}>
              Share what you need
            </p>
            <p className={`text-xs ${currentThemeConfig.subtext}`}>
              {replyingTo ? `Replying to ${replyingTo.parentUserName}` : 'You are safe to share at your own pace'}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Type your message${replyingTo ? ` (replying to ${replyingTo.parentUserName})` : ''}...`}
              className={`min-w-0 flex-1 border rounded-2xl px-4 py-3 text-base shadow-inner ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-slate-900 placeholder-gray-500'}`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`${currentThemeConfig.button} min-h-12 w-full justify-center text-white px-6 py-3 rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg sm:w-auto sm:rounded-full`}
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
        
      </main>
    </div>
  );
}
