'use client';

import { useEffect, useMemo, useState } from 'react';
import { getProgressStats, incrementProgressStat } from '@/lib/progress';

type MoodEntry = {
  id: string;
  mood: 'low' | 'okay' | 'good' | 'great';
  note: string;
  createdAt: string;
};

type Goal = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};


const MOOD_LABELS: Record<MoodEntry['mood'], string> = {
  low: 'Low',
  okay: 'Okay',
  good: 'Good',
  great: 'Great'
};

const STORAGE_KEYS = {
  moods: 'progress_moods',
  goals: 'progress_goals',
  stats: 'progress_stats'
};

export default function ProgressPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState(getProgressStats());
  const [newGoal, setNewGoal] = useState('');
  const [mood, setMood] = useState<MoodEntry['mood']>('okay');
  const [moodNote, setMoodNote] = useState('');

  useEffect(() => {
    const storedMoods = localStorage.getItem(STORAGE_KEYS.moods);
    const storedGoals = localStorage.getItem(STORAGE_KEYS.goals);
    if (storedMoods) {
      try {
        setMoods(JSON.parse(storedMoods));
      } catch {
        setMoods([]);
      }
    }
    if (storedGoals) {
      try {
        setGoals(JSON.parse(storedGoals));
      } catch {
        setGoals([]);
      }
    }
    setStats(getProgressStats());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.moods, JSON.stringify(moods));
  }, [moods]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    const handleUpdate = () => setStats(getProgressStats());
    window.addEventListener('progress-updated', handleUpdate);
    return () => window.removeEventListener('progress-updated', handleUpdate);
  }, []);

  const weeklyCheckins = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    return moods.filter(entry => now - new Date(entry.createdAt).getTime() <= weekMs).length;
  }, [moods]);

  const addMoodEntry = () => {
    const entry: MoodEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      mood,
      note: moodNote.trim(),
      createdAt: new Date().toISOString()
    };
    setMoods([entry, ...moods]);
    setMood('okay');
    setMoodNote('');
  };

  const addGoal = () => {
    const trimmed = newGoal.trim();
    if (!trimmed) return;
    const goal: Goal = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: trimmed,
      done: false,
      createdAt: new Date().toISOString()
    };
    setGoals([goal, ...goals]);
    setNewGoal('');
  };

  const toggleGoal = (goalId: string) => {
    setGoals(goals.map(goal => (goal.id === goalId ? { ...goal, done: !goal.done } : goal)));
  };

  const removeGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const logChatSession = () => {
    const next = incrementProgressStat('chatSessions', 1);
    setStats(next);
  };

  const logResourceDownload = () => {
    const next = incrementProgressStat('resourceDownloads', 1);
    setStats(next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Progress</h1>
          <p className="text-slate-600 mt-2">
            Track goals, mood check-ins, and activity. Everything stays anonymous.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Weekly check-ins</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">{weeklyCheckins}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Goals completed</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {goals.filter(goal => goal.done).length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Chat sessions</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.chatSessions}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Resources downloaded</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.resourceDownloads}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Mood check-in</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(Object.keys(MOOD_LABELS) as MoodEntry['mood'][]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setMood(key)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      mood === key
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {MOOD_LABELS[key]}
                  </button>
                ))}
              </div>
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Optional note about how you feel today..."
                className="w-full min-h-[90px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={addMoodEntry}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm"
              >
                Save check-in
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-600 mb-3">Recent check-ins</h3>
              {moods.length === 0 ? (
                <p className="text-sm text-slate-500">No check-ins yet.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-auto pr-1">
                  {moods.slice(0, 6).map((entry) => (
                    <div key={entry.id} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>{MOOD_LABELS[entry.mood]}</span>
                        <span>{new Date(entry.createdAt).toLocaleString()}</span>
                      </div>
                      {entry.note && <p className="text-sm text-slate-700 mt-2">{entry.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Goals</h2>
              <div className="flex gap-3 mb-4">
                <input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a new goal"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={addGoal}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Add
                </button>
              </div>

              {goals.length === 0 ? (
                <p className="text-sm text-slate-500">No goals yet.</p>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                    >
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={goal.done}
                          onChange={() => toggleGoal(goal.id)}
                          className="h-4 w-4"
                        />
                        <span className={`text-sm ${goal.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {goal.text}
                        </span>
                      </label>
                      <button
                        onClick={() => removeGoal(goal.id)}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Activity tracker</h2>
              <p className="text-sm text-slate-600 mb-4">
                Log your activity to keep progress accurate.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={logChatSession}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Log chat session
                </button>
                <button
                  onClick={logResourceDownload}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Log resource download
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Progress tips</h2>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>- Short daily check-ins build stronger awareness.</li>
                <li>- Small goals completed regularly are better than rare big goals.</li>
                <li>- You can clear data anytime by logging out.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
