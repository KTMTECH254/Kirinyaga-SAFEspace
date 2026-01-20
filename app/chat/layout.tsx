//app/chat/layout.tsx
'use client';

import { ChatProvider } from '../contexts/chatcontext'; // Changed from '@/contexts/ChatContext'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      {children}
    </ChatProvider>
  );
}