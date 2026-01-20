'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Shield, 
  Users, 
  Lock, 
  Sparkles, 
  ChevronRight, 
  MessageCircle, 
  Brain, 
  Zap, 
  Star,
  Settings,
  Moon,
  Sun,
  Palette,
  AlertCircle,
  BookOpen,
  Bell
} from 'lucide-react';

// Psychological themes based on research
const themes = {
  calm: {
    name: 'Calm & Peaceful',
    description: 'Soothing blues & greens. Reduces anxiety & stress.',
    light: {
      bg: 'from-blue-50 via-cyan-50 to-teal-50',
      primary: 'text-cyan-600',
      secondary: 'text-teal-500',
      cards: 'from-cyan-50/95 to-blue-50/95 border-cyan-200',
      statsBg: 'from-cyan-100/80 to-blue-100/80 border-cyan-300/50',
      button: 'from-cyan-600 to-teal-600',
      text: 'text-slate-900',
      subtext: 'text-slate-600'
    },
    dark: {
      bg: 'from-slate-900 via-cyan-900 to-blue-900',
      primary: 'text-cyan-300',
      secondary: 'text-teal-300',
      cards: 'from-cyan-900/80 to-blue-900/80 border-cyan-700',
      statsBg: 'from-cyan-900/60 to-blue-900/60 border-cyan-600/50',
      button: 'from-cyan-500 to-teal-500',
      text: 'text-white',
      subtext: 'text-gray-300'
    }
  },
  energetic: {
    name: 'Energetic & Hopeful',
    description: 'Warm oranges & golds. Boosts mood & motivation.',
    light: {
      bg: 'from-amber-50 via-orange-50 to-rose-50',
      primary: 'text-orange-600',
      secondary: 'text-rose-500',
      cards: 'from-orange-50/95 to-amber-50/95 border-orange-200',
      statsBg: 'from-amber-100/80 to-orange-100/80 border-amber-300/50',
      button: 'from-orange-600 to-rose-600',
      text: 'text-slate-900',
      subtext: 'text-slate-600'
    },
    dark: {
      bg: 'from-slate-900 via-orange-900 to-rose-900',
      primary: 'text-orange-300',
      secondary: 'text-rose-300',
      cards: 'from-orange-900/80 to-rose-900/80 border-orange-700',
      statsBg: 'from-amber-900/60 to-orange-900/60 border-orange-600/50',
      button: 'from-orange-500 to-rose-500',
      text: 'text-white',
      subtext: 'text-gray-300'
    }
  },
  growth: {
    name: 'Growth & Recovery',
    description: 'Fresh greens & nature tones. Promotes healing.',
    light: {
      bg: 'from-green-50 via-emerald-50 to-lime-50',
      primary: 'text-emerald-600',
      secondary: 'text-green-500',
      cards: 'from-emerald-50/95 to-green-50/95 border-emerald-200',
      statsBg: 'from-emerald-100/80 to-green-100/80 border-emerald-300/50',
      button: 'from-emerald-600 to-green-600',
      text: 'text-slate-900',
      subtext: 'text-slate-600'
    },
    dark: {
      bg: 'from-slate-900 via-emerald-900 to-green-900',
      primary: 'text-emerald-300',
      secondary: 'text-green-300',
      cards: 'from-emerald-900/80 to-green-900/80 border-emerald-700',
      statsBg: 'from-emerald-900/60 to-green-900/60 border-emerald-600/50',
      button: 'from-emerald-500 to-green-500',
      text: 'text-white',
      subtext: 'text-gray-300'
    }
  },
  focus: {
    name: 'Focus & Clarity',
    description: 'Cool purples & indigos. Enhances concentration.',
    light: {
      bg: 'from-purple-50 via-indigo-50 to-blue-50',
      primary: 'text-indigo-600',
      secondary: 'text-purple-500',
      cards: 'from-indigo-50/95 to-purple-50/95 border-indigo-200',
      statsBg: 'from-indigo-100/80 to-purple-100/80 border-indigo-300/50',
      button: 'from-indigo-600 to-purple-600',
      text: 'text-slate-900',
      subtext: 'text-slate-600'
    },
    dark: {
      bg: 'from-slate-900 via-purple-900 to-indigo-900',
      primary: 'text-indigo-300',
      secondary: 'text-purple-300',
      cards: 'from-indigo-900/80 to-purple-900/80 border-indigo-700',
      statsBg: 'from-purple-900/60 to-indigo-900/60 border-purple-600/50',
      button: 'from-indigo-500 to-purple-500',
      text: 'text-white',
      subtext: 'text-gray-300'
    }
  },
  warmth: {
    name: 'Warmth & Connection',
    description: 'Warm reds & coral. Fosters connection & safety.',
    light: {
      bg: 'from-red-50 via-rose-50 to-pink-50',
      primary: 'text-rose-600',
      secondary: 'text-red-500',
      cards: 'from-rose-50/95 to-red-50/95 border-rose-200',
      statsBg: 'from-rose-100/80 to-red-100/80 border-rose-300/50',
      button: 'from-rose-600 to-red-600',
      text: 'text-slate-900',
      subtext: 'text-slate-600'
    },
    dark: {
      bg: 'from-slate-900 via-red-900 to-rose-900',
      primary: 'text-rose-300',
      secondary: 'text-red-300',
      cards: 'from-red-900/80 to-rose-900/80 border-red-700',
      statsBg: 'from-rose-900/60 to-red-900/60 border-red-600/50',
      button: 'from-rose-500 to-red-500',
      text: 'text-white',
      subtext: 'text-gray-300'
    }
  }
};

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, messages: 0, active: 0 });
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('appTheme');
      // Validate if the saved theme exists in our themes object
      if (savedTheme && Object.keys(themes).includes(savedTheme)) {
        return savedTheme as keyof typeof themes;
      }
    }
    return 'calm';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('appDarkMode') === 'true';
    }
    return false;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fade in effect on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Save theme to localStorage
  const handleThemeChange = (theme: keyof typeof themes) => {
    setCurrentTheme(theme);
    localStorage.setItem('appTheme', theme);
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(prev => {
      const newDarkMode = !prev;
      localStorage.setItem('appDarkMode', String(newDarkMode));
      return newDarkMode;
    });
  };

  const currentThemeConfig = themes[currentTheme][isDarkMode ? 'dark' : 'light'];

  // Simulate live stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        users: prev.users < 1250 ? prev.users + 25 : prev.users,
        messages: prev.messages < 8900 ? prev.messages + 100 : prev.messages,
        active: Math.floor(Math.random() * 35) + 15
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Psychological principles applied:
  // 1. Social Proof (live stats, testimonials)
  // 2. Authority (professional icons, trust indicators)
  // 3. Reciprocity (free access, no strings)
  // 4. Scarcity (limited time/space indicators)
  // 5. Consistency (step-by-step process)
  // 6. Liking (warm, empathetic tone)

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Anonymous",
      description: "No names, emails, or personal details. Just genuine support.",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "End-to-End Secure",
      description: "Bank-level encryption protects every conversation.",
      color: "from-green-500 to-emerald-400"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Peer Support",
      description: "Connect with others who truly understand your journey.",
      color: "from-purple-500 to-pink-400"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Evidence-Based",
      description: "Rooms designed around therapeutic principles.",
      color: "from-orange-500 to-yellow-400"
    }
  ];

  const testimonials = [
    {
      name: "Alex",
      room: "Anxiety Support",
      text: "This space saved me during my worst panic attacks. Knowing I'm not alone made all the difference.",
      emoji: "💫"
    },
    {
      name: "Taylor",
      room: "Student Support",
      text: "Finally a place where I can talk about academic stress without judgment. The community here is incredible.",
      emoji: "📚"
    },
    {
      name: "Jordan",
      room: "Recovery Journey",
      text: "Celebrating small wins with strangers who became my biggest cheerleaders. Life-changing.",
      emoji: "🌱"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Choose Your Name",
      description: "Pick any name you like. No registration, no email."
    },
    {
      number: "02",
      title: "Select a Support Room",
      description: "Join discussions tailored to your current needs."
    },
    {
      number: "03",
      title: "Connect & Share",
      description: "Start chatting instantly with supportive peers."
    }
  ];

  return (
    <div className={`min-h-screen bg-linear-to-br ${currentThemeConfig.bg} ${currentThemeConfig.text} font-sans overflow-hidden relative`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-current/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-current/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-current/5 rounded-full blur-3xl"></div>
      </div>

      {/* Settings Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSettings(!showSettings)}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full shadow-lg backdrop-blur-xl ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/40 hover:bg-white/60'} border ${isDarkMode ? 'border-white/20' : 'border-white/30'}`}
      >
        <Settings className="w-6 h-6" />
      </motion.button>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-linear-to-br ${isDarkMode ? 'from-slate-800 to-slate-900 border-slate-700' : 'from-white to-blue-50 border-blue-200'} rounded-3xl border p-8 max-w-md w-full shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <Palette className={`w-6 h-6 ${currentThemeConfig.primary}`} />
                <h2 className={`text-2xl font-bold ${currentThemeConfig.text}`}>Theme Settings</h2>
              </div>

              {/* Dark Mode Toggle */}
              <div className={`mb-8 p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-slate-100/30 border-slate-300/50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold ${currentThemeConfig.text}`}>Dark Mode</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDarkModeToggle();
                    }}
                    className={`p-2 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer pointer-events-auto ${isDarkMode ? 'bg-slate-700 text-yellow-300 shadow-lg shadow-yellow-500/20' : 'bg-amber-200 text-amber-700 shadow-lg shadow-amber-500/20'}`}
                  >
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </button>
                </div>
                <p className={`text-sm ${currentThemeConfig.subtext}`}>
                  {isDarkMode ? 'Easy on the eyes in low light' : 'Bright and energizing'}
                </p>
              </div>

              {/* Theme Selection */}
              <div className="space-y-3 mb-6">
                <p className={`text-sm font-semibold ${currentThemeConfig.subtext} uppercase tracking-wide`}>Psychological Themes</p>
                {Object.entries(themes).map(([key, theme]) => (
                  <motion.button
                    key={key}
                    whileHover={{ x: 5 }}
                    onClick={() => handleThemeChange(key as keyof typeof themes)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      currentTheme === key
                        ? `border-current bg-current/15 ${currentThemeConfig.primary}`
                        : isDarkMode ? 'border-slate-600 bg-slate-700/30 text-gray-300 hover:border-slate-500' : 'border-gray-200 bg-gray-100/30 text-slate-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{theme.name}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{theme.description}</div>
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowSettings(false)}
                className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                  isDarkMode
                    ? 'bg-linear-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white'
                    : `bg-linear-to-r ${currentThemeConfig.button} text-white hover:opacity-90`
                }`}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating particles (client only to avoid SSR hydration mismatches) */}
      {isMounted && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-current/10"
              animate={{
                y: [0, -100, 0],
                x: [0, Math.sin(i) * 50, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                width: Math.random() * 20 + 5 + 'px',
                height: Math.random() * 20 + 5 + 'px',
                left: Math.random() * 100 + 'vw',
                top: Math.random() * 100 + 'vh',
                filter: 'blur(1px)'
              }}
            />
          ))}
        </div>
      )}

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl" ref={containerRef}>
        {/* Header with stats */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className={`inline-flex items-center gap-3 ${isDarkMode ? 'bg-white/10' : 'bg-white/40'} backdrop-blur-xl px-6 py-3 rounded-full mb-6 border ${isDarkMode ? 'border-white/20' : 'border-white/30'}`}>
            <Sparkles className={`w-5 h-5 ${currentThemeConfig.primary}`} />
            <span className={`text-sm font-semibold ${currentThemeConfig.primary}`}>
              🔒 100% Anonymous • ⚡ Real-time • ❤️ Peer Support
            </span>
          </div>

          <h1 className={`text-5xl md:text-6xl font-bold mb-4`}>
            <span className={`${currentThemeConfig.primary}`}>
              You're Not Alone
            </span>
            <br />
            <span className={`${currentThemeConfig.text}`}>
              in Your Mental Health Journey
            </span>
          </h1>
          
          <p className={`text-xl ${currentThemeConfig.subtext} max-w-3xl mx-auto mb-8`}>
            A safe, anonymous space where real people support each other through anxiety, stress, depression, and recovery. 
            No judgments, just understanding.
          </p>

          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`bg-linear-to-br ${currentThemeConfig.statsBg} backdrop-blur-xl p-6 rounded-2xl shadow-lg`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className={`w-6 h-6 ${currentThemeConfig.primary}`} />
                <div className={`text-3xl font-bold ${currentThemeConfig.text}`}>{stats.users.toLocaleString()}+</div>
              </div>
              <div className={currentThemeConfig.subtext}>Supported Members</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`bg-linear-to-br ${currentThemeConfig.statsBg} backdrop-blur-xl p-6 rounded-2xl shadow-lg`}
            >
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className={`w-6 h-6 ${currentThemeConfig.primary}`} />
                <div className={`text-3xl font-bold ${currentThemeConfig.text}`}>{stats.messages.toLocaleString()}+</div>
              </div>
              <div className={currentThemeConfig.subtext}>Supportive Messages</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`bg-linear-to-br ${currentThemeConfig.statsBg} backdrop-blur-xl p-6 rounded-2xl shadow-lg`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className={`w-6 h-6 ${currentThemeConfig.primary}`} />
                <div className={`text-3xl font-bold ${currentThemeConfig.text}`}>{stats.active}</div>
              </div>
              <div className={currentThemeConfig.subtext}>Active Now</div>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <button
            onClick={() => router.push('/login')}
            className="group relative px-10 py-5 bg-linear-to-r from-emerald-600 to-green-500 rounded-2xl font-bold text-lg hover:from-emerald-700 hover:to-green-600 transition-all duration-300 shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 flex items-center gap-3 text-white"
          >
            <MessageCircle className="w-5 h-5" />
            Start Chatting Now
            <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 py-1 rounded-full animate-pulse">
              Live
            </div>
          </button>
          
          <button
            onClick={() => router.push('/chat-rooms')}
            className={`px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-3 border backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' 
                : 'bg-white/40 border-white/50 hover:bg-white/60 text-slate-900'
            }`}
          >
            <Users className="w-5 h-5" />
            Explore Support Rooms
          </button>
        </motion.div>

        {/* Features - Building Trust Through Transparency */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className={`text-4xl font-bold text-center mb-4`}>
            <span className={`${currentThemeConfig.primary}`}>
              Why People Trust Us
            </span>
          </h2>
          <p className={`${currentThemeConfig.subtext} text-center mb-12 max-w-2xl mx-auto`}>
            Designed with privacy, safety, and genuine connection at the core.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Shield className="w-6 h-6" />,
                title: "100% Anonymous",
                description: "No names, emails, or personal details. Just genuine support.",
                color: "from-blue-500 to-cyan-400"
              },
              {
                icon: <Lock className="w-6 h-6" />,
                title: "End-to-End Secure",
                description: "Bank-level encryption protects every conversation.",
                color: "from-green-500 to-emerald-400"
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Peer Support",
                description: "Connect with others who truly understand your journey.",
                color: "from-purple-500 to-pink-400"
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: "Evidence-Based",
                description: "Rooms designed around therapeutic principles.",
                color: "from-orange-500 to-yellow-400"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group bg-linear-to-br ${currentThemeConfig.cards} backdrop-blur-xl p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className={`inline-flex p-3 rounded-xl bg-linear-to-br ${feature.color} mb-4 text-white`}>
                  {feature.icon}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${currentThemeConfig.text}`}>{feature.title}</h3>
                <p className={`${currentThemeConfig.subtext} text-sm`}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials - Social Validation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className={`text-4xl font-bold text-center mb-4`}>
            <span className={`${currentThemeConfig.secondary}`}>
              Real Stories, Real Support
            </span>
          </h2>
          <p className={`${currentThemeConfig.subtext} text-center mb-12 max-w-2xl mx-auto`}>
            Hear from members who found connection when they needed it most.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Alex",
                room: "Anxiety Support",
                text: "This space saved me during my worst panic attacks. Knowing I'm not alone made all the difference.",
                emoji: "💫"
              },
              {
                name: "Taylor",
                room: "Student Support",
                text: "Finally a place where I can talk about academic stress without judgment. The community here is incredible.",
                emoji: "📚"
              },
              {
                name: "Jordan",
                room: "Recovery Journey",
                text: "Celebrating small wins with strangers who became my biggest cheerleaders. Life-changing.",
                emoji: "🌱"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-linear-to-br ${currentThemeConfig.cards} backdrop-blur-xl p-6 rounded-2xl border`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 bg-linear-to-br ${currentThemeConfig.button} rounded-full flex items-center justify-center text-lg`}>
                    {testimonial.emoji}
                  </div>
                  <div>
                    <div className={`font-bold ${currentThemeConfig.text}`}>{testimonial.name}</div>
                    <div className={`text-sm ${currentThemeConfig.primary}`}>{testimonial.room}</div>
                  </div>
                </div>
                <p className={`${currentThemeConfig.subtext} italic`}>"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Safety & Resources Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-12"
        >
          <div className={`bg-linear-to-br ${isDarkMode ? 'from-slate-800/90 to-slate-900/90 border-slate-700' : 'from-blue-50/90 to-purple-50/90 border-blue-200'} backdrop-blur-xl rounded-3xl border p-8 shadow-xl`}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Safety Notice */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className={`w-6 h-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  <h3 className={`text-xl font-bold ${currentThemeConfig.text}`}>Important Safety Note</h3>
                </div>
                <p className={`${currentThemeConfig.subtext} mb-4`}>
                  These are peer support rooms, not professional therapy. Our community is moderated 24/7 
                  to ensure a safe, supportive environment for everyone.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className={`flex items-center gap-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    <Shield className="w-4 h-4" />
                    <span>HIPAA Compliant</span>
                  </div>
                  <div className={`flex items-center gap-2 ${currentThemeConfig.primary}`}>
                    <Lock className="w-4 h-4" />
                    <span>End-to-End Encrypted</span>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className={`w-6 h-6 ${currentThemeConfig.primary}`} />
                  <h3 className={`text-xl font-bold ${currentThemeConfig.text}`}>Additional Resources</h3>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/education')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors group border ${isDarkMode ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500' : 'bg-white/40 border-white/50 hover:bg-white/60'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Brain className={`w-5 h-5 ${currentThemeConfig.primary}`} />
                      <span className={currentThemeConfig.text}>Educational Materials</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-slate-600 group-hover:text-slate-900'} transition-colors`} />
                  </button>
                  
                  <button 
                    onClick={() => router.push('/emergency')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors group border ${isDarkMode ? 'bg-red-900/30 border-red-700 hover:bg-red-900/50 hover:border-red-600' : 'bg-red-100/40 border-red-200 hover:bg-red-200/60'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Bell className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                      <span className={currentThemeConfig.text}>Emergency Help Resources</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-red-400 group-hover:text-red-300' : 'text-red-600 group-hover:text-red-700'} transition-colors`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 bg-linear-to-r from-emerald-900/40 to-green-900/40 backdrop-blur-xl px-6 py-3 rounded-full mb-6 border border-emerald-500/30">
            <Heart className="w-5 h-5 text-emerald-300" />
            <span className="text-sm font-semibold text-emerald-300">
              💚 you are never alone here. Real people, real support.
            </span>
          </div>
          
          <p className={`${currentThemeConfig.subtext} mb-8 max-w-2xl mx-auto`}>
            Every room is a judgment-free zone where you can share openly or simply listen. 
            Your privacy is our absolute priority.
          </p>

          <button
            onClick={() => router.push('/chat-rooms')}
            className={`group relative px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl flex items-center gap-3 mx-auto bg-linear-to-r ${currentThemeConfig.button} text-white hover:opacity-90`}
          >
            <MessageCircle className="w-6 h-6" />
            <span>Find Your Support Room</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>

          {/* Trust Signals */}
          <div className="mt-12 pt-8 border-t border-current/20">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>24/7 Moderated</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>No Data Selling</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Real Human Support</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 pt-8 pb-8 border-t border-current/10">
        <div className="container mx-auto px-4 text-center">
          <p className={`${currentThemeConfig.subtext} text-sm mb-2`}>
            Built with ❤️ for mental health support • © {new Date().getFullYear()} Kirinyaga Safespace
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>
            If you're in crisis, please contact emergency services immediately.
          </p>
        </div>
      </footer>
    </div>
  );
}