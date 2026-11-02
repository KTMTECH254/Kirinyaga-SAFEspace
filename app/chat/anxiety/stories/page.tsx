'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../providers';
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Heart,
  MessageCircle,
  Moon,
  RefreshCw,
  Sun,
  Video,
  Waves
} from 'lucide-react';

type VideoStory = {
  id: string;
  user_name: string;
  caption: string;
  created_at: string;
  video_url: string;
};

type StoryPage = {
  stories: VideoStory[];
  page: number;
  hasMore: boolean;
};

function isApprovedStory(value: unknown): value is VideoStory {
  if (!value || typeof value !== 'object') return false;
  const story = value as Record<string, unknown>;
  return story.status === 'approved'
    && typeof story.id === 'string'
    && typeof story.user_name === 'string'
    && typeof story.caption === 'string'
    && typeof story.created_at === 'string'
    && typeof story.video_url === 'string';
}

async function fetchStoryPage(page: number, signal?: AbortSignal): Promise<StoryPage> {
  const response = await fetch(`/api/chat/anxiety/video-stories?view=library&page=${page}`, {
    cache: 'no-store',
    signal
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload
      && typeof payload.error === 'string'
      ? payload.error
      : 'Video stories could not be loaded.';
    throw new Error(message);
  }

  if (!payload || typeof payload !== 'object' || !('stories' in payload) || !Array.isArray(payload.stories)) {
    throw new Error('The video stories response was not in the expected format.');
  }

  return {
    stories: payload.stories.filter(isApprovedStory),
    page: 'page' in payload && typeof payload.page === 'number' ? payload.page : page,
    hasMore: 'hasMore' in payload && payload.hasMore === true
  };
}

export default function AnxietyStoriesPage() {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme !== 'light';
  const [stories, setStories] = useState<VideoStory[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [finishedStoryId, setFinishedStoryId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchStoryPage(0, controller.signal)
      .then(result => {
        setStories(result.stories);
        setPage(result.page);
        setHasMore(result.hasMore);
        setError(null);
      })
      .catch(loadError => {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : 'Video stories could not be loaded.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const selectedStory = stories.find(story => story.id === selectedStoryId) ?? stories[0] ?? null;

  const chooseStory = (story: VideoStory) => {
    setSelectedStoryId(story.id);
    setFinishedStoryId(null);
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const loadMoreStories = async () => {
    setLoadingMore(true);
    setError(null);
    try {
      const nextPage = await fetchStoryPage(page + 1);
      setStories(current => {
        const existingIds = new Set(current.map(story => story.id));
        return [...current, ...nextPage.stories.filter(story => !existingIds.has(story.id))];
      });
      setPage(nextPage.page);
      setHasMore(nextPage.hasMore);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'More video stories could not be loaded.');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <main className={`min-h-[100dvh] transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-b from-[#071321] via-[#0b1928] to-[#071421] text-slate-100' : 'bg-gradient-to-b from-[#eef8fb] via-[#f7fbfc] to-[#eaf4f6] text-slate-900'}`}>
      <header className={`sticky top-0 z-30 border-b px-4 py-3 backdrop-blur sm:px-8 ${isDarkMode ? 'border-cyan-100/10 bg-[#071321]/90' : 'border-cyan-950/10 bg-white/90'}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <nav aria-label="Anxiety space navigation" className="flex items-center gap-1">
            <Link
              href="/chat/anxiety"
              className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 ${isDarkMode ? 'text-slate-300 hover:bg-white/10 focus-visible:outline-cyan-300' : 'text-slate-700 hover:bg-cyan-50 focus-visible:outline-cyan-700'}`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Community</span>
            </Link>
            <Link
              href="/chat/anxiety/stories"
              aria-current="page"
              className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 ${isDarkMode ? 'border-cyan-200/20 bg-cyan-300/10 text-cyan-100 focus-visible:outline-cyan-300' : 'border-teal-200 bg-teal-50 text-teal-900 focus-visible:outline-teal-700'}`}
            >
              <Video className="h-4 w-4" />
              Stories
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <span className={`hidden items-center gap-2 text-sm font-semibold sm:inline-flex ${isDarkMode ? 'text-cyan-100' : 'text-cyan-950'}`}>
              <Heart className={`h-4 w-4 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`} />
              Lantern Cove
            </span>
            <button
              type="button"
              onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              aria-pressed={isDarkMode}
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 ${isDarkMode ? 'border-cyan-100/25 text-amber-200 hover:bg-white/10 focus-visible:outline-cyan-300' : 'border-slate-300 text-slate-700 hover:bg-white focus-visible:outline-teal-700'}`}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-8 sm:pt-12">
        <section className="mx-auto mb-8 max-w-2xl text-center">
          <p className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${isDarkMode ? 'border-teal-200/15 bg-teal-300/10 text-teal-100' : 'border-teal-900/10 bg-white/75 text-teal-900'}`}>
            <Waves className="h-4 w-4" />
            A quieter kind of short video space
          </p>
          <h1 className={`text-3xl font-semibold tracking-tight sm:text-4xl ${isDarkMode ? 'text-white' : 'text-[#16364b]'}`}>
            One moment at a time.
          </h1>
          <p className={`mx-auto mt-3 max-w-xl text-sm leading-6 sm:text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Real community voices, shared gently. Choose a story when you are ready; nothing starts or advances on its own.
          </p>
          <p className={`mt-2 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            No autoplay · No looping · No endless swipe feed
          </p>
        </section>

        {error && (
          <div role="alert" className={`mx-auto mb-6 flex max-w-3xl items-start gap-2 rounded-xl border p-4 text-sm ${isDarkMode ? 'border-rose-300/25 bg-rose-950/40 text-rose-100' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div role="status" className={`mx-auto max-w-3xl rounded-2xl border p-10 text-center shadow-sm ${isDarkMode ? 'border-white/10 bg-white/5 text-slate-300' : 'border-white bg-white/80 text-slate-600'}`}>
            Loading community stories…
          </div>
        ) : stories.length === 0 ? (
          <section className={`mx-auto max-w-xl rounded-3xl border p-8 text-center shadow-sm sm:p-12 ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-white bg-white/80'}`}>
            <Video className={`mx-auto h-9 w-9 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`} />
            <h2 className={`mt-4 text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#16364b]'}`}>No approved stories yet</h2>
            <p className={`mt-2 text-sm leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              New community videos appear here after review. You can return to the room to share a story or talk with the community.
            </p>
            <Link
              href="/chat/anxiety"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-teal-800 px-5 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
            >
              <MessageCircle className="h-4 w-4" />
              Return to the chat
            </Link>
          </section>
        ) : (
          <>
            <section
              ref={playerRef}
              aria-label="Selected community story"
              className={`mx-auto grid max-w-4xl scroll-mt-4 gap-5 rounded-3xl border p-4 shadow-[0_20px_70px_rgba(27,65,84,0.10)] sm:grid-cols-[minmax(0,1fr)_minmax(15rem,0.8fr)] sm:items-center sm:gap-8 sm:p-7 ${isDarkMode ? 'border-white/10 bg-white/5 shadow-black/20' : 'border-white bg-white/75'}`}
            >
              {selectedStory && (
                <>
                  <div className="flex justify-center">
                    <div className="h-[min(62dvh,34rem)] w-[min(78vw,19.125rem)] overflow-hidden rounded-2xl bg-[#06131c] shadow-lg ring-1 ring-black/10">
                      <video
                        key={selectedStory.id}
                        src={selectedStory.video_url}
                        controls
                        playsInline
                        preload="metadata"
                        aria-label={`Community video story shared by ${selectedStory.user_name}`}
                        onEnded={() => setFinishedStoryId(selectedStory.id)}
                        onPlay={() => setFinishedStoryId(null)}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="min-w-0 py-2 sm:py-0">
                    <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isDarkMode ? 'bg-teal-300/10 text-teal-100' : 'bg-teal-50 text-teal-900'}`}>
                      <Video className="h-3.5 w-3.5" />
                      Community story
                    </p>
                    <h2 className={`mt-4 text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#16364b]'}`}>{selectedStory.user_name}</h2>
                    <p className={`mt-3 whitespace-pre-wrap break-words text-sm leading-6 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                      {selectedStory.caption}
                    </p>
                    <p className={`mt-5 border-l-2 border-teal-300 pl-3 text-sm leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Take this at your own pace. You can pause, stop, or leave whenever you need.
                    </p>

                    {finishedStoryId === selectedStory.id && (
                      <div role="status" className={`mt-5 rounded-2xl border p-4 ${isDarkMode ? 'border-cyan-100/10 bg-cyan-300/10' : 'border-cyan-900/10 bg-cyan-50/80'}`}>
                        <p className={`text-sm font-semibold ${isDarkMode ? 'text-cyan-100' : 'text-cyan-950'}`}>The story has ended.</p>
                        <p className={`mt-1 text-sm leading-5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                          Before choosing another, take a breath and notice what you need right now.
                        </p>
                        <Link
                          href="/chat/anxiety"
                          className={`mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 ${isDarkMode ? 'border-teal-200/20 bg-white/5 text-teal-100 hover:bg-white/10 focus-visible:outline-teal-300' : 'border-teal-800/20 bg-white text-teal-900 hover:bg-teal-50 focus-visible:outline-teal-800'}`}
                        >
                          <MessageCircle className="h-4 w-4" />
                          Return to the conversation
                        </Link>
                      </div>
                    )}

                    <p className={`mt-5 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Stories are moderated before they appear here. They are community experiences, not professional advice.
                    </p>
                  </div>
                </>
              )}
            </section>

            <section id="story-shelf" aria-labelledby="story-shelf-title" className="mx-auto mt-10 max-w-5xl scroll-mt-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id="story-shelf-title" className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-[#16364b]'}`}>Choose a story</h2>
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {hasMore
                      ? `${stories.length} stories loaded. More are available when you choose to load them.`
                      : `${stories.length} ${stories.length === 1 ? 'story' : 'stories'} available to browse.`}
                  </p>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Each video is up to 3 minutes</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stories.map((story, index) => {
                  const isSelected = story.id === selectedStory?.id;
                  return (
                    <button
                      key={story.id}
                      type="button"
                      onClick={() => chooseStory(story)}
                      aria-pressed={isSelected}
                      className={`flex min-h-28 items-start gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 ${
                        isSelected
                          ? isDarkMode ? 'border-teal-300/60 bg-teal-300/10 shadow-sm' : 'border-teal-700 bg-teal-50 shadow-sm'
                          : isDarkMode ? 'border-white/10 bg-white/5 hover:border-teal-200/30 hover:bg-white/10' : 'border-white bg-white/75 hover:border-teal-300 hover:bg-white'
                      }`}
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isSelected ? 'bg-teal-800 text-white' : isDarkMode ? 'bg-cyan-300/10 text-teal-100' : 'bg-cyan-50 text-teal-800'}`}>
                        <Video className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Story {index + 1}</span>
                        <span className={`mt-1 block truncate text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-[#16364b]'}`}>{story.user_name}</span>
                        <span className={`mt-1 line-clamp-2 block text-xs leading-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{story.caption}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {hasMore && (
                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => void loadMoreStories()}
                    disabled={loadingMore}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isDarkMode ? 'border-teal-200/20 bg-white/5 text-teal-100 hover:bg-white/10 focus-visible:outline-teal-300' : 'border-teal-800/20 bg-white text-teal-900 hover:bg-teal-50 focus-visible:outline-teal-800'}`}
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingMore ? 'animate-spin' : ''}`} />
                    {loadingMore ? 'Loading stories…' : 'Load 24 more stories'}
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        <footer className={`mx-auto mt-12 flex max-w-3xl flex-col items-center gap-3 border-t pt-6 text-center sm:flex-row sm:justify-center ${isDarkMode ? 'border-cyan-100/10' : 'border-cyan-950/10'}`}>
          <Link
            href="/education"
            className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm transition focus-visible:outline focus-visible:outline-2 ${isDarkMode ? 'text-slate-300 hover:bg-white/10 focus-visible:outline-teal-300' : 'text-slate-700 hover:bg-white focus-visible:outline-teal-800'}`}
          >
            <BookOpen className="h-4 w-4" />
            Grounding resources
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/chat/anxiety"
            className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm transition focus-visible:outline focus-visible:outline-2 ${isDarkMode ? 'text-slate-300 hover:bg-white/10 focus-visible:outline-teal-300' : 'text-slate-700 hover:bg-white focus-visible:outline-teal-800'}`}
          >
            <Heart className="h-4 w-4" />
            Back to the community
          </Link>
        </footer>
      </div>
    </main>
  );
}
