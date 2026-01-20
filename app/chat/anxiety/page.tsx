'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { 
  Edit2, 
  Trash2, 
  Send, 
  Check, 
  X, 
  MoreVertical,
  Reply,
  Clock,
  CornerDownRight,
  AlertCircle
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
    description: 'Discuss anxiety, panic attacks, and coping strategies',
    rules: ['Be kind and supportive', 'No medical advice', 'Respect privacy']
  },
  // ... other rooms
};

export default function AnxietyChatPage() {
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
  
  // CRUD States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showActionsId, setShowActionsId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ReplyData | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Admin mode (for moderation tools). Set `localStorage.setItem('isAdmin','true')` to enable.
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    try {
      setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    } catch (e) {
      setIsAdmin(false);
    }
  }, []);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const addedMessageIdsRef = useRef<Set<string>>(new Set());
  
  const roomData = roomInfo[roomId];
  const currentThemeConfig = themes[currentTheme][isDarkMode ? 'dark' : 'light'];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, replyingTo]);

  // Handle click outside to close action menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActionsId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') as keyof typeof themes || 'calm';
    const savedDarkMode = localStorage.getItem('appDarkMode') === 'true';
    setCurrentTheme(savedTheme);
    setIsDarkMode(savedDarkMode);
  }, []);

  // Handle redirect
  useEffect(() => {
    const userData = localStorage.getItem('anonymousUser');
    if (!userData && !isLoading) {
      router.push('/login');
    }
  }, [isLoading, router]);

  // Setup real-time subscription
  const setupRealtime = async (userId: string) => {
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
          event: '*', // Listen to ALL events
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
            user_name: currentUser?.name || 'Anonymous',
            online_at: new Date().toISOString(),
            room: roomId
          });
        }
        
        if (status === 'CHANNEL_ERROR') {
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

        // Load messages with CRUD columns
        console.log('Loading initial messages...');
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .eq('is_deleted', false) // Only load non-deleted messages
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

  // ==================== CRUD OPERATIONS ====================

  // CREATE: Send new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('anonymousUser')!);
      const messageText = newMessage.trim();
      
      // Create temporary message for optimistic update
      const tempId = `temp_${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        room_id: roomId,
        user_id: user.id,
        user_name: user.name,
        message: messageText,
        created_at: new Date().toISOString(),
        is_edited: false,
        is_deleted: false
      };

      // If replying, add parent message ID
      if (replyingTo) {
        tempMessage.parent_message_id = replyingTo.parentId;
      }

      // Optimistic update
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      setReplyingTo(null);
      
      // Send to Supabase
      const messageData: any = {
        room_id: roomId,
        user_id: user.id,
        user_name: user.name,
        message: messageText,
        is_edited: false,
        is_deleted: false
      };

      if (replyingTo) {
        messageData.parent_message_id = replyingTo.parentId;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        alert(`Failed to send: ${error.message}`);
        return;
      }
      
      // Replace temp message with real one
      if (data && data[0]) {
        addedMessageIdsRef.current.add(data[0].id);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? data[0] : msg
          )
        );
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
    if (message.user_id !== currentUser.id || message.is_deleted) return;
    setEditingId(message.id);
    setEditText(message.message);
    setShowActionsId(null);
    setConfirmDeleteId(null);
  };

  // UPDATE: Save edited message
  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    
    try {
      const payload: any = {
        message: editText.trim(),
        is_edited: true,
        edited_at: new Date().toISOString()
      };

      // Diagnostic pre-check: fetch the message row to verify existence and owner
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
          console.warn('Permission mismatch: attempting to edit a message owned by another user', { editingId, owner: row.user_id, currentUser: currentUser.id });
          alert('Failed to edit message: permission denied (not the message owner)');
          return;
        }
      }

      // Try update, retrying once if server reports a missing column
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

      // Check results (select returns an array)
      if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
        console.warn('Edit update succeeded but returned no rows', { editingId, payload, res });
        alert('Failed to edit message: no rows updated (message not found or permission denied)');
        return;
      }

      const updatedMsg = Array.isArray(res.data) ? res.data[0] : res.data;

      // Optimistically update UI (server real-time will also propagate)
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
    if (!confirmDeleteId) return;
    
    try {
      const payload: any = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        message: '[Message deleted]'
      };

      // Diagnostic pre-check: fetch the message row to verify existence and owner
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
          console.warn('Permission mismatch: attempting to delete a message owned by another user', { confirmDeleteId, owner: row.user_id, currentUser: currentUser.id });
          alert('Failed to delete message: permission denied (not the message owner)');
          return;
        }
      }

      // Try update and retry once if server reports a missing column
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
        alert('Failed to delete message: no rows updated (message not found or permission denied)');
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
  const isOwnMessage = (userId: string) => {
    return userId === currentUser?.id;
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
      <main className={`flex min-h-screen w-full max-w-5xl flex-col py-8 px-4 ${currentThemeConfig.bg}`}>
        {/* Header */}
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
                <p className={`${currentThemeConfig.subtext} text-sm`}>
                  ● {connectionStatus === 'connected' ? 'Live' : 'Offline'} • 🔒 Anonymous • ✏️ Edit/Delete • 💬 Reply
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${currentThemeConfig.primary} mb-1`}>{onlineCount} online</p>
              <p className={`${currentThemeConfig.subtext} text-sm`}>You: {currentUser.name}</p>
              {/* Admin toggle for local dev/testing only. Enable by running in console: localStorage.setItem('isAdmin','true') */}
              <div className="mt-2">
                <label className={`text-xs ${currentThemeConfig.subtext} inline-flex items-center gap-2`}> 
                  <input
                    type="checkbox"
                    checked={isAdmin}
                    onChange={(e) => { localStorage.setItem('isAdmin', e.target.checked ? 'true' : 'false'); setIsAdmin(e.target.checked); }}
                    className="w-4 h-4"
                  />
                  <span className="text-xs">Admin mode</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`${currentThemeConfig.card} rounded-lg p-3 border`}>
              <p className={`${currentThemeConfig.subtext} text-sm mb-1`}>💬 Messages</p>
              <p className={`${currentThemeConfig.text} font-bold`}>{messages.filter(m => !m.is_deleted).length}</p>
            </div>
            <div className={`${currentThemeConfig.card} rounded-lg p-3 border`}>
              <p className={`${currentThemeConfig.subtext} text-sm mb-1`}>📋 Room Rules</p>
              <ul className={`${currentThemeConfig.subtext} text-xs space-y-1`}>
                {roomData.rules.map((rule: string, i: number) => (
                  <li key={i}>• {rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Chat Messages Container */}
        <div className={`flex-1 border-2 rounded-lg p-4 mb-4 h-96 overflow-y-auto ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'}`}>
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className={currentThemeConfig.subtext}>Start the conversation! Be the first to share.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOwn = isOwnMessage(msg.user_id);
                const parentMsg = msg.parent_message_id ? getParentMessage(msg.parent_message_id) : null;
                
                return (
                  <div 
                    key={msg.id} 
                    className={`relative group ${isOwn ? "pr-12" : "pl-12"}`}
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
                    <div className={`max-w-xs px-4 py-3 rounded-2xl ${
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
                        ref={actionsRef}
                        className={`absolute top-0 ${isOwn ? 'left-0' : 'right-0'} opacity-0 group-hover:opacity-100 transition-opacity`}
                      >
                        <button
                          onClick={() => setShowActionsId(showActionsId === msg.id ? null : msg.id)}
                          className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-slate-900'}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {/* Action menu */}
                        {showActionsId === msg.id && (
                          <div className={`absolute ${isOwn ? 'left-8' : 'right-8'} top-0 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'} border rounded-lg shadow-lg z-10 min-w-32`}>
                            {/* Reply button (for all messages) */}
                            <button
                              onClick={() => startReply(msg)}
                              className={`w-full text-left px-4 py-2 text-sm hover:${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} flex items-center gap-2`}
                            >
                              <Reply className="w-3 h-3" />
                              Reply
                            </button>
                            
                            {/* Edit & Delete buttons (only for own messages) */}
                            {isOwn && (
                              <>
                                <button
                                  onClick={() => startEdit(msg)}
                                  className={`w-full text-left px-4 py-2 text-sm hover:${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} flex items-center gap-2`}
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => confirmDelete(msg.id)}
                                  className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-red-400 hover:bg-slate-700 hover:text-red-300' : 'text-red-600 hover:bg-gray-100 hover:text-red-700'} flex items-center gap-2`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Reply Preview */}
        {replyingTo && (
          <div className={`mb-3 p-3 rounded-lg border ${currentThemeConfig.replyBg} ${currentThemeConfig.border}`}>
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
              "{replyingTo.parentMessage}"
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
              Are you sure you want to delete this message? This action cannot be undone.
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
        <div className="flex gap-2">
          <input 
            ref={inputRef}
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Type your message${replyingTo ? ` (replying to ${replyingTo.parentUserName})` : ''}...`}
            className={`flex-1 border rounded-full px-4 py-3 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-500' : 'bg-gray-100 border-gray-300 text-slate-900 placeholder-gray-600'}`}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`${currentThemeConfig.button} text-white px-6 py-3 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </div>
        
        {/* CRUD Instructions */}
        <div className={`mt-4 p-3 rounded border ${currentThemeConfig.card} ${currentThemeConfig.border}`}>
          <p className={`${currentThemeConfig.subtext} text-sm mb-2`}>💡 How to use CRUD:</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
            <div className={currentThemeConfig.subtext}>
              • <span className={currentThemeConfig.primary}>Send</span> messages instantly
            </div>
            <div className={currentThemeConfig.subtext}>
              • <span className={currentThemeConfig.primary}>Hover</span> messages for options
            </div>
            <div className={currentThemeConfig.subtext}>
              • <span className={currentThemeConfig.primary}>Reply</span> to any message
            </div>
            <div className={currentThemeConfig.subtext}>
              • <span className={currentThemeConfig.primary}>Edit/Delete</span> your own messages
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}