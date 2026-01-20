'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Lock, 
  Shield, 
  Zap, 
  Heart, 
  Sparkles, 
  Brain,
  MessageCircle,
  Star,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Bell,
  Coffee,
  Moon,
  Sun,
  Wind,
  Waves,
  Feather,
  Leaf,
  Target,
  Home,
  Smile
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
    color: 'from-cyan-400 to-blue-500',
    quote: 'Breathe. You are safe here.',
    mood: 'Calm & Peaceful'
  },
  {
    id: 'stress',
    name: 'Stress Management',
    description: 'Share stress relief techniques and mindful coping methods',
    icon: '🌿',
    color: 'from-emerald-400 to-green-500',
    quote: 'Release tension. Find your center.',
    mood: 'Grounding & Balanced'
  },
  {
    id: 'depression',
    name: 'Depression Support',
    description: 'Warm, understanding space for low mood days and recovery',
    icon: '🤝',
    color: 'from-purple-400 to-pink-500',
    quote: 'You are not alone in this journey.',
    mood: 'Compassionate & Warm'
  },
  {
    id: 'general',
    name: 'General Wellness',
    description: 'Holistic discussions about mental well-being and self-care',
    icon: '💫',
    color: 'from-amber-400 to-orange-500',
    quote: 'Small steps lead to big changes.',
    mood: 'Supportive & Uplifting'
  },
  {
    id: 'students',
    name: 'Student Support',
    description: 'Academic pressure relief, study tips, and life balance',
    icon: '🎓',
    color: 'from-rose-400 to-pink-500',
    quote: 'Balance studies with self-care.',
    mood: 'Energetic & Encouraging'
  },
  {
    id: 'recovery',
    name: 'Recovery Journey',
    description: 'Celebrate progress and share healing stories together',
    icon: '🌱',
    color: 'from-teal-400 to-emerald-500',
    quote: 'Every day is a fresh start.',
    mood: 'Hopeful & Growing'
  }
];

export default function ChatRoomsPage() {
  const router = useRouter();
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [totalOnline, setTotalOnline] = useState(0);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState('calm');
  const [showWelcome, setShowWelcome] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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
        setRoomCounts(prev => ({
          ...prev,
          [room.id]: count
        }));
        
        // Update total online
        const total = Object.values(roomCounts).reduce((a, b) => a + b, 0);
        setTotalOnline(total);
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

    setIsLoading(false);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const enterChatRoom = (roomId: string) => {
    // Add gentle transition effect
    document.body.style.opacity = '0.95';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-blue-900/95 via-purple-900/95 to-emerald-900/95 backdrop-blur-sm"
      onClick={() => setShowWelcome(false)}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Welcome Home</h2>
          <p className="text-blue-100 mb-6">
            Take a deep breath. You've found a safe space where understanding hearts meet.
          </p>
        </div>
        
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-300" />
            <span className="text-white">Your privacy is protected</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-cyan-300" />
            <span className="text-white">Real people who understand</span>
          </div>
          <div className="flex items-center gap-3">
            <Coffee className="w-5 h-5 text-amber-300" />
            <span className="text-white">No pressure, just presence</span>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowWelcome(false)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg"
        >
          I'm Ready to Explore
        </motion.button>
        
        <p className="text-center text-blue-200/60 text-sm mt-4">
          💫 Take your time. There's no rush here.
        </p>
      </motion.div>
    </motion.div>
  );

  // Calming breathing exercise
  const BreathingExercise = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-2/3">
            <h3 className="text-2xl font-bold text-white mb-3">Before You Begin</h3>
            <p className="text-blue-100 mb-6">
              Let's take a moment together. Close your eyes if you're comfortable, and follow this gentle breathing exercise.
            </p>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {['Breathe In', 'Hold', 'Breathe Out', 'Rest'].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">{i+1}</span>
                  </div>
                  <span className="text-sm text-blue-200">{step}</span>
                </div>
              ))}
            </div>
            <p className="text-blue-200/80 text-sm italic">
              "Your feelings are valid. Your presence matters."
            </p>
          </div>
          <div className="md:w-1/3">
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 border border-white/10 animate-pulse mx-auto">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Leaf className="w-16 h-16 text-white/60 animate-bounce" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-green-500 text-xs px-3 py-1 rounded-full font-bold">
                Calm Exercise
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 font-sans overflow-hidden relative transition-colors duration-1000">
      {/* Hidden audio for calming sounds */}
      {/* <audio ref={audioRef} loop>
        <source src="https://assets.mixkit.co/active_storage/sfx/286/286-preview.mp3" type="audio/mpeg" />
      </audio> */}

      {/* Welcome Overlay */}
      <AnimatePresence>
        {showWelcome && <WelcomeOverlay />}
      </AnimatePresence>

      {/* Floating calming elements */}
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

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Gentle Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl px-6 py-3 rounded-full mb-6 border border-white/40 shadow-lg"
          >
            <Sparkles className="w-5 h-5 text-cyan-600" />
            <span className="text-sm font-semibold text-cyan-600">
              💙 A Safe Space for Healing & Connection
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            <span className="block">Find Your</span>
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Comfort Zone
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Choose a room that feels right for you today. Every space is designed with care, 
            compassion, and complete privacy.
          </p>

          {/* Live Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
            {[
              { value: totalOnline, label: 'People Ready to Listen', icon: <Users className="w-5 h-5" />, color: 'text-cyan-600' },
              { value: '24/7', label: 'Moderated Safety', icon: <Shield className="w-5 h-5" />, color: 'text-emerald-600' },
              { value: '100%', label: 'Anonymous', icon: <Lock className="w-5 h-5" />, color: 'text-purple-600' },
              { value: '0s', label: 'Wait Time', icon: <Zap className="w-5 h-5" />, color: 'text-amber-600' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-white/60 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${stat.color.replace('text', 'bg')}/10`}>
                    {stat.icon}
                  </div>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
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
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatRoomsList.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onHoverStart={() => setHoveredRoom(room.id)}
                onHoverEnd={() => setHoveredRoom(null)}
                className="group relative"
                onClick={() => enterChatRoom(room.id)}
              >
                {/* Card with soft, comforting design */}
                <div className="relative bg-gradient-to-br from-white to-blue-50/80 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-xl hover:shadow-2xl transition-all duration-500 h-full overflow-hidden">
                  {/* Gentle corner accent */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${room.color} opacity-10 rounded-full -translate-y-16 translate-x-16`} />
                  
                  {/* Room Header */}
                  <div className="flex items-start justify-between mb-5 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${room.color} flex items-center justify-center text-3xl shadow-lg`}>
                        {room.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{room.name}</h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${room.color.replace('from-', 'from-').replace('to-', 'to-')}/10 text-gray-600`}>
                          {room.mood}
                        </div>
                      </div>
                    </div>
                    
                    {/* Live indicator */}
                    <div className="flex flex-col items-end">
                      <div className={`w-3 h-3 rounded-full mb-1 ${roomCounts[room.id] > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-500">
                        {roomCounts[room.id] || 0} present
                      </span>
                    </div>
                  </div>

                  {/* Room Description */}
                  <p className="text-gray-600 mb-5 leading-relaxed relative z-10">
                    {room.description}
                  </p>

                  {/* Inspiring Quote */}
                  <div className="mb-6 relative z-10">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Feather className="w-4 h-4" />
                      <span>Today's reminder:</span>
                    </div>
                    <p className="text-gray-700 italic pl-6 border-l-2 border-blue-200">
                      "{room.quote}"
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="relative z-10 pt-6 border-t border-gray-100">
                    <motion.button
                      whileHover={{ x: 5 }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r ${room.color} text-white shadow-lg hover:shadow-xl transition-all`}
                    >
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-semibold">Enter this space</span>
                      </div>
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Gentle hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
          <div className="bg-gradient-to-br from-white to-blue-50/80 backdrop-blur-xl rounded-3xl border border-white p-8 shadow-xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Safety Guidelines */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Your Safety Matters</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  This is a peer support community, not professional therapy. We're here to listen, 
                  understand, and support each other through life's challenges.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-gray-700">24/7 active moderation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-gray-700">Complete anonymity</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-gray-700">Zero tolerance for harm</span>
                  </div>
                </div>
              </div>

              {/* Quick Resources */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-cyan-100">
                    <BookOpen className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Quick Resources</h3>
                </div>
                <div className="space-y-4">
                  <button 
                    onClick={() => router.push('/education')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 hover:border-cyan-200 hover:bg-cyan-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-cyan-600" />
                      <span className="text-gray-800 font-medium">Self-Care Guides</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                  </button>
                  
                  <button 
                    onClick={() => router.push('/emergency')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 hover:border-red-300 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-red-600" />
                      <span className="text-gray-800 font-medium">Immediate Help Resources</span>
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
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl px-6 py-3 rounded-full mb-6 border border-cyan-200">
            <Heart className="w-5 h-5 text-cyan-600" />
            <span className="text-sm font-semibold text-cyan-600">
              💫 You're welcome here exactly as you are
            </span>
          </div>
          
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
            Whether you want to share your story or simply listen, there's a place for you here. 
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
            💙 Take all the time you need. We'll be here when you're ready.
          </p>
        </motion.div>
      </main>

      {/* Gentle Footer */}
      <footer className="relative z-10 mt-20 pt-8 pb-8 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="text-left">
              <h4 className="font-bold text-gray-800 mb-2">Kirinyaga Safespace</h4>
              <p className="text-gray-600 text-sm">A community built on compassion and privacy</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-gray-500 text-sm">🇰🇪 Crisis: 0800 221 444</div>
              <div className="text-gray-500 text-sm">🇺🇸 Crisis: 988</div>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm mb-4">
            Built with care for mental health support • © {new Date().getFullYear()}
          </p>
          <p className="text-gray-400 text-xs">
            This platform is not a substitute for professional medical advice. 
            If you're in crisis, please contact emergency services immediately.
          </p>
        </div>
      </footer>
    </div>
  );
}