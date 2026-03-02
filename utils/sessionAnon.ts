const SESSION_ANON_KEY = 'sessionAnonymousName';

const adjectives = [
  'Calm',
  'Silent',
  'Gentle',
  'Brave',
  'Hopeful',
  'Quiet',
  'Kind',
  'Steady',
  'Soft',
  'Warm',
  'Clear',
  'Bright',
  'Still',
  'Tender',
  'Light',
  'Safe',
  'Peaceful',
  'True'
];

const nouns = [
  'River',
  'Oak',
  'Sky',
  'Meadow',
  'Breeze',
  'Stone',
  'Dawn',
  'Willow',
  'Harbor',
  'Path',
  'Bloom',
  'Feather',
  'Brook',
  'Glade',
  'Star',
  'Haven'
];

export const generateSessionAnonymousName = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const useFourDigits = Math.random() > 0.4;
  const number = useFourDigits
    ? Math.floor(Math.random() * 9000) + 1000
    : Math.floor(Math.random() * 900) + 100;

  return `${adjective}${noun}${number}`;
};

export const setSessionAnonymousName = (name?: string) => {
  if (typeof window === 'undefined') return '';
  const generated = name || generateSessionAnonymousName();
  sessionStorage.setItem(SESSION_ANON_KEY, generated);
  return generated;
};

export const getSessionAnonymousName = () => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(SESSION_ANON_KEY);
};

export const ensureSessionAnonymousName = () => {
  if (typeof window === 'undefined') return 'Anonymous';
  const existing = getSessionAnonymousName();
  if (existing) return existing;
  return setSessionAnonymousName();
};

export const clearSessionAnonymousName = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_ANON_KEY);
};
