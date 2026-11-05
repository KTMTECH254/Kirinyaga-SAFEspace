'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Caveat } from 'next/font/google';
import {
  ArrowRight,
  Brain,
  ChevronRight,
  Eye,
  EyeOff,
  Heart,
  Headphones,
  Home,
  Leaf,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound
} from 'lucide-react';
import { TERMS_VERSION } from '@/lib/terms';
import { authFunctions } from '@/lib/supabase';
import { setSessionAnonymousName } from '@/utils/sessionAnon';

const caveat = Caveat({ subsets: ['latin'], weight: ['400', '600'], display: 'swap' });

const journeySteps = [
  {
    number: '01',
    title: 'Create your identity',
    description: 'Choose an anonymous name and join.',
    icon: Sparkles
  },
  {
    number: '02',
    title: 'Find your community',
    description: 'Explore rooms and connect with others.',
    icon: UsersRound
  },
  {
    number: '03',
    title: 'Express yourself freely',
    description: 'Share, listen, or just be yourself.',
    icon: Heart
  }
];

const createAnonymousName = () => {
  const adjectives = ['Brave', 'Calm', 'Hopeful', 'Gentle', 'Peaceful', 'Caring', 'Kind', 'Bright'];
  const nature = ['River', 'Star', 'Ocean', 'Forest', 'Breeze', 'Dawn', 'Willow', 'Moon'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nature[Math.floor(Math.random() * nature.length)]}${Math.floor(Math.random() * 999)}`;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Something went wrong. Please try again.';
}

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [anonymousName, setAnonymousName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const switchMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setTermsAccepted(false);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!anonymousName.trim()) {
      setError('Choose an anonymous name to continue.');
      return;
    }
    if (!password) {
      setError('Enter your password to continue.');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }
    if (isSignUp && !termsAccepted) {
      setError('Please read and accept the Terms and Conditions before creating an account.');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error: signUpError } = await authFunctions.createUserWithPassword(
          anonymousName.trim(),
          password,
          termsAccepted,
          TERMS_VERSION
        );
        if (signUpError) throw signUpError;

        setPassword('');
        setConfirmPassword('');
        setTermsAccepted(false);
        setIsSignUp(false);
        setSuccess('If the name was available, your account is ready. Sign in to continue.');
        return;
      }

      const { profile, error: signInError } = await authFunctions.signInWithPassword(
        anonymousName.trim(),
        password
      );
      if (signInError) throw signInError;
      if (!profile) throw new Error('Unable to sign in. Check your name and password.');

      const adminLogoutResponse = await fetch('/api/admin/logout', { method: 'POST' });
      if (!adminLogoutResponse.ok) {
        throw new Error('Could not end the previous admin session. Please try signing in again.');
      }

      const userInfo = {
        id: profile.id,
        name: profile.anonymous_name,
        isAnonymous: true,
        loginTime: new Date().toISOString(),
        profileId: profile.id
      };
      localStorage.setItem('anonymousUser', JSON.stringify(userInfo));
      const sessionAnonymousName = setSessionAnonymousName();
      sessionStorage.setItem('currentSession', JSON.stringify({
        sessionStart: new Date().toISOString(),
        userName: profile.anonymous_name,
        userId: profile.id,
        sessionAnonymousName
      }));

      const projectStats = JSON.parse(localStorage.getItem('kirinyaga_stats') || '{"logins": 0}');
      projectStats.logins = (projectStats.logins || 0) + 1;
      localStorage.setItem('kirinyaga_stats', JSON.stringify(projectStats));
      router.push('/chat-rooms');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#03091d] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[url('/images/reference-hero.png')] bg-cover bg-[center_45%] opacity-75"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,8,29,.72)_0%,rgba(3,8,29,.5)_43%,rgba(3,8,29,.76)_100%)]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_55%_45%,rgba(33,101,255,.2),transparent_58%)]" />

      <header className="border-b border-white/10 bg-[#03091d]/45 backdrop-blur-md">
        <div className="mx-auto flex min-h-[4.25rem] max-w-[90rem] items-center justify-between gap-5 px-4 sm:px-7 lg:px-10">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Unspoken Minds SafeSpace home">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/50 bg-cyan-300/10 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,.18)]">
              <Brain size={25} />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold tracking-tight sm:text-lg">Unspoken Minds</span>
              <span className="block text-xs text-blue-100/80">SafeSpace</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-50/85 transition hover:text-cyan-200"><Home size={17} />Home</Link>
            <Link href="/about" className="inline-flex items-center gap-2 text-sm text-blue-50/85 transition hover:text-cyan-200"><Heart size={17} className="text-pink-300" />About</Link>
            <Link href="/education" className="inline-flex items-center gap-2 text-sm text-blue-50/85 transition hover:text-cyan-200"><Sparkles size={17} />Resources</Link>
            <Link href="/progress" className="inline-flex items-center gap-2 text-sm text-blue-50/85 transition hover:text-cyan-200"><MessageCircle size={17} />Insights</Link>
            <Link href="/emergency" className="inline-flex items-center gap-2 text-sm text-blue-50/85 transition hover:text-cyan-200"><Headphones size={17} />Support</Link>
          </nav>

          <button
            type="button"
            onClick={() => switchMode(false)}
            className="rounded-full border border-violet-400/70 px-3 py-2 text-xs text-blue-50 transition hover:border-cyan-300 hover:bg-cyan-300/10 sm:px-4 sm:text-sm"
          >
            <span className="hidden sm:inline">Already have an account? </span>
            <span className="font-semibold text-cyan-300">Sign In <ArrowRight className="ml-1 inline" size={14} /></span>
          </button>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100svh-7.5rem)] max-w-[90rem] items-center gap-8 px-4 py-8 sm:px-7 lg:grid-cols-[minmax(0,1fr)_minmax(25rem,34rem)] lg:gap-10 lg:px-10 lg:py-6">
        <section className="order-2 mx-auto w-full max-w-2xl lg:order-1">
          <div className="max-w-2xl text-center">
            <p className={`${caveat.className} text-5xl leading-[1.05] text-white drop-shadow-lg sm:text-6xl xl:text-7xl`}>
              Your story <span className="text-cyan-300">matters.</span>
              <br />
              <span className="text-amber-300">Even when you don&apos;t</span>
              <br className="hidden sm:block" />
              <span className="text-amber-300"> say it out loud.</span>
            </p>
            <div className="ml-36 mt-1 flex items-center text-cyan-300" aria-hidden="true">
              <span className="h-px w-20 rotate-[-8deg] bg-cyan-300" />
              <Heart size={20} className="-ml-1 -rotate-12" />
            </div>
            <p className="mt-4 max-w-md text-center text-base leading-7 text-blue-50/90 sm:ml-8 sm:text-lg">
              A safe space to be heard, connect,
              <br className="hidden sm:block" /> and find hope — together.
            </p>
          </div>

          <div className="mt-6 flex max-w-lg flex-wrap justify-center gap-3">
            {[
              { label: <>Choose what<br />you share</>, icon: ShieldCheck, color: 'text-cyan-300' },
              { label: <>Peer support<br />and community</>, icon: UsersRound, color: 'text-fuchsia-300' },
              { label: <>A place to<br />feel heard</>, icon: Heart, color: 'text-pink-300' }
            ].map(({ label, icon: Icon, color }) => (
              <div key={Icon.displayName ?? color} className="flex h-24 w-24 flex-col items-center justify-center rounded-full border border-cyan-300/25 bg-[#111c50]/55 text-center text-xs text-blue-50 shadow-[0_0_24px_rgba(54,91,255,.18)] backdrop-blur">
                <Icon className={`mb-1.5 ${color}`} size={24} />
                {label}
              </div>
            ))}
          </div>

          <div className="mt-7 hidden lg:block">
            <h2 className="mb-3 flex items-center justify-center gap-2 text-center text-lg font-semibold text-blue-50">
              <Leaf size={17} className="text-emerald-300" />Your Journey Starts Here<Leaf size={17} className="text-emerald-300" />
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {journeySteps.map(({ number, title, description, icon: Icon }) => (
                <div key={number} className="relative rounded-2xl border border-indigo-300/20 bg-[#08143b]/75 p-4 text-center shadow-[0_8px_30px_rgba(0,0,0,.2)] backdrop-blur">
                  <span className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/70 text-xs font-bold text-cyan-300">{number}</span>
                  <h3 className="flex items-center justify-center gap-1 text-sm font-semibold text-white"><Icon size={14} className="text-amber-300" />{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-blue-100/70">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="order-1 w-full lg:order-2" aria-labelledby="signup-title">
          <div className="mx-auto w-full max-w-[34rem] rounded-[2rem] border border-cyan-300/45 bg-[linear-gradient(145deg,rgba(18,30,87,.91),rgba(22,20,78,.88)_58%,rgba(53,21,91,.9))] p-5 shadow-[0_0_45px_rgba(62,115,255,.35),0_0_60px_rgba(204,45,255,.13)] backdrop-blur-xl sm:p-7">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/70 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,.18)]">
                <Leaf size={16} className="fill-cyan-300/40" />
                {isSignUp ? 'Join Our SafeSpace' : 'Welcome Back'}
              </div>
              <h1 id="signup-title" className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-[1.7rem]">
                {isSignUp ? 'Create Your Anonymous Identity' : 'Sign in to your SafeSpace'}
              </h1>
              <p className="mt-1 text-sm text-blue-100/85">
                {isSignUp ? 'No real name needed. Choose a name that feels right for you.' : 'Enter your anonymous name and password.'}
              </p>
            </div>

            <form
              className="mt-5 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmit();
              }}
            >
              <label className="flex h-[3.35rem] items-center gap-3 rounded-full border border-violet-400/60 bg-[#080f3a]/80 px-4 shadow-[inset_0_0_16px_rgba(34,211,238,.06)] focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-300/20">
                <UserRound className="shrink-0 text-cyan-300" size={22} />
                <span className="h-7 w-px bg-white/10" />
                <span className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={anonymousName}
                    onChange={(event) => setAnonymousName(event.target.value)}
                    maxLength={50}
                    autoComplete="username"
                    placeholder="What should we call you here?"
                    aria-label="Anonymous name"
                    disabled={isLoading}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-blue-100/65"
                    required
                  />
                  {isSignUp && <span className="block pt-0.5 text-[10px] text-blue-100/65">Pick a nickname for the community.</span>}
                </span>
                {isSignUp && !anonymousName && (
                  <button
                    type="button"
                    onClick={() => setAnonymousName(createAnonymousName())}
                    className="shrink-0 text-xs text-cyan-300 hover:text-cyan-100"
                    aria-label="Suggest an anonymous name"
                  >
                    Suggest
                  </button>
                )}
              </label>

              <label className="flex h-[3.35rem] items-center gap-3 rounded-full border border-violet-400/60 bg-[#080f3a]/80 px-4 shadow-[inset_0_0_16px_rgba(34,211,238,.06)] focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-300/20">
                <LockKeyhole className="shrink-0 text-cyan-300" size={21} />
                <span className="h-7 w-px bg-white/10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  placeholder={isSignUp ? 'Create a secure password' : 'Enter your password'}
                  aria-label="Password"
                  disabled={isLoading}
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-blue-100/65"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="shrink-0 text-blue-100/70 transition hover:text-cyan-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </label>

              {isSignUp && (
                <label className="flex h-[3.15rem] items-center gap-3 rounded-full border border-violet-400/60 bg-[#080f3a]/80 px-4 shadow-[inset_0_0_16px_rgba(34,211,238,.06)] focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-300/20">
                  <LockKeyhole className="shrink-0 text-cyan-300" size={21} />
                  <span className="h-7 w-px bg-white/10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    aria-label="Confirm password"
                    disabled={isLoading}
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-blue-100/65"
                    required
                  />
                </label>
              )}

              {isSignUp && (
                <label className="flex items-start gap-2.5 px-3 py-1 text-xs leading-5 text-blue-50/90">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                    disabled={isLoading}
                    required
                    className="mt-1 h-4 w-4 shrink-0 accent-cyan-400"
                  />
                  <span>
                    I have read and agree to the{' '}
                    <Link href="/terms" target="_blank" className="font-semibold text-cyan-300 underline underline-offset-2">Terms of Use</Link>
                    {' '}and{' '}
                    <Link href="/privacy" target="_blank" className="font-semibold text-cyan-300 underline underline-offset-2">Privacy Notice</Link>.
                    <span className="sr-only"> Terms version {TERMS_VERSION}.</span>
                  </span>
                </label>
              )}

              {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-950/50 px-3 py-2 text-center text-xs text-rose-200">{error}</p>}
              {success && <p role="status" className="rounded-xl border border-emerald-400/30 bg-emerald-950/45 px-3 py-2 text-center text-xs text-emerald-200">{success}</p>}

              <button
                type="submit"
                disabled={isLoading || (isSignUp && !termsAccepted)}
                className="flex min-h-[3.3rem] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 px-5 text-base font-bold text-white shadow-[0_0_25px_rgba(38,217,255,.3)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101344] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Please wait…' : isSignUp ? <><Sparkles size={17} />Create My SafeSpace<ArrowRight size={19} /></> : <>Sign In<ArrowRight size={19} /></>}
              </button>
            </form>

            <div className="my-3 flex items-center gap-3 text-xs text-blue-100/75">
              <span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={() => switchMode(!isSignUp)}
              disabled={isLoading}
              className="flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-full border border-cyan-400/70 px-4 text-sm text-blue-50 transition hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <ArrowRight size={16} className="text-fuchsia-300" />
              {isSignUp ? 'Sign In Instead' : 'Create an Account Instead'}
              <ChevronRight size={16} />
            </button>

            <div className="mt-4 rounded-2xl border border-violet-300/20 bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/15 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-cyan-200"><Heart size={14} className="mr-1 inline fill-cyan-300" />A Little Reminder <Heart size={14} className="ml-1 inline fill-fuchsia-300 text-fuchsia-300" /></p>
              <p className="mt-1 text-xs italic leading-5 text-blue-100/85">
                “You don&apos;t have to figure everything out today.
                <br className="hidden sm:block" /> Sometimes, the first step is simply giving yourself a place to breathe.”
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-white/10 bg-[#03091d]/75 px-4 py-3 text-[10px] text-blue-100/70 backdrop-blur sm:px-7">
        <div className="mx-auto flex max-w-[90rem] flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-center sm:text-left"><Brain size={17} className="mr-2 inline text-cyan-300" />UNSPOKEN MINDS — SAFESPACE <span className="mx-2 hidden text-white/30 sm:inline">|</span><span className="block sm:inline">A community built around understanding, connection and hope.</span></p>
          <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-2 gap-y-1">
            <Link href="/about" className="hover:text-cyan-200">About</Link><span>·</span>
            <Link href="/terms" className="hover:text-cyan-200">Terms of Use</Link><span>·</span>
            <Link href="/privacy" className="hover:text-cyan-200">Privacy Notice</Link><span>·</span>
            <Link href="/emergency" className="hover:text-cyan-200">Emergency Support</Link>
          </nav>
          <Link href="/emergency" className="hidden items-center gap-2 rounded-full bg-rose-900/45 px-3 py-2 text-rose-200 hover:bg-rose-800/60 sm:inline-flex">
            <Heart size={13} />Need immediate help?
          </Link>
        </div>
      </footer>
    </div>
  );
}
