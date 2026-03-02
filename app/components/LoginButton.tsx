// app/components/LoginButton.jsx (Client Component)
"use client";

import type { ReactNode } from 'react';

type LoginButtonProps = {
  onClick: () => void;
  children: ReactNode;
};

export default function LoginButton({ onClick, children }: LoginButtonProps) {
  return (
    <button
      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
