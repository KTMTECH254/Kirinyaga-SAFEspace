'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedName, setGeneratedName] = useState<string>('');
  
  // Enhanced fun anonymous name generator
  const generateAnonymousName = () => {
    const adjectives = [
      'Brave', 'Calm', 'Hopeful', 'Gentle', 'Peaceful', 'Caring', 
      'Wise', 'Kind', 'Strong', 'Quiet', 'Bright', 'Warm', 'Soft',
      'Still', 'True', 'Deep', 'Clear', 'Light', 'Safe', 'Free'
    ];
    
    const animals = [
      'Butterfly', 'Oak', 'River', 'Mountain', 'Star', 'Sunflower',
      'Wave', 'Comet', 'Moon', 'Forest', 'Ocean', 'Sky', 'Stone',
      'Feather', 'Breeze', 'Rain', 'Cloud', 'Dawn', 'Dusk', 'Path'
    ];
    
    const symbols = ['·', '~', '•', '※', '⁕', '⁂', '✦', '✧', '❋', '❈'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const number = Math.floor(Math.random() * 999);
    
    return `${adjective}${animal}${symbol}${number}`;
  };

  const handleAnonymousLogin = () => {
    setIsLoading(true);
    
    // Generate fresh anonymous user
    const anonymousName = generatedName || generateAnonymousName();
    const anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const anonymousUser = {
      id: anonymousId,
      name: anonymousName,
      isAnonymous: true,
      loginTime: new Date().toISOString(),
      sessionId: Date.now().toString() // Fresh session ID each time
    };

    // Save to localStorage
    localStorage.setItem('anonymousUser', JSON.stringify(anonymousUser));
    
    // Also save to sessionStorage for extra freshness
    sessionStorage.setItem('currentSession', JSON.stringify({
      sessionStart: new Date().toISOString(),
      userName: anonymousName
    }));
    
    console.log('New anonymous user created:', anonymousUser);
    
    // Add school project analytics (optional)
    const projectStats = JSON.parse(localStorage.getItem('kirinyaga_stats') || '{"logins": 0}');
    projectStats.logins = (projectStats.logins || 0) + 1;
    localStorage.setItem('kirinyaga_stats', JSON.stringify(projectStats));
    
    // Navigate after short delay for better UX
    setTimeout(() => {
      router.push('/chat-rooms');
    }, 800);
  };

  // Generate a preview name on hover
  const handleGeneratePreview = () => {
    if (!isLoading) {
      setGeneratedName(generateAnonymousName());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main glass card */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl shadow-black/30 p-8 md:p-10 transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-500/20">
          
          {/* App header with school project badge */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-2xl text-white">🌿</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent mb-3">
              KIRINYAGA
            </h1>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              SAFESpace
            </h2>
            
            <p className="text-zinc-300 text-lg leading-relaxed max-w-sm mx-auto">
              Anonymous Mental Health Support
            </p>
            
            {/* School project badge */}
            <div className="inline-block mt-4 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <span className="text-xs text-purple-300">School Project • Complete Privacy</span>
            </div>
          </div>

          {/* Name Preview Card */}
          <div 
            className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-white/5 cursor-pointer hover:border-cyan-500/20 transition-all duration-300"
            onMouseEnter={handleGeneratePreview}
            onClick={handleGeneratePreview}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                <span className="text-teal-300">🎭</span>
              </div>
              <h3 className="text-zinc-100 font-medium">Your Anonymous Identity</h3>
            </div>
            
            {generatedName ? (
              <div className="text-center">
                <p className="text-zinc-400 text-sm mb-2">You'll enter as:</p>
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent animate-pulse">
                  {generatedName}
                </div>
                <p className="text-zinc-500 text-xs mt-2">
                  Hover/click for a new random identity
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-zinc-400 text-sm mb-2">Hover here to see your random name</p>
                <div className="text-lg text-zinc-500 italic">
                  BraveOak•42, CalmRiver※789, GentleWave~123
                </div>
              </div>
            )}
          </div>

          {/* Privacy features showcase */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent border border-cyan-500/10">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">🔒</span>
                <span className="text-xs text-zinc-300">No Sign-up</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10">
              <div className="flex items-center gap-2">
                <span className="text-purple-400">🔄</span>
                <span className="text-xs text-zinc-300">Fresh Each Time</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/5 to-transparent border border-teal-500/10">
              <div className="flex items-center gap-2">
                <span className="text-teal-400">🤫</span>
                <span className="text-xs text-zinc-300">No Tracking</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/5 to-transparent border border-pink-500/10">
              <div className="flex items-center gap-2">
                <span className="text-pink-400">🚫</span>
                <span className="text-xs text-zinc-300">No Cookies</span>
              </div>
            </div>
          </div>

          {/* Main action */}
          <div className="space-y-6">
            <button
              onClick={handleAnonymousLogin}
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center gap-2 ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Your Private Space...
                </>
              ) : (
                <>
                  Enter Anonymously
                  <span className="ml-2">→</span>
                </>
              )}
            </button>

            {/* Project explanation for demo */}
            <div className="pt-4 border-t border-white/5">
              <p className="text-zinc-500 text-sm text-center leading-relaxed">
                <span className="text-cyan-300">School Project Feature:</span> Complete privacy by design. 
                Each visit creates a new anonymous identity.
              </p>
            </div>
          </div>

          {/* How it works for demo purposes */}
          <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-slate-800/30 to-slate-900/30 border border-white/5">
            <h4 className="text-zinc-300 font-medium mb-3 text-center">How It Works (Demo)</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-xs text-cyan-300">1</span>
                </div>
                <span className="text-sm text-zinc-400">Click button to generate random identity</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <span className="text-xs text-teal-300">2</span>
                </div>
                <span className="text-sm text-zinc-400">Join chat rooms with your anonymous name</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-xs text-purple-300">3</span>
                </div>
                <span className="text-sm text-zinc-400">Close browser to erase all traces</span>
              </div>
            </div>
          </div>

          {/* Demo note for presentation */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
            <p className="text-yellow-300 text-xs text-center">
              💡 <strong>Demo Tip:</strong> Show how privacy works by opening in incognito mode 
              and demonstrating fresh identities each time!
            </p>
          </div>
        </div>

        {/* Footer with clear privacy statement */}
        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">
            This project demonstrates the power of anonymous mental health support systems.
            Need immediate help? Contact a{' '}
            <a 
              href="https://www.crisistextline.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2 transition-colors"
            >
              crisis helpline
            </a>
          </p>
          
          {/* Project stats for demo */}
          <button
            onClick={() => {
              const stats = JSON.parse(localStorage.getItem('kirinyaga_stats') || '{"logins": 0}');
              alert(`Project Demo Stats:\nTotal Logins: ${stats.logins}\n\n(Reset with localStorage.clear())`);
            }}
            className="mt-4 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            [Show Demo Statistics]
          </button>
        </div>
      </div>

      {/* Subtle floating elements */}
      <div className="absolute bottom-10 left-10 w-4 h-4 rounded-full bg-cyan-500/20 blur-sm animate-pulse"></div>
      <div className="absolute top-10 right-10 w-6 h-6 rounded-full bg-purple-500/20 blur-sm animate-pulse delay-300"></div>
    </div>
  );
}