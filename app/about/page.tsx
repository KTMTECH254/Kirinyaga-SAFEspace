import { Playfair_Display, Inter } from 'next/font/google';
import { Target, Eye, Heart, Users, Shield, CheckCircle } from 'lucide-react';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600'], display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap' });

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0c1424] text-white">
      <main className="relative overflow-hidden py-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1323]/75 via-[#0b1323]/75 to-[#0b1323]/90" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0, rgba(255,255,255,0) 35%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.08) 0, rgba(255,255,255,0) 40%), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0, rgba(255,255,255,0) 35%)'
          }}
        />

        <section className="relative z-10 py-10">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className={`text-3xl sm:text-4xl font-semibold text-center ${playfair.className} mb-4`}>
              About Kirinyaga Safespace
            </h1>
            <p className={`text-center text-white/60 ${inter.className} mb-12 max-w-2xl mx-auto`}>
              A compassionate initiative dedicated to providing accessible mental health support
              for students and young adults in our community.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className={`text-xl font-semibold ${playfair.className}`}>Our Mission</h2>
                </div>
                <p className="text-white/70 leading-relaxed">
                  To create a safe, anonymous, and accessible platform where individuals can
                  access mental health support, connect with others who understand their journey,
                  and find the resources they need to thrive - completely free from stigma and judgment.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <Eye className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h2 className={`text-xl font-semibold ${playfair.className}`}>Our Vision</h2>
                </div>
                <p className="text-white/70 leading-relaxed">
                  To become the leading mental health support network in Kenya and across East Africa,
                  fostering a community where every person feels empowered to prioritize their mental
                  wellbeing and has access to the care they deserve.
                </p>
              </div>
            </div>

            <div className="mt-12">
              <h2 className={`text-2xl font-semibold text-center mb-8 ${playfair.className}`}>
                Our Core Values
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Compassion</h3>
                  <p className="text-sm text-white/60">Every interaction is rooted in empathy and understanding</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Privacy</h3>
                  <p className="text-sm text-white/60">Your anonymity and security are our top priority</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Community</h3>
                  <p className="text-sm text-white/60">We believe healing happens together, not alone</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Accessibility</h3>
                  <p className="text-sm text-white/60">Mental health support should be available to everyone</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
