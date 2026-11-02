'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, Clock3, RefreshCw, Trash2, Video, X } from 'lucide-react';

type VideoStory = {
  id: string;
  user_id: string;
  user_name: string;
  caption: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  video_url: string;
};

type StoryFilter = 'pending' | 'all' | 'approved' | 'rejected';

const filters: { value: StoryFilter; label: string }[] = [
  { value: 'pending', label: 'Pending review' },
  { value: 'all', label: 'All stories' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

export default function AdminVideoStoriesPage() {
  const [stories, setStories] = useState<VideoStory[]>([]);
  const [filter, setFilter] = useState<StoryFilter>('pending');
  const [loading, setLoading] = useState(true);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/chat/anxiety/video-stories', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Video stories could not be loaded.');
      }
      setStories(Array.isArray(payload.stories) ? payload.stories : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Video stories could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStories();
  }, [loadStories]);

  const filteredStories = useMemo(
    () => filter === 'all' ? stories : stories.filter(story => story.status === filter),
    [filter, stories]
  );
  const pendingCount = stories.filter(story => story.status === 'pending').length;

  const updateStoryStatus = async (story: VideoStory, status: 'approved' | 'rejected') => {
    setActiveStoryId(story.id);
    setError(null);
    try {
      const response = await fetch('/api/chat/anxiety/video-stories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: story.id, status })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'The story status could not be updated.');
      }
      setStories(previous => previous.map(item => item.id === story.id ? { ...item, status } : item));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'The story status could not be updated.');
    } finally {
      setActiveStoryId(null);
    }
  };

  const deleteStory = async (story: VideoStory) => {
    if (!window.confirm(`Permanently delete the video story from ${story.user_name}?`)) {
      return;
    }

    setActiveStoryId(story.id);
    setError(null);
    try {
      const response = await fetch('/api/chat/anxiety/video-stories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: story.id })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'The story could not be deleted.');
      }
      setStories(previous => previous.filter(item => item.id !== story.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'The story could not be deleted.');
    } finally {
      setActiveStoryId(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-700">
            <Video className="h-5 w-5" />
            <span className="text-sm font-semibold">Anxiety room moderation</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Video Stories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review community videos before they appear publicly in Lantern Cove.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadStories()}
          disabled={loading}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      <section aria-label="Video story filters" className="mb-5 flex flex-wrap gap-2">
        {filters.map(item => {
          const count = item.value === 'all'
            ? stories.length
            : stories.filter(story => story.status === item.value).length;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                filter === item.value
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label} ({count})
            </button>
          );
        })}
      </section>

      {pendingCount > 0 && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Clock3 className="h-4 w-4 shrink-0" />
          {pendingCount} {pendingCount === 1 ? 'story is' : 'stories are'} waiting for your review.
        </p>
      )}

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div role="status" className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-600">
          Loading video stories…
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <Video className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-3 font-medium text-gray-900">
            {filter === 'pending' ? 'No stories are waiting for review.' : 'No video stories found.'}
          </p>
          <p className="mt-1 text-sm text-gray-500">New submissions will appear here.</p>
        </div>
      ) : (
        <section aria-label="Video stories" className="grid gap-5 lg:grid-cols-2">
          {filteredStories.map(story => (
            <article key={story.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <video
                src={story.video_url}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full bg-black object-contain"
                aria-label={`Video story from ${story.user_name}`}
              />
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-gray-900">{story.user_name}</h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Submitted {new Date(story.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    story.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : story.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-900'
                  }`}>
                    {story.status === 'pending' ? 'Pending review' : story.status}
                  </span>
                </div>

                <p className="whitespace-pre-wrap break-words text-sm text-gray-700">{story.caption}</p>

                <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  {story.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => void updateStoryStatus(story, 'approved')}
                      disabled={activeStoryId !== null}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                  )}
                  {story.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => void updateStoryStatus(story, 'rejected')}
                      disabled={activeStoryId !== null}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void deleteStory(story)}
                    disabled={activeStoryId !== null}
                    className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
