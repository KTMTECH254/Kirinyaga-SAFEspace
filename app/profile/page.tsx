'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('anonymousUser');
    if (!user) {
      router.push('/');
    } else {
      setUserId(user);
    }
  }, [router]);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">👤 My Profile</h1>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Anonymous ID</h2>
          <p className="text-zinc-300 bg-zinc-800 p-3 rounded">{userId}</p>
          <p className="text-sm text-zinc-500 mt-2">
            This is your anonymous identifier. No personal information is stored.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Session Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-800 p-4 rounded">
              <p className="text-sm text-zinc-400">Total Sessions</p>
              <p className="text-2xl font-bold text-white">1</p>
            </div>
            <div className="bg-zinc-800 p-4 rounded">
              <p className="text-sm text-zinc-400">Last Active</p>
              <p className="text-xl font-bold text-white">Today</p>
            </div>
            <div className="bg-zinc-800 p-4 rounded">
              <p className="text-sm text-zinc-400">Account Created</p>
              <p className="text-xl font-bold text-white">Today</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Privacy Info</h2>
          <ul className="text-zinc-300 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">🔒</span>
              <span>No email or personal info required</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🔄</span>
              <span>Your ID resets if you clear browser data</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">👁️</span>
              <span>No tracking or personal data collection</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('anonymousUser');
            router.push('/');
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
        >
          Logout & Clear Data
        </button>
      </div>
    </div>
  );
}