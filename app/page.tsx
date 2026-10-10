'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Caveat, Inter } from 'next/font/google';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from './providers';
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Heart,
  LifeBuoy,
  MessageCircle,
  ShieldCheck,
  Users,
  UserRound
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], weight: ['400', '600'], display: 'swap' });

const principles = [
  {
    title: 'Anonymous Chatrooms',
    description: 'Talk to others, share your thoughts, or just listen. No real names. No judgment.',
    icon: MessageCircle,
    color: 'from-[#7668ef] to-[#4433a3]'
  },
  {
    title: 'Helpful Resources',
    description: 'Access guides, articles, crisis support and more — all in one place.',
    icon: BookOpen,
    color: 'from-[#27b9dc] to-[#137194]'
  },
  {
    title: 'Support Professionals',
    description: 'Connect with trained professionals when you need extra help.',
    icon: Users,
    color: 'from-[#30c29b] to-[#177d68]'
  },
  {
    title: 'Moderated & Safe',
    description: 'We keep the space respectful and supportive for everyone.',
    icon: ShieldCheck,
    color: 'from-[#d5b64c] to-[#8d702d]'
  }
];

const portals = [
  {
    title: 'Chatrooms',
    caption: 'Talk. Listen. Connect.',
    href: '/chat-rooms',
    icon: MessageCircle,
    image: '/images/reference-chat-door.png'
  },
  {
    title: 'Resources',
    caption: 'Learn. Understand. Heal.',
    href: '/education',
    icon: BookOpen,
    image: '/images/reference-resource-door.png'
  },
  {
    title: 'Crisis Support',
    caption: 'Immediate help. Real people.',
    href: '/emergency',
    icon: LifeBuoy,
    image: '/images/reference-crisis-door.png'
  },
  {
    title: 'Professionals',
    caption: 'Get expert support.',
    href: '/professionals',
    icon: UserRound,
    image: '/images/reference-professional-door.png'
  },
  {
    title: 'Community',
    caption: 'You belong here.',
    href: '/about',
    icon: Heart,
    image: '/images/reference-community-door.png'
  }
];

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const { isDark } = useTheme();

  return (
    <main data-home-theme={isDark ? 'dark' : 'light'} className={`overflow-hidden bg-[#050b16] text-white ${inter.className}`}>
      <section className="home-hero relative isolate min-h-[570px] overflow-hidden bg-[#050b16] sm:min-h-[620px] lg:min-h-[640px]">
        <div className="absolute inset-y-0 right-0 -z-20 w-full lg:w-[70%]">
          <Image
            src="/images/reference-hero.png"
            alt="An illustrated room opening onto a glowing sunset landscape"
            fill
            priority
            loading="eager"
            sizes="(max-width: 1024px) 100vw, 70vw"
            className={`object-cover object-[54%_center] ${isDark ? 'brightness-125' : 'brightness-150'}`}
          />
        </div>
        <div aria-hidden="true" className="home-hero-overlay absolute inset-0 -z-10 bg-[linear-gradient(90deg,#050b16_0%,rgba(5,11,22,.98)_27%,rgba(5,11,22,.82)_43%,rgba(5,11,22,.12)_100%)]" />
        <div aria-hidden="true" className="home-hero-bottomshade absolute inset-0 -z-10 bg-[linear-gradient(0deg,#050b16_0%,transparent_26%,rgba(5,11,22,.12)_100%)]" />

        <div className="mx-auto flex min-h-[570px] max-w-7xl flex-col justify-center px-5 pb-10 pt-12 sm:min-h-[620px] sm:px-8 lg:min-h-[640px] lg:px-12">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-[35rem]"
          >
            <h1 className={`home-hero-title text-[2.3rem] font-normal leading-[0.95] tracking-wide text-white sm:text-5xl lg:text-6xl ${caveat.className}`}>
              You&apos;re not <span className="home-hero-accent text-[#53dfd1]">alone...</span>
              <br />
              even when it feels like it.
            </h1>
            <p className="home-hero-copy mt-5 max-w-sm text-sm leading-6 text-[#e2e7f0] sm:text-base sm:leading-7">
              Unspoken Minds SafeSpace is a free, anonymous mental health support space for young people. Talk. Heal. Grow.
            </p>
            <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
              <Link
                href="/chat-rooms"
                className="home-primary-action group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#32dfb8] to-[#3989ee] px-7 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(45,207,197,.18)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#050b16]"
              >
                Enter SafeSpace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#why-safespace"
                className="home-secondary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#4da9ee] bg-[#050b16]/55 px-7 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Learn More
                <ArrowDown className="h-4 w-4" />
              </Link>
            </div>
            <div className="home-community-note mt-6 flex items-center gap-3 text-[11px] leading-4 text-[#e1e7f1]">
              <div className="flex -space-x-2" aria-hidden="true">
                {['bg-[#d8ad94]', 'bg-[#87c7bc]', 'bg-[#ae9bce]', 'bg-[#d6b67e]'].map((color, index) => (
                  <span key={color} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#152035] ${color}`}>
                    <UserRound className="h-4 w-4 text-[#192238]" />
                    <span className="sr-only">Community member {index + 1}</span>
                  </span>
                ))}
              </div>
              <span>Real people. Real stories. Real support.<br />Join our growing community.</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="why-safespace" className="home-features scroll-mt-20 border-y border-white/5 bg-[#070e1b] px-5 py-9 sm:px-8 sm:py-12 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[1.05fr_3fr] lg:items-center lg:gap-10">
          <div>
            <h2 className="home-feature-heading text-xl font-semibold text-white sm:text-2xl">Why SafeSpace?</h2>
            <span className="mt-2 block h-0.5 w-8 bg-[#3edbc1]" />
            <p className="home-feature-intro mt-3 max-w-xs text-xs leading-[1.55] text-[#d0d7e3] sm:text-sm">
              We understand that sometimes it&apos;s hard to talk. That&apos;s why we&apos;ve created a safe, judgment-free space where you can be yourself — without stigma, without being alone.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-5">
            {principles.map(({ title, description, icon: Icon, color }, index) => (
              <motion.div
                key={title}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="text-center"
              >
                <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="home-feature-title mt-2.5 text-[11px] font-semibold text-white sm:text-xs">{title}</h3>
                <p className="home-feature-description mx-auto mt-1.5 max-w-[12rem] text-[10px] leading-4 text-[#b5c0d0] sm:text-[11px]">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-portals relative isolate overflow-hidden bg-[#06101c] px-4 py-10 sm:px-8 sm:py-12 lg:px-12">
        <div className="absolute inset-0 -z-20">
          <Image
            src="/images/reference-hero.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[center_72%] opacity-25"
          />
        </div>
        <div aria-hidden="true" className="home-portals-overlay absolute inset-0 -z-10 bg-[#06101c]/75" />
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[0.8fr_2.7fr] lg:items-center lg:gap-10">
          <div className="max-w-sm">
            <h2 className={`home-portals-heading text-3xl leading-tight text-white sm:text-4xl ${caveat.className}`}>
              Where do you<br />want to start?
            </h2>
            <span className="mt-2 block h-0.5 w-10 -rotate-12 bg-[#43d8c3]" />
            <p className="home-portals-copy mt-4 text-xs leading-5 text-[#d2dae7]">
              Everyone&apos;s journey is different. Choose what feels right for you, or just explore.
            </p>
            <p className={`home-portals-aside mt-5 text-lg italic text-[#7fe2d5] ${caveat.className}`}>
              It&apos;s okay to seek help.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {portals.map(({ title, caption, href, icon: Icon, image }, index) => (
              <motion.div
                key={title}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="group"
              >
                <Link
                  href={href}
                  className="block rounded-xl text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06101c]"
                >
                  <div className="relative h-36 overflow-hidden rounded-t-[3.5rem] border border-white/15 bg-[#10182a] sm:h-40 lg:h-44">
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 18vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030813]/80 via-transparent to-[#030813]/5" />
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/30 bg-[#07101e]/55 text-white backdrop-blur-sm">
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                  <h3 className="home-portal-title mt-2 text-xs font-semibold text-white">{title}</h3>
                  <p className="home-portal-caption mt-1 text-[10px] leading-4 text-[#bac5d5]">{caption}</p>
                  <span className="mx-auto mt-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/35 text-white/80 transition group-hover:border-cyan-300 group-hover:bg-cyan-300 group-hover:text-[#07101c]">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-note relative overflow-hidden border-t border-white/10 bg-[#111b2b] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(80,132,203,.2),transparent_68%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-center gap-5 sm:gap-8">
            <h2 className={`home-note-heading shrink-0 text-3xl leading-none text-white sm:text-4xl ${caveat.className}`}>
              Your mind<br />matters.
            </h2>
            <div className="h-14 w-px bg-white/25" />
            <div>
              <p className="home-note-title text-sm font-semibold text-white">A safe space today.<br />A brighter tomorrow.</p>
              <p className="home-note-copy mt-2 max-w-md text-xs leading-5 text-[#bdc8d8]">
                You don&apos;t have to go through it alone. Choose a way to pause, connect, or find support at your own pace.
              </p>
            </div>
          </div>
          <Link
            href="/emergency"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#53d9c5]/60 px-5 text-sm font-semibold text-[#8de9db] transition hover:bg-[#53d9c5]/10"
          >
            Need urgent help?
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
