'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../providers';
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Eye,
  Heart,
  MessageCircle,
  Moon,
  RefreshCw,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Video,
  Waves
} from 'lucide-react';

type VideoStory = {
  id: string;
  user_name: string;
  caption: string;
  created_at: string;
  video_url: string;
  view_count: number;
  upvotes: number;
  downvotes: number;
  viewer_vote: -1 | 1 | null;
};

type StoryPage = {
  stories: VideoStory[];
  page: number;
  hasMore: boolean;
};

type StoryInteraction = {
  story_id: string;
  view_count: number;
  upvotes: number;
  downvotes: number;
  viewer_vote: -1 | 1 | null;
};

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isApprovedStory(value: unknown): value is VideoStory {
  if (!value || typeof value !== 'object') return false;
  const story = value as Record<string, unknown>;
  return story.status === 'approved'
    && typeof story.id === 'string'
    && typeof story.user_name === 'string'
    && typeof story.caption === 'string'
    && typeof story.created_at === 'string'
    && typeof story.video_url === 'string'
    && isNonNegativeInteger(story.view_count)
    && isNonNegativeInteger(story.upvotes)
    && isNonNegativeInteger(story.downvotes)
    && (story.viewer_vote === null || story.viewer_vote === -1 || story.viewer_vote === 1);
}

function isStoryInteraction(value: unknown): value is StoryInteraction {
  if (!value || typeof value !== 'object') return false;
  const interaction = value as Record<string, unknown>;
  return typeof interaction.story_id === 'string'
    && isNonNegativeInteger(interaction.view_count)
    && isNonNegativeInteger(interaction.upvotes)
    && isNonNegativeInteger(interaction.downvotes)
    && (interaction.viewer_vote === null || interaction.viewer_vote === -1 || interaction.viewer_vote === 1);
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

  if (
    !payload
    || typeof payload !== 'object'
    || !('stories' in payload)
    || !Array.isArray(payload.stories)
    || !payload.stories.every(isApprovedStory)
  ) {
    throw new Error('The video stories response was not in the expected format.');
  }

  return {
    stories: payload.stories,
    page: 'page' in payload && typeof payload.page === 'number' ? payload.page : page,
    hasMore: 'hasMore' in payload && payload.hasMore === true
  };
}

async function saveStoryInteraction(
  action: 'view' | 'vote',
  storyId: string,
  vote?: -1 | 0 | 1
): Promise<StoryInteraction> {
  const response = await fetch('/api/chat/anxiety/video-stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ action, id: storyId, ...(action === 'vote' ? { vote } : {}) })
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload
      && typeof payload.error === 'string'
      ? payload.error
      : 'Your story interaction could not be saved.';
    throw new Error(message);
  }
  if (!payload || typeof payload !== 'object' || !('interaction' in payload) || !isStoryInteraction(payload.interaction)) {
    throw new Error('The story interaction response was not in the expected format.');
  }
  if (payload.interaction.story_id !== storyId) {
    throw new Error('The story interaction response did not match the requested story.');
  }
  return payload.interaction;
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
  const [votingStoryId, setVotingStoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const storiesScrollRef = useRef<HTMLDivElement | null>(null);
  const storySlideRefs = useRef(new Map<string, HTMLElement>());
  const storyVideoRefs = useRef(new Map<string, HTMLVideoElement>());
  const recordedViewsRef = useRef(new Set<string>());

  const applyStoryInteraction = (interaction: StoryInteraction) => {
    const { story_id: storyId, ...counts } = interaction;
    setStories(current => current.map(story => story.id === storyId
      ? { ...story, ...counts }
      : story));
  };

  useEffect(() => {
    const controller = new AbortController();

    void fetchStoryPage(0, controller.signal)
      .then(result => {
        setStories(result.stories);
        setSelectedStoryId(result.stories[0]?.id ?? null);
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
  const selectedStoryIndex = selectedStory ? stories.findIndex(story => story.id === selectedStory.id) : -1;

  useEffect(() => {
    const root = storiesScrollRef.current;
    if (!root || stories.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const mostVisibleStory = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const storyId = mostVisibleStory?.target.getAttribute('data-story-id');
        if (storyId) {
          storyVideoRefs.current.forEach((video, id) => {
            if (id !== storyId) video.pause();
          });
          setSelectedStoryId(storyId);
          setFinishedStoryId(current => current && current !== storyId ? null : current);
          if (!recordedViewsRef.current.has(storyId)) {
            recordedViewsRef.current.add(storyId);
            void saveStoryInteraction('view', storyId)
              .then(applyStoryInteraction)
              .catch(loadError => {
                recordedViewsRef.current.delete(storyId);
                setError(loadError instanceof Error ? loadError.message : 'The story view could not be recorded.');
              });
          }
        }
      },
      { root, threshold: [0.6, 0.75, 0.9] }
    );

    storySlideRefs.current.forEach(slide => observer.observe(slide));
    return () => observer.disconnect();
  }, [stories]);

  const voteForStory = async (story: VideoStory, vote: -1 | 1) => {
    setVotingStoryId(story.id);
    setError(null);
    try {
      const interaction = await saveStoryInteraction(
        'vote',
        story.id,
        story.viewer_vote === vote ? 0 : vote
      );
      applyStoryInteraction(interaction);
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : 'Your vote could not be saved.');
    } finally {
      setVotingStoryId(null);
    }
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
            <section aria-labelledby="story-shelf-title" className="mx-auto mt-8 max-w-5xl">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id="story-shelf-title" className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-[#16364b]'}`}>Stories</h2>
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Scroll inside the viewer to move to the next story. Videos only play when you press play.
                  </p>
                </div>
                <p aria-live="polite" className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {selectedStoryIndex >= 0 ? `Story ${selectedStoryIndex + 1} of ${stories.length}` : `${stories.length} stories loaded`}
                </p>
              </div>

              <div
                ref={storiesScrollRef}
                tabIndex={0}
                role="region"
                aria-label="Scrollable community video stories"
                className={`h-[min(84dvh,60rem)] min-h-[28rem] snap-y snap-mandatory overflow-y-auto overscroll-y-contain rounded-3xl border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isDarkMode ? 'border-white/10 bg-white/[0.03] focus-visible:outline-teal-300' : 'border-white bg-white/50 focus-visible:outline-teal-700'}`}
              >
                {stories.map((story, index) => (
                  <article
                    key={story.id}
                    ref={element => {
                      if (element) storySlideRefs.current.set(story.id, element);
                      else storySlideRefs.current.delete(story.id);
                    }}
                    data-story-id={story.id}
                    aria-label={`Story ${index + 1} of ${stories.length}`}
                    className={`h-full min-h-full snap-start snap-always overflow-y-auto p-4 sm:p-6 ${index > 0 ? `border-t ${isDarkMode ? 'border-white/10' : 'border-cyan-950/10'}` : ''}`}
                  >
                    <div className="mx-auto grid min-h-full max-w-4xl items-center gap-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] sm:gap-8">
                      <div className="flex justify-center">
                        <div className="h-[min(62dvh,46rem)] max-sm:h-[min(48dvh,30rem)] aspect-[9/16] overflow-hidden rounded-2xl bg-[#06131c] shadow-lg ring-1 ring-black/10">
                          <video
                            ref={element => {
                              if (element) storyVideoRefs.current.set(story.id, element);
                              else storyVideoRefs.current.delete(story.id);
                            }}
                            src={story.video_url}
                            controls
                            playsInline
                            preload="metadata"
                            aria-label={`Community video story shared by ${story.user_name}`}
                            onEnded={() => setFinishedStoryId(story.id)}
                            onPlay={() => setFinishedStoryId(null)}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>

                      <div className="min-w-0 py-2 sm:py-0">
                        <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isDarkMode ? 'bg-teal-300/10 text-teal-100' : 'bg-teal-50 text-teal-900'}`}>
                          <Video className="h-3.5 w-3.5" />
                          Story {index + 1}
                        </p>
                        <h3 className={`mt-4 text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#16364b]'}`}>{story.user_name}</h3>
                        <p className={`mt-3 whitespace-pre-wrap break-words text-sm leading-6 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                          {story.caption}
                        </p>
                        <p className={`mt-5 border-l-2 border-teal-300 pl-3 text-sm leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          Take this at your own pace. You can pause, stop, or leave whenever you need.
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm ${isDarkMode ? 'border-white/10 bg-white/5 text-slate-200' : 'border-slate-200 bg-white/80 text-slate-700'}`}>
                            <Eye className="h-4 w-4" aria-hidden="true" />
                            <span>{story.view_count.toLocaleString()} {story.view_count === 1 ? 'view' : 'views'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => void voteForStory(story, 1)}
                            disabled={votingStoryId === story.id}
                            aria-label={`Upvote story, ${story.upvotes} ${story.upvotes === 1 ? 'upvote' : 'upvotes'}`}
                            aria-pressed={story.viewer_vote === 1}
                            className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium transition disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 ${story.viewer_vote === 1
                              ? isDarkMode ? 'border-emerald-300/50 bg-emerald-300/15 text-emerald-100 focus-visible:outline-emerald-300' : 'border-emerald-600 bg-emerald-50 text-emerald-900 focus-visible:outline-emerald-700'
                              : isDarkMode ? 'border-white/10 text-slate-200 hover:bg-white/10 focus-visible:outline-teal-300' : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-emerald-50 focus-visible:outline-teal-700'}`}
                          >
                            <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                            Upvote <span>{story.upvotes.toLocaleString()}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void voteForStory(story, -1)}
                            disabled={votingStoryId === story.id}
                            aria-label={`Downvote story, ${story.downvotes} ${story.downvotes === 1 ? 'downvote' : 'downvotes'}`}
                            aria-pressed={story.viewer_vote === -1}
                            className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium transition disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 ${story.viewer_vote === -1
                              ? isDarkMode ? 'border-rose-300/50 bg-rose-300/15 text-rose-100 focus-visible:outline-rose-300' : 'border-rose-600 bg-rose-50 text-rose-900 focus-visible:outline-rose-700'
                              : isDarkMode ? 'border-white/10 text-slate-200 hover:bg-white/10 focus-visible:outline-teal-300' : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-rose-50 focus-visible:outline-teal-700'}`}
                          >
                            <ThumbsDown className="h-4 w-4" aria-hidden="true" />
                            Downvote <span>{story.downvotes.toLocaleString()}</span>
                          </button>
                        </div>

                        {finishedStoryId === story.id && (
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
                    </div>
                  </article>
                ))}
              </div>

              <p className={`mt-2 flex items-center justify-center gap-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <ChevronDown className="h-4 w-4" />
                Scroll for the next story
              </p>

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
