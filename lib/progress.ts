export type ProgressStats = {
  chatSessions: number;
  resourceDownloads: number;
};

const STORAGE_KEY = 'progress_stats';

const DEFAULT_STATS: ProgressStats = {
  chatSessions: 0,
  resourceDownloads: 0
};

export const getProgressStats = (): ProgressStats => {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_STATS };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { ...DEFAULT_STATS };
  try {
    const parsed = JSON.parse(stored) as Partial<ProgressStats>;
    return {
      chatSessions: parsed.chatSessions ?? 0,
      resourceDownloads: parsed.resourceDownloads ?? 0
    };
  } catch {
    return { ...DEFAULT_STATS };
  }
};

export const setProgressStats = (stats: ProgressStats) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  window.dispatchEvent(new Event('progress-updated'));
};

export const incrementProgressStat = (
  field: keyof ProgressStats,
  amount = 1
) => {
  const stats = getProgressStats();
  stats[field] = Math.max(0, stats[field] + amount);
  setProgressStats(stats);
  return stats;
};
