import React, { useState } from 'react';
import { Trash2, Edit2, MoreHorizontal } from 'lucide-react';

export interface ChatMessageItem {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
  is_deleted?: boolean;
  admin_deleted_by?: string | null;
  parent_message_id?: string | null;
}

interface Props {
  message: ChatMessageItem;
  currentUserId?: string | null;
  isAdmin?: boolean;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onDeleteAsAdmin?: (messageId: string, hard?: boolean) => Promise<void>;
  onBanUser?: (userId: string) => void;
  onViewUserInfo?: (userId: string) => void;
}

export default function MessageItem({
  message,
  currentUserId,
  isAdmin = false,
  onEdit,
  onDelete,
  onDeleteAsAdmin,
  onBanUser,
  onViewUserInfo,
}: Props) {
  const [openAdminMenu, setOpenAdminMenu] = useState(false);
  const isOwn = currentUserId && message.user_id === currentUserId;
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative group">
      <div className={`max-w-xs px-4 py-3 rounded-2xl ${message.is_deleted ? 'bg-gray-200 italic text-slate-600' : 'bg-slate-700 text-white'}`}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs opacity-70">{message.user_name}</p>
          <div className="flex items-center gap-2">
            {message.is_deleted && message.admin_deleted_by && (
              <span className="text-xs italic">🔨 Removed by Admin</span>
            )}
            <span className="text-xs opacity-50">{time}</span>
          </div>
        </div>

        <div>
          <p className={message.is_deleted ? 'italic' : ''}>{message.message}</p>
        </div>
      </div>

      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        {/* Owner actions (shown only when callbacks provided) */}
        {!message.is_deleted && isOwn && onEdit && onDelete && (
          <>
            <button onClick={() => onEdit?.(message.id)} className="p-1" title="Edit"><Edit2 className="w-4 h-4" /></button>
            <button onClick={() => onDelete?.(message.id)} className="p-1" title="Delete"><Trash2 className="w-4 h-4" /></button>
          </>
        )}

        {/* Admin actions */}
        {isAdmin && !message.is_deleted && (
          <div className="relative">
            <button onClick={() => setOpenAdminMenu(s => !s)} className="p-1" title="Admin"><MoreHorizontal className="w-4 h-4" /></button>
            {openAdminMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-20">
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { onDeleteAsAdmin?.(message.id, false); setOpenAdminMenu(false); }}>🗑️ Soft Delete</button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600" onClick={() => { if (confirm('Permanently delete this message?')) { onDeleteAsAdmin?.(message.id, true); } setOpenAdminMenu(false); }}>⚠️ Permanent Delete</button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { onBanUser?.(message.user_id); setOpenAdminMenu(false); }}>🔨 Ban User</button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { onViewUserInfo?.(message.user_id); setOpenAdminMenu(false); }}>👁️ View Info</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
