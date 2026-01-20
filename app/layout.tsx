'use client';

import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import AnonymousProfile from './components/AnonymousProfile'; // FIXED IMPORT

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for logged in user on client side only
    setIsLoggedIn(!!localStorage.getItem('anonymousUser'));
  }, []);

  return (
    <html lang="en">
      <head>
        <title>KIRINYAGA SAFESPACE</title>
        <meta name="description" content="Anonymous mental health support platform" />
      </head>
      <body className={`${inter.className}`} style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        {/* Emergency Help Button */}
        <div className="fixed top-4 right-4 z-50">
          <a 
            href="/emergency" 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
          >
            🚨 Emergency Help
          </a>
        </div>
        
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-40 border-b" style={{ background: 'var(--background)', borderColor: 'rgba(0,0,0,0.08)' }}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden text-zinc-400 text-xl mr-4"
              >
                ☰
              </button>
              <a href="/" className="text-green-500 font-bold text-xl">
                KIRINYAGA SAFESPACE
              </a>
              <div className="hidden md:flex gap-4 text-sm">
                <a href="/chat-rooms" className="text-zinc-300 hover:text-white">
                  💬 Support Rooms
                </a>
                <a href="/education" className="text-zinc-300 hover:text-white">
                  📚 Resources
                </a>
                <a href="/progress" className="text-zinc-300 hover:text-white">
                  📊 My Progress
                </a>
                <a href="/professionals" className="text-zinc-300 hover:text-white">
                  🩺 Professionals
                </a>
                {/* Profile link - only show when logged in */}
                {isLoggedIn && (
                  <a href="/profile" className="text-zinc-300 hover:text-white">
                    👤 My Profile
                  </a>
                )}
              </div>
            </div>
            
            <div className="hidden md:block">
              <span className="text-xs text-zinc-500">
                Anonymous & Secure
              </span>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden bg-zinc-900 border-t border-zinc-800">
              <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
                <a href="/chat-rooms" className="text-zinc-300 hover:text-white py-2">
                  💬 Support Rooms
                </a>
                <a href="/education" className="text-zinc-300 hover:text-white py-2">
                  📚 Resources
                </a>
                <a href="/progress" className="text-zinc-300 hover:text-white py-2">
                  📊 My Progress
                </a>
                <a href="/professionals" className="text-zinc-300 hover:text-white py-2">
                  🩺 Professionals
                </a>
                {/* Profile link for mobile - only show when logged in */}
                {isLoggedIn && (
                  <a href="/profile" className="text-zinc-300 hover:text-white py-2">
                    👤 My Profile
                  </a>
                )}
              </div>
            </div>
          )}
        </nav>
        
        
        {/* Main Content */}
        <main className="pt-16">
          {children}
        </main>
        
        {/* Anonymous Profile Management Component */}
        <AnonymousProfile />
        
        {/* Footer */}
        <footer className="border-t mt-20 py-6" style={{ borderColor: 'rgba(0,0,0,0.08)', background: 'var(--background)' }}>
          <div className="max-w-7xl mx-auto px-4 text-center text-zinc-500 text-sm">
            <p>KIRINYAGA SAFESPACE • Peer Support Platform • All chats are anonymous</p>
            <p className="mt-2 text-xs">
              ⚠️ This is not a substitute for professional medical help.
            </p>
            <p className="mt-1 text-xs">
              Crisis Line: 0800 221 444
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}