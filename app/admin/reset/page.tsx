'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';

export default function AdminPasswordResetPage() {
  const [recoveryToken, setRecoveryToken] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRecoveryToken, setShowRecoveryToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recoveryToken, newUsername, newPassword })
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Unable to reset the admin password.');
        return;
      }

      setRecoveryToken('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Your admin password has been reset. Sign in using your new password.');
    } catch {
      setError('Unable to contact the server. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset admin password</h1>
          <p className="mt-2 text-sm text-gray-600">Enter the recovery token configured by your site administrator and choose a new password.</p>
        </div>

        <div className="mb-5 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <p>Recovery requires the private server-side token. It is not your old password.</p>
        </div>

        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {success && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</p>}

        <form onSubmit={resetPassword} className="space-y-4">
          <div>
            <label htmlFor="recovery-token" className="mb-1 block text-sm font-medium text-gray-700">Recovery token</label>
            <div className="relative">
              <input
                id="recovery-token"
                type={showRecoveryToken ? 'text' : 'password'}
                autoComplete="off"
                required
                value={recoveryToken}
                onChange={(event) => setRecoveryToken(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-12 text-gray-900 placeholder-gray-500 caret-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                style={{ color: '#111827', backgroundColor: '#ffffff', WebkitTextFillColor: '#111827' }}
              />
              <button
                type="button"
                onClick={() => setShowRecoveryToken(value => !value)}
                aria-label={showRecoveryToken ? 'Hide recovery token' : 'Show recovery token'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-800"
              >
                {showRecoveryToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
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
            <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-gray-700">New password</label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={12}
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-12 text-gray-900 placeholder-gray-500 caret-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                style={{ color: '#111827', backgroundColor: '#ffffff', WebkitTextFillColor: '#111827' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(value => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-800"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-gray-700">Confirm new password</label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={12}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-12 text-gray-900 placeholder-gray-500 caret-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                style={{ color: '#111827', backgroundColor: '#ffffff', WebkitTextFillColor: '#111827' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(value => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-800"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Resetting password…' : 'Set new password'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm">
          <Link href="/admin" className="font-medium text-blue-700 hover:text-blue-800">Back to admin sign in</Link>
        </p>
      </section>
    </main>
  );
}
