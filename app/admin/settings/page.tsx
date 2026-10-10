'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (newUsername.trim().length < 3 || newUsername.trim().length > 64) {
      setError('The username must be 3–64 characters long.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }
    if (!newPassword && confirmPassword) {
      setError('Leave password confirmation empty or enter a new password.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newUsername: newUsername.trim(), newPassword })
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Unable to change the password.');
        return;
      }

      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Admin sign-in details changed. Redirecting you to sign in again…');
      setTimeout(() => router.replace('/admin'), 1500);
    } catch {
      setError('Unable to contact the server. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
          <KeyRound className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin sign-in details</h2>
          <p className="text-sm text-gray-600">Change your admin username, password, or both.</p>
        </div>
      </div>

      <div className="mb-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <p>Enter your current password to authorize a username change. If setting a new password, use at least 12 characters. Passwords are stored as a secure hash.</p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}

      <form onSubmit={changePassword} className="space-y-4">
        <div>
          <label htmlFor="new-username" className="mb-1 block text-sm font-medium text-gray-700">New admin username</label>
          <input
            id="new-username"
            type="text"
            autoComplete="username"
            minLength={3}
            maxLength={64}
            required
            value={newUsername}
            onChange={(event) => setNewUsername(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-500 caret-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            style={{ color: '#111827', backgroundColor: '#ffffff', WebkitTextFillColor: '#111827' }}
          />
        </div>
        <div>
          <label htmlFor="current-password" className="mb-1 block text-sm font-medium text-gray-700">Current password</label>
          <div className="relative">
            <input
              id="current-password"
              type={showPasswords ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-12 text-gray-900 placeholder-gray-500 caret-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              style={{ color: '#111827', backgroundColor: '#ffffff', WebkitTextFillColor: '#111827' }}
            />
            <button type="button" onClick={() => setShowPasswords(value => !value)} aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-800">
              {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-gray-700">New password (optional)</label>
          <input
            id="new-password"
            type={showPasswords ? 'text' : 'password'}
            autoComplete="new-password"
            minLength={12}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-500 caret-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            style={{ color: '#111827', backgroundColor: '#ffffff', WebkitTextFillColor: '#111827' }}
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-gray-700">Confirm new password</label>
          <input
            id="confirm-password"
            type={showPasswords ? 'text' : 'password'}
            autoComplete="new-password"
            minLength={12}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-500 caret-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            style={{ color: '#111827', backgroundColor: '#ffffff', WebkitTextFillColor: '#111827' }}
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Updating password…' : 'Change password'}
        </button>
      </form>
    </section>
  );
}
