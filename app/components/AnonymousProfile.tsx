'use client';

import { useState } from 'react';

export default function AnonymousProfile() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = () => {
    // Create anonymous user ID if not exists
    if (!localStorage.getItem('anonymousUser')) {
      const randomId = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('anonymousUser', randomId);
      window.location.reload(); // Refresh to update login state
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('anonymousUser');
    window.location.reload(); // Refresh to update login state
  };

  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('anonymousUser');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
      >
        👤 {isLoggedIn ? 'Profile' : 'Anonymous Login'}
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-zinc-900 border border-zinc-800 rounded-lg p-4 w-64 shadow-lg">
          {isLoggedIn ? (
            <>
              <p className="text-sm text-zinc-300 mb-3">
                Logged in as: <br />
                <span className="text-xs text-zinc-400">
                  {localStorage.getItem('anonymousUser')}
                </span>
              </p>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-300 mb-3">
                Login anonymously to save your progress
              </p>
              <button
                onClick={handleLogin}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm"
              >
                Create Anonymous Account
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}