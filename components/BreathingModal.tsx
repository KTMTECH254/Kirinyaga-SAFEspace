'use client';

import { useEffect, useState } from 'react';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BreathingModal({ isOpen, onClose }: BreathingModalProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [textOpacity, setTextOpacity] = useState(1);

  useEffect(() => {
    if (!isOpen) return;

    let timeoutId: NodeJS.Timeout;

    const cycle = () => {
      // Inhale phase - 4 seconds
      setPhase('inhale');
      setTextOpacity(0);
      setTimeout(() => setTextOpacity(1), 200);

      timeoutId = setTimeout(() => {
        // Hold phase - 7 seconds
        setPhase('hold');
        setTextOpacity(0);
        setTimeout(() => setTextOpacity(1), 200);

        timeoutId = setTimeout(() => {
          // Exhale phase - 8 seconds
          setPhase('exhale');
          setTextOpacity(0);
          setTimeout(() => setTextOpacity(1), 200);

          timeoutId = setTimeout(cycle, 8000);
        }, 7000);
      }, 4000);
    };

    cycle();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getText = () => {
    switch (phase) {
      case 'inhale':
        return 'Inhale Light';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Release Shadow';
      default:
        return 'Breathe';
    }
  };

  const getAnimationClass = () => {
    switch (phase) {
      case 'inhale':
        return 'animate-[breathExpand_4s_ease-in-out_forwards]';
      case 'hold':
        return 'animate-[breathHold_7s_ease-in-out_forwards]';
      case 'exhale':
        return 'animate-[breathContract_8s_ease-in-out_forwards]';
      default:
        return '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1121]/90 backdrop-blur-xl transition-all duration-700"
      onClick={onClose}
    >
      <div className="relative flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <div
          className={`h-72 w-72 rounded-full ${getAnimationClass()}`}
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(186, 230, 253, 0.4) 50%, rgba(186, 230, 253, 0.1) 100%)',
            boxShadow: '0 0 100px rgba(255, 255, 255, 0.5), 0 0 160px rgba(186, 230, 253, 0.3)',
          }}
        />
        <p
          className="mt-12 text-3xl font-medium text-blue-100 transition-opacity duration-500 tracking-wide"
          style={{
            fontFamily: 'var(--font-serif)',
            opacity: textOpacity,
            textShadow: '0 0 20px rgba(255,255,255,0.3)'
          }}
        >
          {getText()}
        </p>
        <p className="mt-4 text-sm text-blue-200/50 uppercase tracking-widest font-medium">Follow the light</p>

        <button
          onClick={onClose}
          className="mt-12 px-8 py-3 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-blue-200 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md"
        >
          Return to Sanctuary
        </button>
      </div>
    </div>
  );
}
