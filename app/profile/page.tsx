'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearSessionAnonymousName, getSessionAnonymousName, ensureSessionAnonymousName } from '@/utils/sessionAnon';

type AnonymousUser = {
  id?: string;
  name?: string;
  displayName?: string;
  isAnonymous?: boolean;
  loginTime?: string;
  profileId?: string;
  preferences?: {
    showStatus?: boolean;
    notifyUpdates?: boolean;
  };
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<AnonymousUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    displayName: '',
    showStatus: true,
    notifyUpdates: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [sessionAnonymousName, setSessionAnonymousNameState] = useState<string>('');
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('anonymousUser');
    if (!user) {
      router.push('/');
      return;
    }

    try {
      const parsed = JSON.parse(user) as AnonymousUser;
      setProfile(parsed);
      setSessionAnonymousNameState(ensureSessionAnonymousName());
      setFormState({
        displayName: parsed.displayName || parsed.name || '',
        showStatus: parsed.preferences?.showStatus ?? true,
        notifyUpdates: parsed.preferences?.notifyUpdates ?? true
      });
    } catch {
      setProfile(null);
    }
  }, [router]);

  const formatDateTime = (value?: string) => {
    if (!value) return 'Unknown';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
  };

  const formatDate = (value?: string) => {
    if (!value) return 'Today';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Today' : date.toLocaleDateString();
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!profile) return;
    const trimmedName = formState.displayName.trim();
    const profileId = profile.profileId || profile.id;

    if (!profileId) {
      setSaveMessage('Unable to update profile. Please sign in again.');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    const updated: AnonymousUser = {
      ...profile,
      displayName: trimmedName || profile.displayName || profile.name,
      preferences: {
        showStatus: formState.showStatus,
        notifyUpdates: formState.notifyUpdates
      }
    };

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          displayName: updated.displayName,
          preferences: updated.preferences
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveMessage(data?.error || 'Failed to update profile.');
        return;
      }

      const persisted = {
        ...updated,
        name: data?.profile?.anonymous_name || updated.name,
        displayName: data?.profile?.display_name || updated.displayName
      };
      localStorage.setItem('anonymousUser', JSON.stringify(persisted));
      setProfile(persisted);
      setIsEditing(false);
      setSaveMessage('Profile updated.');
    } catch {
      setSaveMessage('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!profile) return;
    setPasswordMessage(null);

    if (!passwordState.currentPassword || !passwordState.newPassword) {
      setPasswordMessage('Please fill in all password fields.');
      return;
    }

    if (passwordState.newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters.');
      return;
    }

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordMessage('New password and confirmation do not match.');
      return;
    }

    const profileId = profile.profileId || profile.id;
    if (!profileId) {
      setPasswordMessage('Unable to change password. Please sign in again.');
      return;
    }

    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          currentPassword: passwordState.currentPassword,
          newPassword: passwordState.newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordMessage(data?.error || 'Failed to change password.');
        return;
      }

      setPasswordMessage('Password updated successfully.');
      setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setPasswordMessage('Failed to change password.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">My Profile</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-white">Profile Details</h2>
            <button
              onClick={() => setIsEditing((prev) => !prev)}
              className="text-sm text-blue-300 hover:text-blue-200"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-400">Account name (private)</p>
              <p className="text-zinc-100 font-semibold">
                {profile.name || 'Anonymous User'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-400">Session anonymous name (public)</p>
              <p className="text-zinc-100 font-semibold">
                {sessionAnonymousName || getSessionAnonymousName() || 'Anonymous'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Your anonymous name changes every time you log in for your privacy.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-400">Display name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formState.displayName}
                  onChange={(e) => setFormState(prev => ({ ...prev, displayName: e.target.value }))}
                  className="mt-2 w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
                  placeholder="Enter a display name"
                />
              ) : (
                <p className="text-zinc-100 font-semibold">
                  {profile.displayName || profile.name || 'Anonymous User'}
                </p>
              )}
              <p className="text-xs text-zinc-500 mt-1">
                This name is shown in your private profile only.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-400">Session started</p>
              <p className="text-zinc-200">{formatDateTime(profile.loginTime)}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Profile Settings</h2>
          <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
            <label className="flex items-center justify-between text-zinc-200">
              <span>Show activity status</span>
              <input
                type="checkbox"
                checked={formState.showStatus}
                onChange={(e) => setFormState(prev => ({ ...prev, showStatus: e.target.checked }))}
                disabled={!isEditing}
                className="h-4 w-4"
              />
            </label>
            <label className="flex items-center justify-between text-zinc-200">
              <span>Notify me about new resources</span>
              <input
                type="checkbox"
                checked={formState.notifyUpdates}
                onChange={(e) => setFormState(prev => ({ ...prev, notifyUpdates: e.target.checked }))}
                disabled={!isEditing}
                className="h-4 w-4"
              />
            </label>
            {isEditing && (
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                {saveMessage && <span className="text-sm text-zinc-400">{saveMessage}</span>}
              </div>
            )}
            {!isEditing && saveMessage && (
              <span className="text-sm text-zinc-400">{saveMessage}</span>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Change Password</h2>
          <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={passwordState.currentPassword}
              onChange={(e) => setPasswordState(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
            />
            <input
              type="password"
              placeholder="New password"
              value={passwordState.newPassword}
              onChange={(e) => setPasswordState(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwordState.confirmPassword}
              onChange={(e) => setPasswordState(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handlePasswordChange}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Update Password
              </button>
              {passwordMessage && <span className="text-sm text-zinc-400">{passwordMessage}</span>}
            </div>
          </div>
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
              <p className="text-xl font-bold text-white">{formatDate(profile.loginTime)}</p>
            </div>
            <div className="bg-zinc-800 p-4 rounded">
              <p className="text-sm text-zinc-400">Account Created</p>
              <p className="text-xl font-bold text-white">{formatDate(profile.loginTime)}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Privacy Info</h2>
          <ul className="text-zinc-300 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">-</span>
              <span>No email or personal info required</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">-</span>
              <span>Your profile resets if you clear browser data</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">-</span>
              <span>No tracking or personal data collection</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('anonymousUser');
            clearSessionAnonymousName();
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
