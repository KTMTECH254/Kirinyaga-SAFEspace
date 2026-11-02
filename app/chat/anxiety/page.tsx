// app/chat/anxiety/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../providers';
import Image from 'next/image';
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
  LogOut,
  Smile,
  ChevronDown,
  Sparkle,
  Users,
  House,
  MessageCircle,
  BookOpen,
  Sprout,
  Compass,
  UserRound,
  ArrowUpRight,
  CircleAlert,
  Sun,
  Moon,
  Cross,
  Video,
  UploadCloud,
  Plus
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

interface VideoStory {
  id: string;
  user_id: string;
  user_name: string;
  caption: string;
  storage_path: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  video_url?: string;
}

interface ReplyData {
  parentId: string;
  parentUserName: string;
  parentMessage: string;
}

const roomId = 'anxiety';
const MAX_VIDEO_DURATION_SECONDS = 3 * 60;

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    const cleanUp = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute('src');
      video.load();
    };

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanUp();
      if (Number.isFinite(duration)) resolve(duration);
      else reject(new Error('The video length could not be checked.'));
    };
    video.onerror = () => {
      cleanUp();
      reject(new Error('The video length could not be checked. Try another video file.'));
    };
    video.src = objectUrl;
  });
}

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

const coveWaysToFeel = [
  { icon: '🏮', title: 'Lantern', detail: 'You’re seen' },
  { icon: '☁️', title: 'Cloud', detail: 'You’re not alone' },
  { icon: '🌱', title: 'Sprout', detail: 'Keep going' },
  { icon: '🩹', title: 'Stitched', detail: 'You matter' },
  { icon: '☾', title: 'Moon', detail: 'You’ll be okay' },
  { icon: '🪨', title: 'Pebble', detail: 'Still here' },
  { icon: '◉', title: 'Listening', detail: 'Always' }
];

const arrivalMoods = [
  { label: 'Calm', icon: '🌱', message: 'I am feeling calm in this moment.' },
  { label: 'Anxious', icon: '🌧️', message: 'I am feeling anxious right now.' },
  { label: 'Sad', icon: '🫧', message: 'I am feeling sad and could use some company.' },
  { label: 'Okay', icon: '☀️', message: 'I am doing okay right now.' },
  { label: 'Overwhelmed', icon: '🌊', message: 'Everything feels like a lot right now.' },
  { label: 'Hopeful', icon: '✨', message: 'There is a small part of me that feels hopeful.' },
  { label: 'Angry', icon: '🔥', message: 'I am feeling frustrated and need a safe place to talk.' },
  { label: 'Other', icon: '💙', message: 'I am feeling something I cannot quite name yet.' }
];

const quietSignals = [
  { symbol: '🏮', label: 'Lantern' },
  { symbol: '✧', label: 'A small light' },
  { symbol: '☾', label: 'Moon' },
  { symbol: '𓂃', label: 'A gentle pause' },
  { symbol: '꩜', label: 'A little courage' },
  { symbol: '♡', label: 'Care' },
  { symbol: '𓇢𓆸', label: 'New growth' },
  { symbol: '☁︎', label: 'Soft cloud' }
];

const anonymousAvatars = [
  { symbol: '🏮', style: 'from-amber-300/25 to-orange-500/30 border-amber-200/40' },
  { symbol: '🌙', style: 'from-indigo-300/25 to-blue-500/30 border-indigo-200/40' },
  { symbol: '🪷', style: 'from-pink-300/25 to-violet-500/30 border-pink-200/40' },
  { symbol: '🦋', style: 'from-cyan-300/25 to-blue-500/30 border-cyan-200/40' },
  { symbol: '🌱', style: 'from-emerald-300/25 to-green-500/30 border-emerald-200/40' },
  { symbol: '☁️', style: 'from-slate-300/25 to-sky-500/30 border-slate-200/40' },
  { symbol: '✨', style: 'from-yellow-300/25 to-amber-500/30 border-yellow-200/40' },
  { symbol: '🪨', style: 'from-teal-300/25 to-cyan-500/30 border-teal-200/40' }
];

function getAnonymousAvatar(name: string) {
  const stableValue = Array.from(name).reduce((total, character) => total + character.charCodeAt(0), 0);
  return anonymousAvatars[stableValue % anonymousAvatars.length];
}

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
  const { isDark: isDarkMode, setTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<AnonymousUser | null>(null);
  const [sessionAnonymousName, setSessionAnonymousName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [onlineCount, setOnlineCount] = useState(0);
  const [arrivalMood, setArrivalMood] = useState<string | null>(null);
  const [showSignals, setShowSignals] = useState(false);
  const [showMobileSupport, setShowMobileSupport] = useState(false);
  const [videoStories, setVideoStories] = useState<VideoStory[]>([]);
  const [showVideoLibrary, setShowVideoLibrary] = useState(false);
  const [activeVideoStory, setActiveVideoStory] = useState<VideoStory | null>(null);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [videoCaption, setVideoCaption] = useState('');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedVideoPreview, setSelectedVideoPreview] = useState<string | null>(null);
  const [videoStoryError, setVideoStoryError] = useState<string | null>(null);
  const [videoStorySaving, setVideoStorySaving] = useState(false);
  const [videoStoryCheckingDuration, setVideoStoryCheckingDuration] = useState(false);
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

  useEffect(() => {
    if (!currentUser?.id && !isAdmin) {
      return;
    }

    const loadVideoStories = async () => {
      try {
        const response = await fetch('/api/chat/anxiety/video-stories');
        const payload = await response.json();
        if (!response.ok) {
          setVideoStoryError(payload.error || 'Video stories are unavailable right now.');
          return;
        }
        setVideoStories(Array.isArray(payload.stories) ? payload.stories : []);
      } catch (error) {
        console.error('Unable to load Anxiety video stories:', error);
      }
    };

    loadVideoStories();
  }, [currentUser?.id, isAdmin]);

  useEffect(() => {
    if (!selectedVideoFile) {
      setSelectedVideoPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedVideoFile);
    setSelectedVideoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedVideoFile]);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const pendingMessageScrollRef = useRef<string | null>(null);
  const initialMessagesLoadedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoStoriesButtonRef = useRef<HTMLButtonElement>(null);
  const videoModalCloseButtonRef = useRef<HTMLButtonElement>(null);
  const videoSelectionCheckRef = useRef(0);
  const addedMessageIdsRef = useRef<Set<string>>(new Set());
  
  const roomData = roomInfo[roomId];
  const currentThemeConfig = themes[currentTheme][isDarkMode ? 'dark' : 'light'];

  const videoModalOpen = showVideoLibrary || activeVideoStory !== null;

  useEffect(() => {
    if (!videoModalOpen) return;

    const triggerButton = videoStoriesButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const animationFrame = window.requestAnimationFrame(() => videoModalCloseButtonRef.current?.focus());
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowVideoLibrary(false);
        setActiveVideoStory(null);
      }
    };
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
      triggerButton?.focus();
    };
  }, [videoModalOpen]);

  const handleVideoUploadChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    const selectionCheck = ++videoSelectionCheckRef.current;
    setVideoStoryCheckingDuration(false);
    if (!file) {
      setSelectedVideoFile(null);
      return;
    }

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      setVideoStoryError('Choose a valid MP4, WebM, or MOV video file.');
      setSelectedVideoFile(null);
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setVideoStoryError('Keep each video story under 30 MB.');
      setSelectedVideoFile(null);
      return;
    }

    setVideoStoryError(null);
    setVideoStoryCheckingDuration(true);
    setSelectedVideoFile(null);
    try {
      const duration = await readVideoDuration(file);
      if (selectionCheck !== videoSelectionCheckRef.current) return;
      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        setVideoStoryError('Video stories must be 3 minutes or shorter.');
        return;
      }
      setSelectedVideoFile(file);
    } catch (error) {
      if (selectionCheck === videoSelectionCheckRef.current) {
        setVideoStoryError(error instanceof Error ? error.message : 'The video length could not be checked.');
      }
    } finally {
      if (selectionCheck === videoSelectionCheckRef.current) {
        setVideoStoryCheckingDuration(false);
      }
    }
  };

  const handleVideoStorySubmit = async () => {
    if (!selectedVideoFile || !videoCaption.trim() || !currentUser) {
      setVideoStoryError('Add a short caption and pick a video file before posting.');
      return;
    }

    setVideoStorySaving(true);
    setVideoStoryError(null);

    try {
      const response = await fetch('/api/chat/anxiety/video-stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'prepare-upload',
          fileType: selectedVideoFile.type,
          fileSize: selectedVideoFile.size
        })
      });

      const payload = await response.json();
      if (!response.ok || !payload?.path) {
        throw new Error(payload?.error || 'Unable to prepare the upload.');
      }

      const { error: uploadError } = await supabase.storage
        .from('anxiety-video-stories')
        .uploadToSignedUrl(payload.path, payload.token, selectedVideoFile, {
          contentType: selectedVideoFile.type,
          upsert: false
        });

      if (uploadError) {
        throw new Error(`The video upload failed: ${uploadError.message}`);
      }

      const finalResponse = await fetch('/api/chat/anxiety/video-stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          userId: payload.ownerId,
          userName: currentUser.name,
          caption: videoCaption.trim(),
          path: payload.path
        })
      });

      const finalPayload = await finalResponse.json();
      if (!finalResponse.ok) {
        throw new Error(finalPayload?.error || 'The story could not be saved.');
      }

      const nextStory: VideoStory = {
        id: finalPayload.story?.id || payload.path,
        user_id: payload.ownerId,
        user_name: currentUser.name,
        caption: videoCaption.trim(),
        storage_path: payload.path,
        status: finalPayload.story?.status || 'pending',
        created_at: new Date().toISOString(),
        video_url: finalPayload.story?.video_url
      };

      setVideoStories(prev => [nextStory, ...prev]);
      setShowVideoUpload(false);
      setVideoCaption('');
      setSelectedVideoFile(null);
      setSelectedVideoPreview(null);
    } catch (error) {
      setVideoStoryError(error instanceof Error ? error.message : 'Unable to upload this video story.');
    } finally {
      setVideoStorySaving(false);
    }
  };

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

  const addQuietSignal = (signal: string) => {
    setNewMessage(current => `${current}${current && !current.endsWith(' ') ? ' ' : ''}${signal}`);
    setShowSignals(false);
    inputRef.current?.focus();
  };

  const shareArrivalMood = (mood: typeof arrivalMoods[number]) => {
    setArrivalMood(mood.label);
    setNewMessage(current => current || mood.message);
    inputRef.current?.focus();
  };

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

  // ==================== CRUD OPERATIONS =====================

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
    <div data-anxiety-theme={isDarkMode ? 'dark' : 'light'} className={`relative isolate min-h-[100dvh] overflow-x-hidden font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#04101d] text-white' : 'bg-[#eaf2f7] text-[#142b45]'}`}>
      <div aria-hidden="true" className={`pointer-events-none fixed inset-0 z-0 ${isDarkMode ? 'bg-[radial-gradient(ellipse_at_top,rgba(11,75,105,0.24),transparent_58%)]' : 'bg-[radial-gradient(ellipse_at_top,rgba(91,174,193,0.18),transparent_58%)]'}`} />
      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <header className={`z-40 shrink-0 border-b backdrop-blur-2xl ${isDarkMode ? 'border-cyan-200/15 bg-[#031326]/95' : 'border-white/60 bg-[#f8fcff]/95'}`}>
          <div className="mx-auto flex min-h-[3.5rem] max-h-[3.5rem] max-w-[1800px] items-center justify-between gap-3 px-3 sm:px-5">
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-indigo-500 text-xl shadow-[0_0_24px_rgba(45,212,191,0.3)]" aria-hidden="true"><Cross className="h-5 w-5 text-white" strokeWidth={2.5} /></span>
              <span className="leading-tight">
                <span className={`block text-xs font-semibold sm:text-sm ${isDarkMode ? 'text-white' : 'text-[#122c47]'}`}>Unspoken Minds</span>
                <span className={`block text-[10px] ${isDarkMode ? 'text-cyan-100/75' : 'text-[#506983]'}`}>SafeSpace</span>
              </span>
            </Link>
            <nav aria-label="Site navigation" className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
              {[
                { label: 'Home', href: '/', icon: House },
                { label: 'Chat Rooms', href: '/chat-rooms', icon: MessageCircle, active: true },
                { label: 'Resources', href: '/education', icon: BookOpen },
                { label: 'Progress', href: '/progress', icon: Compass },
                { label: 'Garden', href: '/chat/anxiety', icon: Sprout },
                { label: 'Profile', href: '/profile', icon: UserRound }
              ].map(({ label, href, icon: Icon, active }) => (
                <Link key={label} href={href} aria-current={active ? 'page' : undefined} className={`flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-[11px] font-medium transition xl:px-3 ${active ? 'border-b-2 border-cyan-400 text-cyan-200' : isDarkMode ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>
                  <Icon className="h-3.5 w-3.5" />{label}
                </Link>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-2">
              <div className={`hidden items-center gap-2 rounded-full border px-2.5 py-1.5 xl:flex ${isDarkMode ? 'border-cyan-100/25 bg-[#071a2c]/90' : 'border-slate-200 bg-white/90'}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.85)]' : 'bg-amber-400'}`} />
                <span className={`text-[10px] ${isDarkMode ? 'text-slate-100' : 'text-[#243e57]'}`}>{onlineCount} peers here</span>
                <ShieldCheck className={`h-3.5 w-3.5 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`} />
              </div>
              {isAdmin && (
                <button type="button" onClick={exitAdminMode} aria-label="Exit admin mode" title="Exit admin mode" className={`flex h-9 w-9 items-center justify-center rounded-full border ${isDarkMode ? 'border-amber-300/30 text-amber-200' : 'border-amber-300 text-amber-800'}`}>
                  <LogOut className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                aria-pressed={isDarkMode}
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${isDarkMode ? 'border-cyan-100/25 text-amber-200 hover:bg-white/10' : 'border-slate-300 text-slate-700 hover:bg-white'}`}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button type="button" onClick={() => router.push('/profile')} aria-label="Open profile" className={`flex h-9 w-9 items-center justify-center rounded-full border ${isDarkMode ? 'border-cyan-100/25 text-slate-100' : 'border-slate-300 text-slate-700'}`}>
                <UserRound className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
        <main id="anxiety-dashboard" className="relative z-10 mx-auto grid w-full max-w-[1800px] flex-1 grid-cols-1 lg:min-h-[calc(100dvh-3.5rem)] lg:flex-none">
          <nav aria-label="Room navigation" className={`hidden min-h-0 overflow-y-auto border-r px-3 py-4 ${isDarkMode ? 'border-cyan-100/10 bg-[#031326]/80' : 'border-white/50 bg-[#06152a]/95 text-white'}`}>
            <Link href="/chat-rooms" className="mb-3 flex min-h-8 items-center gap-2 px-2 text-[11px] text-slate-300 transition hover:text-white">
              <ArrowUpRight className="h-3.5 w-3.5 rotate-[225deg]" />Back to Rooms
            </Link>
            <div className="mb-4 rounded-xl border border-cyan-200/15 bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 p-3">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-100/30 bg-gradient-to-br from-cyan-300/30 to-indigo-400/30 text-xl">🏮</div>
              <p className="text-xs font-semibold text-white">Anxiety Support</p>
              <p className="text-xs text-cyan-100">Lantern Cove</p>
              <p className="mt-1 text-[10px] text-slate-300">You&apos;re not alone. 💙</p>
            </div>
            <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">In this room</p>
            <a href="#anxiety-chat" className="mb-1 flex min-h-9 items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-500/15 px-2 text-[11px] font-medium text-cyan-100">
              <MessageCircle className="h-4 w-4" />Chat &amp; Community
            </a>
            <a href="#arrival-checkin" className={`mb-1 flex min-h-9 items-center gap-2 rounded-lg px-2 text-[11px] transition ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-200 hover:bg-white/10'}`}>
              <Heart className="h-4 w-4" />Daily Check-in
            </a>
            <a href="#live-peers" className={`mb-1 flex min-h-9 items-center gap-2 rounded-lg px-2 text-[11px] transition ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-200 hover:bg-white/10'}`}>
              <Users className="h-4 w-4" />Community
            </a>
            <a href="#cove-activities" className={`mb-1 flex min-h-9 items-center gap-2 rounded-lg px-2 text-[11px] transition ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-200 hover:bg-white/10'}`}>
              <Waves className="h-4 w-4" />Grounding tools
            </a>
            <a href="#moment-share" onClick={() => inputRef.current?.focus()} className={`mb-1 flex min-h-9 items-center gap-2 rounded-lg px-2 text-[11px] transition ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-200 hover:bg-white/10'}`}>
              <Heart className="h-4 w-4" />Share a moment
            </a>
            <Link href="/education" className={`mb-1 flex min-h-9 items-center gap-2 rounded-lg px-2 text-[11px] transition ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-200 hover:bg-white/10'}`}>
              <BookOpen className="h-4 w-4" />Resources
            </Link>
            <a href="#room-support" className={`mb-1 flex min-h-9 items-center gap-2 rounded-lg px-2 text-[11px] transition ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-200 hover:bg-white/10'}`}>
              <Sparkles className="h-4 w-4" />Support &amp; help
            </a>
            <div className="mt-auto rounded-2xl border border-rose-300/25 bg-gradient-to-br from-rose-500/10 to-indigo-500/10 p-3">
              <div className="mb-2 flex items-center gap-2 text-rose-200">
                <CircleAlert className="h-4 w-4" />
                <span className="text-[11px] font-semibold">Need urgent help?</span>
              </div>
              <p className="mb-3 text-[9px] leading-relaxed text-slate-300">You deserve support from a real person.</p>
              <Link href="/emergency" className="flex min-h-9 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-2 text-[10px] font-semibold text-white transition hover:brightness-110">
                <Heart className="h-3.5 w-3.5" />Crisis support
              </Link>
            </div>
            <p className="mt-3 px-2 text-[9px] leading-relaxed text-slate-400">Small steps still move you forward. 💙</p>
          </nav>
          <section id="anxiety-dashboard-content" className="grid min-w-0 grid-cols-1 gap-3 px-3 py-2 sm:px-4 sm:py-3 lg:min-h-0 lg:grid-cols-[minmax(0,1.65fr)_15rem] lg:px-4 lg:py-3 xl:grid-cols-[minmax(0,1.85fr)_16rem]">
            <div id="anxiety-dashboard-center" className="flex min-w-0 flex-col">
            <div className={`relative mb-2 w-full shrink-0 overflow-hidden rounded-[1.35rem] border shadow-[0_18px_55px_rgba(15,23,42,0.12)] md:h-24 ${isDarkMode ? 'border-cyan-200/20 shadow-black/30' : 'border-white/80 shadow-slate-900/15'}`}>
              <Image
                src="/images/anxiety-lantern-cove-reference.png"
                alt="Lantern Cove at sunset, the illustrated room scene from the supplied design"
                width={832}
                height={196}
                priority
                unoptimized
                sizes="(max-width: 832px) 100vw, 832px"
                className="block h-auto w-full object-cover md:h-full"
              />
            </div>
            <div className="mb-2 hidden shrink-0 grid-cols-2 gap-2 md:grid lg:grid-cols-5">
              <button type="button" onClick={() => setNewMessage(current => current || 'Taking a small breath: in for 4, out for 6.')} className={`flex min-h-[3.7rem] items-center gap-2 rounded-xl border px-2.5 text-left transition ${isDarkMode ? 'border-cyan-200/20 bg-[#071b30]/90 text-cyan-50 hover:border-cyan-200/40' : 'border-cyan-200 bg-white/90 text-[#173553] hover:border-cyan-400'}`}>
                <Waves className="h-5 w-5 shrink-0 text-cyan-400" /><span><span className="block text-[10px] font-semibold">Take a deep breath</span><span className="block text-[8px] opacity-70">Reset your mind</span></span>
              </button>
              <button type="button" onClick={() => { setNewMessage('I am here to listen if anyone wants to talk. 💙'); inputRef.current?.focus(); }} className={`flex min-h-[3.7rem] items-center gap-2 rounded-xl border px-2.5 text-left transition ${isDarkMode ? 'border-violet-200/20 bg-[#071b30]/90 text-violet-50 hover:border-violet-200/40' : 'border-violet-200 bg-white/90 text-[#173553] hover:border-violet-400'}`}>
                <Users className="h-5 w-5 shrink-0 text-violet-400" /><span><span className="block text-[10px] font-semibold">Connect with peers</span><span className="block text-[8px] opacity-70">Talk · listen · feel heard</span></span>
              </button>
              <Link href="/education" className={`flex min-h-[3.7rem] items-center gap-2 rounded-xl border px-2.5 transition ${isDarkMode ? 'border-fuchsia-200/20 bg-[#071b30]/90 text-fuchsia-50 hover:border-fuchsia-200/40' : 'border-fuchsia-200 bg-white/90 text-[#173553] hover:border-fuchsia-400'}`}>
                <Sparkles className="h-5 w-5 shrink-0 text-fuchsia-400" /><span><span className="block text-[10px] font-semibold">Find a small story</span><span className="block text-[8px] opacity-70">Read at your own pace</span></span>
              </Link>
              <button type="button" onClick={() => { setNewMessage('A little moment from today: '); inputRef.current?.focus(); }} className={`flex min-h-[3.7rem] items-center gap-2 rounded-xl border px-2.5 text-left transition ${isDarkMode ? 'border-sky-200/20 bg-[#071b30]/90 text-sky-50 hover:border-sky-200/40' : 'border-sky-200 bg-white/90 text-[#173553] hover:border-sky-400'}`}>
                <Heart className="h-5 w-5 shrink-0 text-sky-400" /><span><span className="block text-[10px] font-semibold">Post a moment</span><span className="block text-[8px] opacity-70">Thought · feeling · text</span></span>
              </button>
              <button type="button" onClick={() => { setNewMessage(current => current || 'Grounding game: name 5 things you can see.'); inputRef.current?.focus(); }} className={`flex min-h-[3.7rem] items-center gap-2 rounded-xl border px-2.5 text-left transition ${isDarkMode ? 'border-indigo-200/20 bg-[#071b30]/90 text-indigo-50 hover:border-indigo-200/40' : 'border-indigo-200 bg-white/90 text-[#173553] hover:border-indigo-400'}`}>
                <Brain className="h-5 w-5 shrink-0 text-indigo-400" /><span><span className="block text-[10px] font-semibold">Grounding game</span><span className="block text-[8px] opacity-70">A gentle reset</span></span>
              </button>
            </div>
            <div className="mb-2 flex shrink-0 gap-1.5 overflow-x-auto xl:hidden max-[700px]:hidden">
              {supportPrompts.slice(0, 2).map(prompt => (
                <button key={prompt} onClick={() => setNewMessage(prompt)} className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] ${isDarkMode ? 'border-slate-600 bg-slate-800/80 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}>{prompt}</button>
              ))}
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-2 lg:min-h-0 lg:flex-1 lg:grid-cols-1 lg:grid-rows-[minmax(0,1fr)] xl:grid-cols-[11rem_minmax(0,1fr)]">
            <aside id="cove-activities" className="hidden min-w-0 flex-col gap-2 xl:overflow-y-auto xl:flex">
              <div className={`rounded-2xl border p-2.5 ${isDarkMode ? 'border-cyan-200/20 bg-[#04182b]/90' : 'border-slate-200 bg-white/90'}`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <h2 className={`text-[11px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#183653]'}`}>Video stories</h2>
                    <p className={`text-[9px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Real voices, shared gently</p>
                  </div>
                  <Video className="h-4 w-4 text-cyan-300" />
                </div>
                <div className="space-y-2">
                  {videoStories.length === 0 ? (
                    <div className={`rounded-xl border border-dashed p-2 text-[9px] ${isDarkMode ? 'border-slate-600 bg-slate-900/70 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                      No stories yet. Be the first to share a tiny video moment.
                    </div>
                  ) : (
                    videoStories.slice(0, 2).map(story => (
                      <div key={story.id} className={`overflow-hidden rounded-xl border ${isDarkMode ? 'border-cyan-200/10 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}>
                        <button
                          type="button"
                          onClick={() => setActiveVideoStory(story)}
                          aria-label={`Open video story from ${story.user_name}`}
                          className="relative block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                        >
                          <video
                            src={story.video_url}
                            muted
                            playsInline
                            preload="metadata"
                            aria-hidden="true"
                            className="h-24 w-full bg-black object-contain"
                          />
                          <span className="absolute inset-x-0 bottom-0 bg-black/65 py-1 text-center text-[9px] font-medium text-white">Open full-screen</span>
                        </button>
                        <div className="p-2">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`truncate text-[9px] font-medium ${isDarkMode ? 'text-white' : 'text-[#183653]'}`}>{story.user_name}</p>
                            {story.status === 'pending' && (
                              <span className="shrink-0 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[8px] font-medium text-amber-300">Awaiting review</span>
                            )}
                          </div>
                          <p className={`line-clamp-2 text-[8px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{story.caption}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <button
                    type="button"
                    onClick={() => setShowVideoUpload(open => !open)}
                    className={`flex w-full items-center justify-center gap-1.5 rounded-xl border px-2 py-1.5 text-[9px] font-medium ${isDarkMode ? 'border-cyan-200/20 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/15' : 'border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100'}`}
                  >
                    <Plus className="h-3.5 w-3.5" />Share a video story
                  </button>
                  {showVideoUpload && (
                    <div className={`rounded-xl border p-2 ${isDarkMode ? 'border-cyan-200/15 bg-[#03182d]/90' : 'border-slate-200 bg-white'}`}>
                      <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-2 py-3 text-[9px] ${isDarkMode ? 'border-slate-600 bg-slate-900/70 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>{videoStoryCheckingDuration ? 'Checking video length…' : selectedVideoFile ? selectedVideoFile.name : 'Choose a video (up to 3 min)'}</span>
                        <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideoUploadChange} className="hidden" />
                      </label>
                      {selectedVideoPreview && (
                        <video src={selectedVideoPreview} controls className="mt-2 h-24 w-full rounded-lg object-cover" />
                      )}
                      <textarea
                        value={videoCaption}
                        onChange={(event) => setVideoCaption(event.target.value)}
                        placeholder="Write a gentle caption..."
                        className={`mt-2 w-full rounded-lg border px-2 py-1.5 text-[9px] outline-none ${isDarkMode ? 'border-slate-600 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
                        rows={2}
                      />
                      {videoStoryError && <p className="mt-2 text-[8px] text-rose-400">{videoStoryError}</p>}
                      <button
                        type="button"
                        onClick={handleVideoStorySubmit}
                        disabled={videoStorySaving || videoStoryCheckingDuration}
                        className="mt-2 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-2 py-2 text-[9px] font-medium text-white disabled:opacity-60"
                      >
                        {videoStorySaving ? 'Uploading...' : 'Post story'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className={`rounded-2xl border p-2.5 ${isDarkMode ? 'border-cyan-200/20 bg-[#04182b]/90' : 'border-slate-200 bg-white/90'}`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <h2 className={`text-[11px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#183653]'}`}>Lantern Cove stories</h2>
                    <p className={`text-[9px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>A gentle moment for today</p>
                  </div>
                  <BookOpen className="h-4 w-4 text-cyan-300" />
                </div>
                <Link href="/education" className="group relative block overflow-hidden rounded-xl border border-cyan-200/20">
                  <Image src="/images/room-anxiety-garden.png" alt="A peaceful moonlit garden by the water" width={640} height={640} className="h-32 w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#031326]/95 via-[#031326]/15 to-transparent" />
                  <span className="absolute bottom-2 left-2 right-2">
                    <span className="block text-[10px] font-semibold text-white">A little space to breathe</span>
                    <span className="block text-[9px] text-cyan-100/85">Explore grounding resources ↗</span>
                  </span>
                </Link>
              </div>
              <div className={`rounded-2xl border p-2.5 ${isDarkMode ? 'border-violet-300/20 bg-gradient-to-br from-violet-950/70 to-[#07162a]' : 'border-violet-200 bg-violet-50/90'}`}>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className={`text-[11px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#392955]'}`}>A note to keep</h2>
                  <Heart className="h-4 w-4 text-violet-300" />
                </div>
                <p className={`text-[10px] leading-relaxed ${isDarkMode ? 'text-violet-100/90' : 'text-violet-950'}`}>&ldquo;You are not your thoughts. You are the one who notices them.&rdquo;</p>
                <button type="button" onClick={() => { setNewMessage('A reminder I needed today: I am not my thoughts. 💙'); inputRef.current?.focus(); }} className={`mt-2 flex min-h-8 w-full items-center justify-center gap-1 rounded-lg border text-[9px] font-medium transition ${isDarkMode ? 'border-violet-200/20 bg-white/5 text-violet-100 hover:bg-white/10' : 'border-violet-200 bg-white text-violet-900 hover:bg-violet-100'}`}>
                  <Heart className="h-3 w-3" />Share this reminder
                </button>
              </div>
              <div className={`rounded-2xl border p-2.5 ${isDarkMode ? 'border-cyan-200/15 bg-[#04182b]/85' : 'border-cyan-200 bg-cyan-50/90'}`}>
                <h2 className={`mb-2 text-[10px] font-semibold ${isDarkMode ? 'text-cyan-100' : 'text-cyan-950'}`}>Try a grounding step</h2>
                <div className="space-y-1">
                  {groundingSteps.slice(0, 3).map(({ label, detail, icon: Icon }) => (
                    <button key={label} type="button" onClick={() => { setNewMessage(`${label}: ${detail}`); inputRef.current?.focus(); }} className={`flex min-h-8 w-full items-center gap-2 rounded-lg px-1.5 text-left transition ${isDarkMode ? 'text-slate-200 hover:bg-white/5' : 'text-slate-700 hover:bg-white'}`}>
                      <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                      <span className="min-w-0"><span className="block text-[9px] font-medium">{label}</span><span className={`block truncate text-[8px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{detail}</span></span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
            <div className="flex min-w-0 flex-col gap-2 lg:min-h-0">
            <section id="anxiety-chat" className={`flex min-h-[48vh] min-w-0 flex-1 flex-col overflow-hidden rounded-[1.4rem] border p-2.5 shadow-[0_22px_60px_rgba(1,15,29,0.22)] backdrop-blur-2xl sm:p-4 lg:min-h-[26rem] ${isDarkMode ? 'border-cyan-200/20 bg-[#031326]/80' : 'border-white/80 bg-[#f8fcff]/85'}`}>
                <div className="mb-3 flex shrink-0 items-center justify-between gap-3 px-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <Users className={`h-4 w-4 shrink-0 ${isDarkMode ? 'text-cyan-300' : 'text-teal-700'}`} />
                    <span className={`text-xs font-semibold ${isDarkMode ? 'text-cyan-100' : 'text-teal-900'}`}>Lantern Cove Chat</span>
                    <span className={isDarkMode ? 'text-cyan-100/50' : 'text-slate-400'}>•</span>
                    <span className={`truncate text-[10px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Real people · Anonymous · Supportive</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      ref={videoStoriesButtonRef}
                      type="button"
                      onClick={() => setShowVideoLibrary(true)}
                      disabled={videoStories.length === 0}
                      aria-label={`Open video stories (${videoStories.length})`}
                      className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-2 text-[9px] font-medium disabled:cursor-not-allowed disabled:opacity-50 ${isDarkMode ? 'border-cyan-200/20 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20' : 'border-cyan-200 bg-cyan-50 text-cyan-900 hover:bg-cyan-100'}`}
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Stories</span>
                      <span>{videoStories.length}</span>
                    </button>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-medium text-emerald-300">
                      <span className={`h-1.5 w-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {connectionStatus === 'connected' ? 'Live' : 'Connecting'}
                    </span>
                    <span className={`hidden items-center gap-1 text-[9px] sm:flex ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} title="Anonymous accounts are pseudonyms; identities are not verified.">
                      <ShieldCheck className="h-3.5 w-3.5" />{onlineCount} here
                    </span>
                  </div>
                </div>
                <div className="mb-2 hidden shrink-0 gap-1.5 overflow-x-auto xl:flex max-[700px]:hidden">
                  {supportPrompts.map(prompt => (
                    <button key={prompt} onClick={() => setNewMessage(prompt)} className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] ${isDarkMode ? 'border-slate-600 bg-slate-800/80 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}>{prompt}</button>
                  ))}
                </div>
                <div className="mb-2 flex shrink-0 gap-1.5 overflow-x-auto xl:hidden max-[700px]:hidden">
                  {supportPrompts.slice(0, 2).map(prompt => (
                    <button key={prompt} onClick={() => setNewMessage(prompt)} className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] ${isDarkMode ? 'border-slate-600 bg-slate-800/80 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}>{prompt}</button>
                  ))}
                </div>
                <div
          id="anxiety-chat-messages"
          ref={messagesContainerRef}
          className={`mb-2 min-h-0 flex-1 touch-pan-y overflow-y-auto rounded-[1.3rem] border p-2.5 shadow-inner sm:p-5 max-[700px]:min-h-[10rem] lg:min-h-[12rem] ${isDarkMode ? 'border-cyan-200/15 bg-[#061a2c]/55' : 'border-slate-200/80 bg-white/45'}`}
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div className="max-w-xs">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border text-3xl shadow-[0_0_32px_rgba(34,211,238,0.2)] ${isDarkMode ? 'border-cyan-100/20 bg-cyan-200/10' : 'border-teal-100 bg-white/80'}`} aria-hidden="true">
                  🏮
                </div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#183653]'}`}>A quiet cove, ready when you are.</p>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-[#536a80]'}`}>Say a little, leave a lantern, or simply take a breath. People here are community members using anonymous names.</p>
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
                    className={`group relative min-h-10 ${isOwn ? 'pr-11 sm:pr-12' : 'pl-11 sm:pl-12'}`}
                  >
                    <div
                      aria-hidden="true"
                      className={`absolute top-1 flex h-9 w-9 items-center justify-center rounded-full border bg-gradient-to-br text-lg shadow-md ${getAnonymousAvatar(msg.user_name).style} ${isOwn ? 'right-0' : 'left-0'}`}
                    >
                      {getAnonymousAvatar(msg.user_name).symbol}
                    </div>
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
                    <div className={`max-w-[90%] break-words rounded-2xl border px-3 py-3 shadow-lg sm:max-w-lg sm:px-4 ${
                      msg.is_deleted 
                        ? `${isDarkMode ? 'border-slate-600 bg-slate-700/90' : 'border-slate-300 bg-slate-100'} ${currentThemeConfig.subtext} italic`
                        : isOwn 
                          ? `${isDarkMode ? 'border-cyan-300/30 bg-gradient-to-br from-[#087c91]/95 to-[#145aa0]/95 text-white' : 'border-teal-500/25 bg-gradient-to-br from-[#0e8290] to-[#256a9d] text-white'} rounded-br-none ml-auto`
                          : `${isDarkMode ? 'border-white/10 bg-[#0a2946]/90 text-slate-100' : 'border-slate-200 bg-white/90 text-[#183653]'} rounded-bl-none`
                    }`}>
                      {/* Message header */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-xs font-semibold">{msg.user_name}</p>
                          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${isOwn ? 'bg-white/15 text-white/90' : isDarkMode ? 'bg-cyan-200/10 text-cyan-100/80' : 'bg-teal-50 text-teal-800'}`}>
                            {isOwn ? 'You' : 'Peer'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {msg.is_edited && !msg.is_deleted && (
                            <span className="text-xs opacity-50 italic" title={`Edited at ${msg.edited_at ? formatTime(msg.edited_at) : ''}`}>
                              (edited)
                            </span>
                          )}
                          <span className="ml-2 text-[10px] opacity-60">
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
        <div className={`shrink-0 rounded-[1.4rem] border p-2.5 shadow-[0_16px_50px_rgba(1,10,25,0.24)] backdrop-blur-2xl sm:p-4 ${isDarkMode ? 'border-cyan-200/20 bg-[#061629]/90' : 'border-white/80 bg-white/90'}`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border bg-gradient-to-br text-base ${getAnonymousAvatar(currentUser.name).style}`} aria-hidden="true">
                {getAnonymousAvatar(currentUser.name).symbol}
              </div>
              <div>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-[#183653]'}`}>Posting as {currentUser.name}</p>
                <p className={`text-[10px] max-[700px]:hidden ${isDarkMode ? 'text-slate-400' : 'text-[#64798d]'}`}>Anonymous peer · your name stays pseudonymous</p>
              </div>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-[#536a80]'}`}>
              {replyingTo ? `Replying to ${replyingTo.parentUserName}` : 'Share only what feels okay'}
            </p>
          </div>
          <div className="flex min-w-0 items-stretch gap-1.5 sm:gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Type your message${replyingTo ? ` (replying to ${replyingTo.parentUserName})` : ''}...`}
              className={`min-h-11 min-w-0 flex-1 rounded-2xl border px-3 py-2.5 text-base shadow-inner transition focus-visible:ring-2 focus-visible:ring-cyan-400 sm:min-h-12 sm:px-4 sm:py-3 ${isDarkMode ? 'border-slate-600 bg-[#06101e] text-white placeholder-slate-400' : 'border-slate-200 bg-white text-slate-900 placeholder-slate-500'}`}
            />
            <button
              type="button"
              aria-expanded={showSignals}
              aria-label={showSignals ? 'Hide quiet signals' : 'Add a quiet signal'}
              onClick={() => setShowSignals(open => !open)}
              className={`inline-flex min-h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition sm:min-h-12 sm:w-auto sm:rounded-full sm:px-4 ${isDarkMode ? 'border-slate-600 bg-slate-800 text-cyan-100 hover:border-cyan-300/50' : 'border-slate-200 bg-white text-teal-800 hover:border-teal-500/60'}`}
            >
              <Smile className="h-4 w-4" />
              <span className="hidden sm:inline">Quiet signals</span>
              {showSignals ? <ChevronDown className="h-4 w-4" /> : <Sparkle className="h-4 w-4" />}
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              aria-label="Send message"
              className={`flex min-h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-2xl px-2 py-2.5 text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12 sm:w-auto sm:rounded-full sm:px-6 sm:py-3 ${isDarkMode ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-teal-600 to-cyan-700'}`}
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          {showSignals && (
            <div className={`mt-3 rounded-2xl border p-3 ${isDarkMode ? 'border-cyan-200/15 bg-[#030d19]/90' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`mb-2 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>A tiny symbol can say what words can&apos;t. It goes into your draft; nothing is shared until you send.</p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {quietSignals.map(({ symbol, label }) => (
                  <button
                    key={label}
                    type="button"
                    title={label}
                    aria-label={`Add ${label} symbol`}
                    onClick={() => addQuietSignal(symbol)}
                    className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl border text-xl transition hover:-translate-y-0.5 ${isDarkMode ? 'border-slate-700 bg-slate-800/80 text-cyan-50 hover:border-cyan-300/50 hover:bg-cyan-950/60' : 'border-slate-200 bg-white text-teal-900 hover:border-teal-400 hover:bg-teal-50'}`}
                  >
                    <span aria-hidden="true">{symbol}</span>
                    <span className="max-w-full truncate px-1 text-[9px] leading-none opacity-75">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      </div>
      </div>
      </div>
      <aside id="room-support" className={`${showMobileSupport ? `fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+10rem)] z-50 flex max-h-[68dvh] overflow-y-auto rounded-2xl border p-2 shadow-2xl ${isDarkMode ? 'border-cyan-200/20 bg-[#031326]/[0.98]' : 'border-slate-200 bg-white/[0.98]'}` : 'hidden'} min-w-0 flex-col gap-3 lg:static lg:flex lg:max-h-none lg:overflow-y-auto lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
                <div id="arrival-checkin" className={`rounded-2xl border p-3 shadow-xl backdrop-blur-2xl ${isDarkMode ? 'border-cyan-300/20 bg-[#061629]/85' : 'border-white/85 bg-white/90'}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className={`h-4 w-4 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`} />
                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-[#183653]'}`}>How are you feeling today?</p>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {arrivalMoods.map((mood) => (
                      <button key={mood.label} type="button" aria-pressed={arrivalMood === mood.label} onClick={() => shareArrivalMood(mood)} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl border px-1 py-1 text-[9px] font-medium transition ${arrivalMood === mood.label ? isDarkMode ? 'border-cyan-300/70 bg-cyan-300/20 text-white' : 'border-teal-600 bg-teal-50 text-teal-900' : isDarkMode ? 'border-slate-600 bg-slate-800/80 text-slate-100 hover:border-cyan-300/50' : 'border-slate-200 bg-white text-[#344e67] hover:border-teal-500/50'}`}>
                        <span className="text-base leading-none" aria-hidden="true">{mood.icon}</span>
                        <span>{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div id="live-peers" className={`rounded-2xl border p-3 shadow-xl backdrop-blur-2xl ${isDarkMode ? 'border-cyan-100/15 bg-[#061629]/85' : 'border-white/85 bg-white/90'}`}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-[#183653]'}`}>Here with you</p>
                      <p className={`text-[9px] ${isDarkMode ? 'text-slate-300' : 'text-[#536a80]'}`}>Anonymous peers in the room now</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-medium text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{onlineCount} here
                    </span>
                  </div>
                  <div className="flex items-center">
                    {anonymousAvatars.slice(0, Math.min(onlineCount, 5)).map((avatar, index) => (
                      <span key={`${avatar.symbol}-${index}`} aria-hidden="true" className={`-ml-1 flex h-8 w-8 items-center justify-center rounded-full border bg-gradient-to-br text-base first:ml-0 ${avatar.style}`}>{avatar.symbol}</span>
                    ))}
                    {onlineCount > 5 && <span className={`-ml-1 flex h-8 min-w-8 items-center justify-center rounded-full border px-1 text-[9px] ${isDarkMode ? 'border-slate-600 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>+{onlineCount - 5}</span>}
                    {onlineCount === 0 && <span className={`text-[9px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>You can be the first to say hello.</span>}
                  </div>
                </div>
                <div className={`rounded-2xl border p-3 shadow-xl backdrop-blur-2xl ${isDarkMode ? 'border-cyan-100/15 bg-[#061629]/85' : 'border-white/85 bg-white/90'}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">💠</span>
                    <div>
                      <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-[#183653]'}`}>Community vibes</p>
                      <p className={`text-[9px] ${isDarkMode ? 'text-slate-300' : 'text-[#536a80]'}`}>Choose a signal to add to your draft.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {coveWaysToFeel.slice(0, 6).map(({ icon, title }) => (
                      <button key={title} type="button" title={title} onClick={() => addQuietSignal(icon)} className={`flex min-h-10 flex-col items-center justify-center rounded-lg border text-base transition ${isDarkMode ? 'border-cyan-100/10 bg-[#082139]/80 hover:border-cyan-200/40' : 'border-slate-100 bg-white/80 hover:border-teal-300'}`}>
                        <span aria-hidden="true">{icon}</span><span className={`text-[8px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{title}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div id="moment-share" className={`rounded-2xl border p-3 shadow-xl backdrop-blur-2xl ${isDarkMode ? 'border-sky-200/20 bg-[#061629]/85' : 'border-white/85 bg-white/90'}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-300/10 text-cyan-200"><Heart className="h-4 w-4" /></span>
                    <div className="min-w-0">
                      <h2 className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-[#183653]'}`}>Share a moment</h2>
                      <p className={`truncate text-[9px] ${isDarkMode ? 'text-slate-300' : 'text-[#536a80]'}`}>A thought, a win, a little thing...</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setNewMessage('A small moment I want to share: '); inputRef.current?.focus(); }} className="flex min-h-9 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 text-[10px] font-semibold text-white transition hover:brightness-110">
                    Write a moment <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className={`rounded-2xl border p-3 shadow-xl backdrop-blur-2xl ${isDarkMode ? 'border-amber-300/25 bg-gradient-to-br from-amber-950/40 to-[#061629]/90' : 'border-amber-200 bg-amber-50/90'}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-300/10 text-amber-300">🏮</span>
                    <div>
                      <h2 className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-[#3b3022]'}`}>Need to talk right now?</h2>
                      <p className={`text-[9px] ${isDarkMode ? 'text-slate-300' : 'text-[#6b5a42]'}`}>Someone is here for you. You&apos;re not alone.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Link href="/emergency" className="flex min-h-9 items-center justify-center gap-1 rounded-full bg-rose-500 px-2 text-[9px] font-semibold text-white transition hover:bg-rose-400">
                      <CircleAlert className="h-3.5 w-3.5" />Emergency help
                    </Link>
                    <button type="button" onClick={() => { inputRef.current?.focus(); document.getElementById('anxiety-chat')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} className="flex min-h-9 items-center justify-center gap-1 rounded-full bg-cyan-500 px-2 text-[9px] font-semibold text-white transition hover:bg-cyan-400">
                      <MessageCircle className="h-3.5 w-3.5" />Talk now
                    </button>
                  </div>
                </div>
              </aside>
          </section>
        </main>
        <nav aria-label="Mobile navigation" className={`grid shrink-0 grid-cols-4 border-t px-2 pt-1 pb-[max(env(safe-area-inset-bottom),0.25rem)] xl:hidden ${isDarkMode ? 'border-cyan-100/15 bg-[#031326]/95' : 'border-white/70 bg-[#f8fcff]/95'}`}>
          <Link href="/" aria-label="Home" className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[10px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            <House className="h-4 w-4" />Home
          </Link>
          <Link href="/chat-rooms" aria-label="Chat rooms" className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[10px] ${isDarkMode ? 'text-cyan-200' : 'text-teal-800'}`}>
            <MessageCircle className="h-4 w-4" />Rooms
          </Link>
          <button type="button" aria-expanded={showMobileSupport} onClick={() => setShowMobileSupport(open => !open)} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[10px] ${showMobileSupport ? isDarkMode ? 'text-cyan-200' : 'text-teal-800' : isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            <Sparkles className="h-4 w-4" />Support
          </button>
          <Link href="/profile" aria-label="Profile" className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[10px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            <UserRound className="h-4 w-4" />Profile
          </Link>
        </nav>
        {videoModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-stories-dialog-title"
            onKeyDown={event => {
              if (event.key !== 'Tab') return;
              const focusableElements = event.currentTarget.querySelectorAll<HTMLElement>(
                'button:not([disabled]), video[controls], a[href], input:not([disabled]), textarea:not([disabled])'
              );
              if (focusableElements.length === 0) return;
              const firstElement = focusableElements[0];
              const lastElement = focusableElements[focusableElements.length - 1];
              if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
              } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
              }
            }}
            className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-[#020914] text-white"
          >
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-8">
              <div>
                <h2 id="video-stories-dialog-title" className="text-lg font-semibold">
                  {activeVideoStory ? activeVideoStory.user_name : 'Video Stories'}
                </h2>
                <p className="text-xs text-slate-300">
                  {activeVideoStory ? 'One story at a time · No autoplay' : 'Choose a story to watch · No endless feed'}
                </p>
              </div>
              <button
                ref={videoModalCloseButtonRef}
                type="button"
                onClick={() => {
                  setShowVideoLibrary(false);
                  setActiveVideoStory(null);
                }}
                aria-label="Close video stories and return to chat"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 text-2xl leading-none hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {activeVideoStory ? (
              <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-4 p-4 sm:p-8">
                <video
                  key={activeVideoStory.id}
                  src={activeVideoStory.video_url}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`Video story from ${activeVideoStory.user_name}`}
                  className="max-h-[70dvh] w-full rounded-xl bg-black object-contain sm:max-h-[76dvh]"
                />
                <div className="w-full max-w-3xl">
                  <p className="text-base leading-relaxed text-white">{activeVideoStory.caption}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Shared by {activeVideoStory.user_name}
                    {activeVideoStory.status === 'pending' ? ' · Awaiting review' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveVideoStory(null);
                    setShowVideoLibrary(true);
                    window.requestAnimationFrame(() => videoModalCloseButtonRef.current?.focus());
                  }}
                  className="min-h-11 rounded-full border border-white/25 px-5 text-sm font-medium hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                >
                  Browse stories
                </button>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-8">
                <p className="mb-5 text-sm text-slate-300">
                  New uploads are limited to 3 minutes. Choose what you want to watch; nothing starts automatically.
                </p>
                {videoStories.length === 0 ? (
                  <p className="rounded-xl border border-white/15 p-6 text-center text-slate-300">
                    There are no video stories available right now.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {videoStories.map(story => (
                      <button
                        key={story.id}
                        type="button"
                        onClick={() => {
                          setActiveVideoStory(story);
                          setShowVideoLibrary(false);
                        }}
                        className="overflow-hidden rounded-xl border border-white/15 bg-white/5 text-left transition hover:border-cyan-200/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                      >
                        <video
                          src={story.video_url}
                          muted
                          playsInline
                          preload="metadata"
                          aria-hidden="true"
                          className="aspect-video w-full bg-black object-contain"
                        />
                        <span className="block p-3">
                          <span className="block font-medium text-white">{story.user_name}</span>
                          <span className="mt-1 line-clamp-2 block text-sm text-slate-300">{story.caption}</span>
                          {story.status === 'pending' && (
                            <span className="mt-2 block text-xs text-amber-300">Awaiting review</span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
