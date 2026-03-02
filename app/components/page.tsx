'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { clearSessionAnonymousName, getSessionAnonymousName, ensureSessionAnonymousName } from '@/utils/sessionAnon';
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Clock, 
  Calendar, 
  Heart, 
  Brain, 
  Key, 
  Copy, 
  Edit2, 
  Save, 
  X, 
  Palette,
  ChevronLeft,
  Activity
} from 'lucide-react';

interface UserProfile {
  id: string;
  anonymous_name: string;
  color_palette: string;
  brain_icon: string;
  created_at: string;
  last_login: string;
  session_count: number;
  recovery_phrase: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [sessionAnonymousName, setSessionAnonymousNameState] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('anonymousUser');
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      setNewName(userData.anonymous_name);
      setSessionAnonymousNameState(ensureSessionAnonymousName());
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  const handleUpdateName = () => {
    if (!user || !newName.trim()) return;
    
    const updatedUser = { ...user, anonymous_name: newName };
    localStorage.setItem('anonymousUser', JSON.stringify(updatedUser));
    
    // Update in full user list if exists
    const allUsers = JSON.parse(localStorage.getItem('kirinyagaUsers') || '[]');
    const updatedAllUsers = allUsers.map((u: UserProfile) => 
      u.id === user.id ? updatedUser : u
    );
    localStorage.setItem('kirinyagaUsers', JSON.stringify(updatedAllUsers));
    
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('anonymousUser');
    clearSessionAnonymousName();
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-700 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 font-sans p-4 md:p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4"
        >
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-white">My Anonymous Profile</h1>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${user.color_palette || 'from-blue-400 to-cyan-500'} flex items-center justify-center text-6xl shadow-lg`}>
                {user.brain_icon || '🧠'}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-black/30 border border-white/20 rounded-lg px-3 py-1 text-white text-xl font-bold focus:outline-none focus:border-green-500"
                        autoFocus
                      />
                      <button onClick={handleUpdateName} className="p-2 bg-green-600 rounded-lg hover:bg-green-500 text-white">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setIsEditing(false)} className="p-2 bg-red-600 rounded-lg hover:bg-red-500 text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-white">{user.anonymous_name}</h2>
                      <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
                {sessionAnonymousName && (
                  <p className="text-xs text-indigo-200 mt-2">
                    Session anonymous name: {sessionAnonymousName}
                  </p>
                )}
                <p className="text-indigo-200 flex items-center justify-center md:justify-start gap-2">
                  <Shield className="w-4 h-4" />
                  Anonymous Identity Protected
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 text-indigo-300 mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Sessions</span>
                </div>
                <div className="text-2xl font-bold text-white">{user.session_count || 1}</div>
              </div>
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 text-indigo-300 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Member Since</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {user.created_at ? formatDate(user.created_at) : 'Today'}
                </div>
              </div>
            </div>

            {/* Recovery Phrase Section */}
            <div className="bg-indigo-900/30 rounded-2xl p-6 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Key className="w-5 h-5 text-indigo-400" />
                  <h3>Recovery Phrase</h3>
                </div>
                <button 
                  onClick={() => setShowRecovery(!showRecovery)}
                  className="text-xs bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 px-3 py-1 rounded-full transition-colors"
                >
                  {showRecovery ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showRecovery ? (
                <div className="relative">
                  <div className="bg-black/40 p-4 rounded-xl font-mono text-center text-lg text-indigo-100 tracking-wide border border-indigo-500/20">
                    {user.recovery_phrase || 'No phrase generated'}
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(user.recovery_phrase);
                      alert('Copied to clipboard!');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="bg-black/40 p-4 rounded-xl text-center text-gray-500 italic border border-white/5">
                  •••• •••• •••• ••••
                </div>
              )}
              <p className="text-xs text-indigo-300/60 mt-3 text-center">
                Keep this phrase safe. It's the only way to recover your anonymous account.
              </p>
            </div>
          </motion.div>

          {/* Sidebar Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Actions
              </h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/chat-rooms')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 transition-colors text-left"
                >
                  <Brain className="w-5 h-5 text-cyan-400" />
                  Return to Chat
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-left border border-red-500/20"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 border border-emerald-500/20 rounded-3xl p-6">
              <h3 className="text-emerald-400 font-bold mb-2">Safe Space Tip</h3>
              <p className="text-sm text-emerald-100/80">
                "You don't have to control your thoughts. You just have to stop letting them control you."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
