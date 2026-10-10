'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../providers';
import Image from 'next/image';
import { incrementProgressStat } from '@/lib/progress';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Heart, 
  Brain,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Bell,
  Coffee,
  Waves,
  Feather,
  Leaf,
  Home
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const chatRoomsList = [
  {
    id: 'anxiety',
    name: 'Anxiety Support',
    description: 'A calm space for anxiety, panic attacks, and breathing techniques',
    icon: '🧘',
    image: '/images/room-anxiety-garden.png',
    color: 'from-cyan-400 to-blue-500',
    quote: 'Breathe. You are safe here.',
    mood: 'Calm & Peaceful'
  },
  {
    id: 'stress',
    name: 'Stress Management',
    description: 'Share stress relief techniques and mindful coping methods',
    icon: '🌿',
    image: '/images/room-stress-garden.png',
    color: 'from-emerald-400 to-green-500',
    quote: 'Release tension. Find your center.',
    mood: 'Grounding & Balanced'
  },
  {
    id: 'depression',
    name: 'Depression Support',
    description: 'Warm, understanding space for low mood days and recovery',
    icon: '🤝',
    image: '/images/room-depression-garden.png',
    color: 'from-purple-400 to-pink-500',
    quote: 'You are not alone in this journey.',
    mood: 'Compassionate & Warm'
  },
  {
    id: 'general',
    name: 'General Wellness',
    description: 'Holistic discussions about mental well-being and self-care',
    icon: '💫',
    image: '/images/room-wellness-garden.png',
    color: 'from-amber-400 to-orange-500',
    quote: 'Small steps lead to big changes.',
    mood: 'Supportive & Uplifting'
  },
  {
    id: 'students',
    name: 'Student Support',
    description: 'Academic pressure relief, study tips, and life balance',
    icon: '🎓',
    image: '/images/room-students-garden.png',
    color: 'from-rose-400 to-pink-500',
    quote: 'Balance studies with self-care.',
    mood: 'Energetic & Encouraging'
  },
  {
    id: 'recovery',
    name: 'Recovery Journey',
    description: 'Celebrate progress and share healing stories together',
    icon: '🌱',
    image: '/images/room-recovery-garden.png',
    color: 'from-teal-400 to-emerald-500',
    quote: 'Every day is a fresh start.',
    mood: 'Hopeful & Growing'
  }
];

function WelcomeOverlay({ isDark, onClose }: { isDark: boolean; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${isDark ? 'bg-gradient-to-br from-blue-950/95 via-purple-950/95 to-emerald-950/95' : 'bg-gradient-to-br from-[#dce9fc]/90 via-[#e5e8fa]/90 to-[#dff5eb]/90'}`}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`max-w-md w-full rounded-3xl border p-8 shadow-2xl backdrop-blur-xl ${isDark ? 'border-white/20 bg-gradient-to-br from-white/10 to-white/5' : 'border-white/80 bg-gradient-to-br from-white/95 to-[#f3f7ff]/95'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20">
            <Heart className={`h-12 w-12 ${isDark ? 'text-white' : 'text-indigo-600'}`} />
          </div>
          <h2 className={`mb-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-[#18345e]'}`}>Welcome Home</h2>
          <p className={`mb-6 ${isDark ? 'text-blue-100' : 'text-[#516583]'}`}>
            Take a deep breath. You&apos;ve found a safe space where understanding hearts meet.
          </p>
        </div>

        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-emerald-300" />
            <span className={isDark ? 'text-white' : 'text-[#314661]'}>Choose what you share</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-cyan-300" />
            <span className={isDark ? 'text-white' : 'text-[#314661]'}>Real people who understand</span>
          </div>
          <div className="flex items-center gap-3">
            <Coffee className="h-5 w-5 text-amber-300" />
            <span className={isDark ? 'text-white' : 'text-[#314661]'}>No pressure, just presence</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-semibold text-white shadow-lg"
        >
          I&apos;m Ready to Explore
        </motion.button>

        <p className={`mt-4 text-center text-sm ${isDark ? 'text-blue-200/60' : 'text-[#697b94]'}`}>
          💫 Take your time. There&apos;s no rush here.
        </p>
      </motion.div>
    </motion.div>
  );
}

function BreathingExercise({ isDark, isBreathing, breathingSeconds, onToggle }: {
  isDark: boolean;
  isBreathing: boolean;
  breathingSeconds: number;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className={`relative overflow-hidden rounded-3xl border p-5 shadow-lg sm:p-6 ${isDark ? 'border-indigo-400/20 bg-gradient-to-r from-[#151d3a] via-[#252e66] to-[#182b54]' : 'border-indigo-100 bg-gradient-to-r from-[#eef0ff] via-[#e7eaff] to-[#f2f2ff]'}`}>
        <div aria-hidden="true" className={`absolute -left-8 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full blur-2xl ${isDark ? 'bg-indigo-400/15' : 'bg-indigo-300/30'}`} />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center gap-4 md:w-[30%]">
            <div className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 ${isDark ? 'border-indigo-300/60 bg-indigo-300/10' : 'border-indigo-300 bg-white/70'}`}>
              <div className={`absolute h-14 w-14 rounded-full ${isBreathing ? 'animate-ping' : ''} ${isDark ? 'bg-indigo-300/20' : 'bg-indigo-200/70'}`} />
              <Waves className={`relative h-7 w-7 ${isDark ? 'text-cyan-200' : 'text-indigo-600'}`} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#20345d]'}`}>Arrive as you are</h3>
              <p className={`mt-1 text-sm ${isDark ? 'text-indigo-100' : 'text-[#4e6284]'}`}>Take a moment. Breathe. You&apos;re safe here.</p>
            </div>
          </div>
          <div className={`flex-1 border-l-0 pl-0 md:border-l md:pl-6 ${isDark ? 'border-indigo-200/30' : 'border-indigo-300'}`}>
            <p className={`text-sm font-semibold ${isDark ? 'text-indigo-100' : 'text-[#344b77]'}`}>
              {isBreathing ? `Breathe in... gently. ${breathingSeconds}s left` : '4 - 4 - 6 Breathing'}
            </p>
            <p className={`mt-1 text-xs ${isDark ? 'text-indigo-200/80' : 'text-[#647796]'}`}>Inhale for 4s · Hold for 4s · Exhale for 6s</p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7958ec] to-[#398ef0] px-5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <Waves className="h-4 w-4" />
            {isBreathing ? 'End breathing pause' : 'Begin a 30-second pause'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatRoomsPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [hasAccess, setHasAccess] = useState(false);
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({});
  const [showWelcome, setShowWelcome] = useState(true);
  const [breathingSeconds, setBreathingSeconds] = useState(30);
  const [isBreathing, setIsBreathing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const totalOnline = Object.values(roomCounts).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    if (!isBreathing) return;
    const timer = window.setInterval(() => {
      setBreathingSeconds(seconds => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          setIsBreathing(false);
          return 30;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isBreathing]);

  // Soft nature sounds for calming effect
  const playCalmingSound = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
      audioRef.current.play().catch(() => {
        // Auto-play might be blocked, that's okay
      });
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('anonymousUser');
    if (!userData) {
      router.replace('/login');
      return;
    }

    setHasAccess(true);
  }, [router]);

  useEffect(() => {
    if (!hasAccess) return;

    // Show welcome message on first visit
    const hasVisited = localStorage.getItem('hasVisitedChatRooms');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('hasVisitedChatRooms', 'true');
    } else {
      setShowWelcome(false);
    }

    // Play soft calming sound
    playCalmingSound();

    const channels = chatRoomsList.map((room) => {
      const channel = supabase.channel(`room:${room.id}`, {
        config: {
          broadcast: { self: true }
        }
      });

      const updateCount = () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setRoomCounts(prev => ({ ...prev, [room.id]: count }));
      };

      channel.on('presence', { event: 'sync' }, updateCount);
      channel.on('presence', { event: 'join' }, updateCount);
      channel.on('presence', { event: 'leave' }, updateCount);

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          updateCount();
        }
      });

      return channel;
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [hasAccess]);

  const enterChatRoom = (roomId: string) => {
    // Add gentle transition effect
    incrementProgressStat('chatSessions', 1);
    setTimeout(() => {
      router.push(`/chat/${roomId}`);
    }, 300);
  };

  // Welcome message component
  const WelcomeOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${isDark ? 'bg-gradient-to-br from-blue-950/95 via-purple-950/95 to-emerald-950/95' : 'bg-gradient-to-br from-[#dce9fc]/90 via-[#e5e8fa]/90 to-[#dff5eb]/90'}`}
      onClick={() => setShowWelcome(false)}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`max-w-md w-full rounded-3xl border p-8 shadow-2xl backdrop-blur-xl ${isDark ? 'border-white/20 bg-gradient-to-br from-white/10 to-white/5' : 'border-white/80 bg-gradient-to-br from-white/95 to-[#f3f7ff]/95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 flex items-center justify-center mx-auto mb-4">
            <Heart className={`w-12 h-12 ${isDark ? 'text-white' : 'text-indigo-600'}`} />
          </div>
          <h2 className={`mb-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-[#18345e]'}`}>Welcome Home</h2>
          <p className={`mb-6 ${isDark ? 'text-blue-100' : 'text-[#516583]'}`}>
            Take a deep breath. You&apos;ve found a safe space where understanding hearts meet.
          </p>
        </div>
        
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-300" />
            <span className={isDark ? 'text-white' : 'text-[#314661]'}>Choose what you share</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-cyan-300" />
            <span className={isDark ? 'text-white' : 'text-[#314661]'}>Real people who understand</span>
          </div>
          <div className="flex items-center gap-3">
            <Coffee className="w-5 h-5 text-amber-300" />
            <span className={isDark ? 'text-white' : 'text-[#314661]'}>No pressure, just presence</span>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowWelcome(false)}
          className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-semibold text-white shadow-lg"
        >
          I&apos;m Ready to Explore
        </motion.button>
        
        <p className={`mt-4 text-center text-sm ${isDark ? 'text-blue-200/60' : 'text-[#697b94]'}`}>
          💫 Take your time. There&apos;s no rush here.
        </p>
      </motion.div>
    </motion.div>
  );

  // Calming breathing exercise
  const BreathingExercise = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className={`relative overflow-hidden rounded-3xl border p-5 shadow-lg sm:p-6 ${isDark ? 'border-indigo-400/20 bg-gradient-to-r from-[#151d3a] via-[#252e66] to-[#182b54]' : 'border-indigo-100 bg-gradient-to-r from-[#eef0ff] via-[#e7eaff] to-[#f2f2ff]'}`}>
        <div aria-hidden="true" className={`absolute -left-8 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full blur-2xl ${isDark ? 'bg-indigo-400/15' : 'bg-indigo-300/30'}`} />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center gap-4 md:w-[30%]">
            <div className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 ${isDark ? 'border-indigo-300/60 bg-indigo-300/10' : 'border-indigo-300 bg-white/70'}`}>
              <div className={`absolute h-14 w-14 rounded-full ${isBreathing ? 'animate-ping' : ''} ${isDark ? 'bg-indigo-300/20' : 'bg-indigo-200/70'}`} />
              <Waves className={`relative h-7 w-7 ${isDark ? 'text-cyan-200' : 'text-indigo-600'}`} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#20345d]'}`}>Arrive as you are</h3>
              <p className={`mt-1 text-sm ${isDark ? 'text-indigo-100' : 'text-[#4e6284]'}`}>Take a moment. Breathe. You&apos;re safe here.</p>
            </div>
          </div>
          <div className={`flex-1 border-l-0 pl-0 md:border-l md:pl-6 ${isDark ? 'border-indigo-200/30' : 'border-indigo-300'}`}>
            <p className={`text-sm font-semibold ${isDark ? 'text-indigo-100' : 'text-[#344b77]'}`}>
              {isBreathing ? `Breathe in... gently. ${breathingSeconds}s left` : '4 - 4 - 6 Breathing'}
            </p>
            <p className={`mt-1 text-xs ${isDark ? 'text-indigo-200/80' : 'text-[#647796]'}`}>Inhale for 4s · Hold for 4s · Exhale for 6s</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isBreathing) {
                setIsBreathing(false);
                setBreathingSeconds(30);
              } else {
                setBreathingSeconds(30);
                setIsBreathing(true);
              }
            }}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7958ec] to-[#398ef0] px-5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <Waves className="h-4 w-4" />
            {isBreathing ? 'End breathing pause' : 'Begin a 30-second pause'}
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (!hasAccess) {
    return null;
  }

  return (
    <div data-chatrooms-theme={isDark ? 'dark' : 'light'} className={`min-h-screen font-sans overflow-hidden relative transition-colors duration-500 ${isDark ? 'bg-[#07101d] text-white' : 'bg-[#f5f8fc] text-[#1c2e49]'}`}>
      {/* Hidden audio for calming sounds */}
      {/* <audio ref={audioRef} loop>
        <source src="https://assets.mixkit.co/active_storage/sfx/286/286-preview.mp3" type="audio/mpeg" />
      </audio> */}

      {/* Welcome Overlay */}
      <AnimatePresence>
        {showWelcome && <WelcomeOverlay />}
      </AnimatePresence>

      {/* Floating calming elements */}
      <div className={`pointer-events-none absolute inset-x-0 top-20 h-[24rem] overflow-hidden ${isDark ? 'opacity-[0.08]' : 'opacity-25'}`}>
        <Image
          src="/images/garden-ambience.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover object-[center_32%] blur-[2px]"
        />
      </div>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 360, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 w-24 h-24 rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/30 blur-xl"
        />
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, 20, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-purple-200/20 to-pink-200/20 blur-xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-200/20 to-green-200/20 blur-xl"
        />
      </div>

      <main className="relative z-10 container mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8">
        {/* Gentle Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center sm:mb-10"
        >
          <motion.div
            className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm ${isDark ? 'border-emerald-300/20 bg-slate-900/70 text-emerald-200' : 'border-emerald-100 bg-white/90 text-[#287560]'}`}
          >
            <Leaf className="h-4 w-4" />
            <span className="text-xs font-semibold">
              A safe space to exhale
            </span>
          </motion.div>

          <h1 className={`mx-auto mb-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl ${isDark ? 'text-white' : 'text-[#142c52]'}`}>
            Find the space your <span className="bg-gradient-to-r from-[#168ca4] via-[#27a9bf] to-[#5967ef] bg-clip-text text-transparent">
              mind needs
            </span>
          </h1>
          
          <p className={`mx-auto mb-6 max-w-xl text-sm leading-6 sm:text-base ${isDark ? 'text-slate-300' : 'text-[#405879]'}`}>
            You don&apos;t have to explain everything to belong here.
          </p>

          {/* Live Community Stats */}
          <div className="mx-auto mb-8 grid max-w-4xl grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {[
              { value: totalOnline, label: 'People Ready to Listen', icon: <Users className="w-5 h-5" />, color: 'text-cyan-600' },
              { value: 'Your pace', label: 'Share only what you choose', icon: <Shield className="w-5 h-5" />, color: 'text-emerald-600' },
              { value: 'No pressure', label: 'Listening counts too', icon: <Heart className="w-5 h-5" />, color: 'text-purple-600' },
              { value: 'One breath', label: 'A small step is enough', icon: <Waves className="w-5 h-5" />, color: 'text-amber-600' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`rounded-2xl border p-3 text-left shadow-md backdrop-blur-sm sm:p-4 ${isDark ? 'border-white/10 bg-slate-900/75' : 'border-white bg-white/90'}`}
              >
                <div className="mb-1.5 flex items-center gap-2 sm:gap-3">
                  <div className={`rounded-xl p-2 ${stat.color.replace('text', 'bg')}/10`}>
                    {stat.icon}
                  </div>
                  <div className={`text-xl font-bold sm:text-2xl ${stat.color}`}>{stat.value}</div>
                </div>
                <div className={`text-[10px] leading-4 sm:text-xs ${isDark ? 'text-slate-300' : 'text-[#526581]'}`}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Breathing Exercise Section */}
        <BreathingExercise />

        {/* Support Rooms Grid - Designed like cozy spaces */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isDark ? 'text-emerald-300' : 'text-[#287560]'}`}>Choose your space</p>
              <h2 className={`mt-1 text-xl font-bold sm:text-2xl ${isDark ? 'text-white' : 'text-[#17365c]'}`}>Come as you are</h2>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#60718a]'}`}>Six rooms · one gentle first step</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            {chatRoomsList.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative cursor-pointer"
                onClick={() => enterChatRoom(room.id)}
              >
                {/* Card with soft, comforting design */}
                <div className={`relative min-h-[15rem] overflow-hidden rounded-[1.5rem] border shadow-lg transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl ${isDark ? 'border-white/10 bg-[#101d2d]' : 'border-white bg-[#123944]'}`}>
                  <div className="absolute inset-y-0 right-0 w-[62%]">
                    <Image
                      src={room.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw"
                      className="object-cover object-center transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#082a38] via-[#082a38]/95 via-[48%] to-[#082a38]/5" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04151e]/60 via-transparent to-[#04151e]/10" />
                  
                  {/* Room Header */}
                  <div className="relative z-10 flex min-h-[15rem] flex-col p-4 sm:p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${room.color} text-2xl shadow-lg sm:h-12 sm:w-12`}>
                        {room.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-bold leading-tight text-white sm:text-lg">{room.name}</h3>
                        <div className="mt-1 inline-flex rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/85 backdrop-blur-sm">
                          {room.mood}
                        </div>
                      </div>
                    </div>
                    
                    {/* Live indicator */}
                    <div className="flex flex-col items-end">
                      <div className={`w-3 h-3 rounded-full mb-1 ${roomCounts[room.id] > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} />
                      <span className="text-[10px] text-white/80">
                        {roomCounts[room.id] || 0} present
                      </span>
                    </div>
                  </div>

                  {/* Room Description */}
                  <p className="relative z-10 max-w-[18rem] text-xs leading-5 text-white/90 sm:text-sm">
                    {room.description}
                  </p>

                  {/* Inspiring Quote */}
                  <div className="relative z-10 mt-auto pt-3">
                    <div className="flex items-center gap-2 text-[10px] text-white/70">
                      <Feather className="h-3.5 w-3.5" />
                      <span>Today&apos;s reminder</span>
                    </div>
                    <p className="mt-1 border-l-2 border-emerald-300/70 pl-3 text-xs italic text-white sm:text-sm">
                      &quot;{room.quote}&quot;
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="relative z-10 mt-3">
                    <button
                      type="button"
                      aria-label={`Enter ${room.name} room`}
                      className={`inline-flex min-h-10 items-center justify-between gap-4 rounded-full bg-gradient-to-r ${room.color} px-4 text-xs font-bold text-white shadow-lg transition hover:brightness-110`}
                    >
                      <span>Enter this space</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Safety & Comfort Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <div className={`rounded-3xl border p-5 shadow-xl backdrop-blur-xl sm:p-8 ${isDark ? 'border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/90' : 'border-white bg-gradient-to-br from-white to-blue-50/80'}`}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Safety Guidelines */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Your Safety Matters</h3>
                </div>
                <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  This is a peer support community, not professional therapy. We&apos;re here to listen,
                  understand, and support each other through life&apos;s challenges.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className={isDark ? 'text-slate-200' : 'text-gray-700'}>Treat people with care and respect</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className={isDark ? 'text-slate-200' : 'text-gray-700'}>Choose an anonymous display name</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className={isDark ? 'text-slate-200' : 'text-gray-700'}>Avoid sharing identifying details</span>
                  </div>
                </div>
              </div>

              {/* Quick Resources */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-cyan-100">
                    <BookOpen className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Quick Resources</h3>
                </div>
                <div className="space-y-4">
                  <button 
                    onClick={() => router.push('/education')}
                    className={`group flex w-full items-center justify-between rounded-xl border p-4 transition-all ${isDark ? 'border-slate-700 bg-slate-800 hover:border-cyan-700 hover:bg-slate-700' : 'border-gray-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-cyan-600" />
                      <span className={`font-medium ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>Self-Care Guides</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                  </button>
                  
                  <button 
                    onClick={() => router.push('/emergency')}
                    className={`group flex w-full items-center justify-between rounded-xl border p-4 transition-all ${isDark ? 'border-red-900 bg-red-950/30 hover:border-red-700' : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50 hover:border-red-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-red-600" />
                      <span className={`font-medium ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>Immediate Help Resources</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final Invitation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className={`mb-6 inline-flex items-center gap-3 rounded-full border px-6 py-3 backdrop-blur-xl ${isDark ? 'border-cyan-800 bg-cyan-950/30' : 'border-cyan-200 bg-gradient-to-r from-cyan-500/10 to-blue-500/10'}`}>
            <Heart className="w-5 h-5 text-cyan-600" />
            <span className={`text-sm font-semibold ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
              💫 You&apos;re welcome here exactly as you are
            </span>
          </div>
          
          <p className={`mx-auto mb-8 max-w-2xl text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Whether you want to share your story or simply listen, there&apos;s a place for you here.
            No expectations, no judgments — just genuine human connection.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => enterChatRoom('general')}
            className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-lg text-white shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 mx-auto"
          >
            <Home className="w-6 h-6" />
            <span>Find Your Community</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-400 text-xs px-3 py-1 rounded-full font-bold animate-pulse">
              Welcome
            </div>
          </motion.button>
          
          <p className="text-gray-500 text-sm mt-6">
            💙 Take all the time you need. We&apos;ll be here when you&apos;re ready.
          </p>
        </motion.div>
      </main>

      {/* Gentle Footer */}
      <footer className={`relative z-10 mt-20 border-t py-8 ${isDark ? 'border-slate-700 bg-[#07101d]' : 'border-gray-200 bg-[#f5f8fc]'}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="text-left">
              <h4 className={`mb-2 font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>UNSPOKEN MINDS SAFEspace</h4>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>A community built on compassion and privacy</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>🇰🇪 Crisis: 0800 221 444</div>
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>🇺🇸 Crisis: 988</div>
            </div>
          </div>
          
          <p className={`mb-4 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Built with care for mental health support • © {new Date().getFullYear()}
          </p>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            This platform is not a substitute for professional medical advice. 
            If you&apos;re in crisis, please contact emergency services immediately.
          </p>
        </div>
      </footer>
    </div>
  );
}
