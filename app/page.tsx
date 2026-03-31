'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Playfair_Display, Inter } from 'next/font/google';
import { motion } from 'framer-motion';
import { CloudMoon, Waves, Sparkles, Sun, Target, Eye, Heart, Users, Shield, CheckCircle } from 'lucide-react';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600'], display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap' });

export default function Home() {
  const router = useRouter();

  const moods = useMemo(
    () => [
      { icon: <CloudMoon size={18} />, label: 'Soft' },
      { icon: <Waves size={18} />, label: 'Ocean' },
      { icon: <Sparkles size={18} />, label: 'Bright' },
      { icon: <Sun size={18} />, label: 'Warm' }
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#0c1424] text-white">
      <main className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1f2a44]/58 via-[#7a4a2d]/45 to-[#0b1323]/82" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0, rgba(255,255,255,0) 35%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.08) 0, rgba(255,255,255,0) 40%), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0, rgba(255,255,255,0) 35%)'
        }} />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 pt-20 pb-16">
          <div className={`text-lg tracking-[0.4em] ${playfair.className}`}>
            SAFESPACE
          </div>

          <section className="flex flex-1 flex-col justify-center">
            <div className="max-w-3xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className={`text-4xl sm:text-5xl md:text-6xl font-semibold ${playfair.className}`}
              >
                You&apos;re Not Alone
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className={`mt-3 text-3xl sm:text-4xl md:text-5xl font-light italic text-white/70 ${playfair.className}`}
              >
                in Your Mental Health Journey
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className={`mt-6 max-w-xl text-sm sm:text-base text-white/70 ${inter.className}`}
              >
                A safe, anonymous space where real people support each other through anxiety, stress, depression,
                and recovery. No judgments, just understanding.
              </motion.p>

              <div className="mt-10 flex items-center gap-4">
                {moods.map((mood, index) => (
                  <motion.button
                    key={mood.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.08 }}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur-md transition-all hover:scale-105 hover:border-white/40 hover:text-white"
                    aria-label={mood.label}
                  >
                    {mood.icon}
                  </motion.button>
                ))}
              </div>

              <div className="mt-12 flex flex-wrap gap-4">
                <button
                  onClick={() => router.push('/chat-rooms')}
                  className="rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-[#0b1323] transition-all hover:bg-white"
                >
                  Start Chatting Now
                </button>
                <button
                  onClick={() => router.push('/education')}
                  className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition-all hover:border-white/60 hover:text-white"
                >
                  Explore Support Rooms
                </button>
                <button
                  onClick={() => router.push('/professionals')}
                  className="rounded-full border border-emerald-200/50 bg-emerald-100/10 px-6 py-3 text-sm font-semibold text-emerald-100 transition-all hover:border-emerald-100 hover:bg-emerald-100/20"
                >
                  Meet Licensed Professionals
                </button>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="py-20 mt-20">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className={`text-3xl sm:text-4xl font-semibold text-center ${playfair.className} mb-4`}>
                  About UNSPOKEN MINDS SAFEspace
                </h2>
                <p className={`text-center text-white/60 ${inter.className} mb-12 max-w-2xl mx-auto`}>
                  A compassionate initiative dedicated to providing accessible mental health support 
                  for students and young adults in our community.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Mission */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Target className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className={`text-xl font-semibold ${playfair.className}`}>Our Mission</h3>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    To create a safe, anonymous, and accessible platform where individuals can 
                    access mental health support, connect with others who understand their journey, 
                    and find the resources they need to thrive — completely free from stigma and judgment.
                  </p>
                </motion.div>

                {/* Vision */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                      <Eye className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className={`text-xl font-semibold ${playfair.className}`}>Our Vision</h3>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    To become the leading mental health support network in Kenya and across East Africa, 
                    fostering a community where every person feels empowered to prioritize their mental 
                    wellbeing and has access to the care they deserve.
                  </p>
                </motion.div>
              </div>

              {/* Values */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-12"
              >
                <h3 className={`text-2xl font-semibold text-center mb-8 ${playfair.className}`}>
                  Our Core Values
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6">
                    <div className="w-12 h-12 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="font-semibold mb-2">Compassion</h4>
                    <p className="text-sm text-white/60">Every interaction is rooted in empathy and understanding</p>
                  </div>
                  <div className="text-center p-6">
                    <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="font-semibold mb-2">Privacy</h4>
                    <p className="text-sm text-white/60">Your anonymity and security are our top priority</p>
                  </div>
                  <div className="text-center p-6">
                    <div className="w-12 h-12 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h4 className="font-semibold mb-2">Community</h4>
                    <p className="text-sm text-white/60">We believe healing happens together, not alone</p>
                  </div>
                  <div className="text-center p-6">
                    <div className="w-12 h-12 mx-auto mb-4 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-amber-400" />
                    </div>
                    <h4 className="font-semibold mb-2">Accessibility</h4>
                    <p className="text-sm text-white/60">Mental health support should be available to everyone</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
