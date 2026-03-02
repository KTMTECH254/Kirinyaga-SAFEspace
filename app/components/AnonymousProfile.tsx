'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, LogIn } from 'lucide-react';

type AnonymousUser = {
  name?: string;
  displayName?: string;
};

export default function AnonymousProfile() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string | null>(null);

  useEffect(() => {
    // Helper to get session name safely
    const getSessionName = () => {
      if (typeof window === 'undefined') return null;
      return sessionStorage.getItem('anonymousSessionName');
    };

    const stored = localStorage.getItem('anonymousUser');
    setSessionName(getSessionName());

    if (!stored) {
      setProfileName(null);
      return;
    }
    try {
      const parsed = JSON.parse(stored) as AnonymousUser;
      setProfileName(parsed.displayName || parsed.name || null);
    } catch {
      setProfileName(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('anonymousUser');
    sessionStorage.removeItem('anonymousSessionName');
    window.location.reload();
  };

  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('anonymousUser');

  return (
    <div className="fixed bottom-24 right-5 z-40 lg:bottom-8 lg:right-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg ${isOpen
            ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/20'
            : 'bg-[#0B1121]/80 border-white/10 text-blue-100 hover:bg-[#0B1121] hover:border-white/20'
          }`}
      >
        <User size={18} />
        <span className="text-sm font-medium">{isLoggedIn ? 'Profile' : 'Sign In'}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 glass-panel rounded-2xl p-5 animate-fade-in-up">
          {isLoggedIn ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {profileName ? profileName[0].toUpperCase() : 'A'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {profileName || 'Anonymous Traveler'}
                  </p>
                  <p className="text-xs text-blue-200/60">
                    Online Now
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/profile');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-blue-100 transition-colors"
                >
                  <span>My Journey</span>
                  <span className="text-white/40">→</span>
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/settings');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-blue-100 transition-colors"
                >
                  <span>Settings</span>
                  <span className="text-white/40">→</span>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-200 py-2.5 rounded-xl text-sm font-medium transition-colors border border-red-500/20"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center">
                <User size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Welcome back</h3>
                <p className="text-xs text-blue-200/60 leading-relaxed">
                  Sign in to save your safe spaces, track your growth, and rejoin your circles.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/login');
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
              >
                <LogIn size={16} />
                Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
