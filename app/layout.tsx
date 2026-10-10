'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './providers';
import { useTheme } from './providers';
import AnonymousProfile from './components/AnonymousProfile';
import {
  Menu,
  X,
  Heart,
  MessageCircle,
  BookOpen,
  BarChart3,
  Users,
  User,
  Shield,
  Home,
  AlertCircle,
  ChevronRight,
  Phone,
  Lock,
  Brain,
  Sun,
  Moon,
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <AppLayout>{children}</AppLayout>
    </ThemeProvider>
  );
}

function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('anonymousUser');
      const loggedIn = !!userData;
      setIsLoggedIn(loggedIn);

      const publicRoutes = [
        '/login',
        '/about',
        '/emergency',
        '/help',
        '/privacy',
        '/terms',
        '/contact',
        '/accessibility',
        '/cookies',
        '/sitemap'
      ];

      if (!loggedIn && !publicRoutes.includes(pathname) && pathname !== '/') {
        router.push('/login');
      }

      setIsLoading(false);
    };

    checkAuth();

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname, router]);

  if (isLoading) {
    return (
      <html lang="en" className="scroll-smooth">
        <body className={`${inter.className} bg-white text-gray-900 antialiased flex items-center justify-center min-h-screen`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <title>UNSPOKEN MINDS SAFEspace - Mental Health Support</title>
        <meta name="description" content="Safe, anonymous mental health support platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] antialiased dark:bg-[hsl(var(--bg-primary))] dark:text-[hsl(var(--text-primary))]`}>
        <header
          className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
            isDark
              ? scrolled
                ? 'bg-[#080e1a]/95 backdrop-blur-md border-b border-white/10 shadow-lg'
                : 'bg-[#080e1a]/85 backdrop-blur-md border-b border-white/10'
              : scrolled
                ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
                : 'bg-white border-b border-gray-100'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex min-h-20 items-center justify-between py-3">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-3 group">
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-xl blur transition-all group-hover:blur-sm ${isDark ? 'bg-cyan-300/30' : 'bg-blue-100'}`}></div>
                    <div className={`relative rounded-xl p-2.5 text-white shadow-sm ${isDark ? 'bg-gradient-to-br from-[#29d7bd] to-[#438cf0]' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                      {pathname === '/' ? <Brain size={24} /> : <Heart size={24} className="fill-current" />}
                    </div>
                  </div>
                  <div className="leading-tight">
                    <h1 className={`text-lg sm:text-xl xl:text-2xl font-bold tracking-tight bg-clip-text text-transparent leading-[1.05] ${isDark ? 'bg-gradient-to-r from-white to-cyan-100' : 'bg-gradient-to-r from-blue-700 to-blue-900'}`}>
                      <span className="block sm:inline">UNSPOKEN MINDS</span>{' '}
                    </h1>
                    <p className={`text-xs font-medium ${isDark ? 'text-blue-100/70' : 'text-gray-500'}`}>Mental Health Support Platform</p>
                  </div>
                </Link>
              </div>

              <nav className="hidden lg:flex items-center space-x-1">
                {pathname === '/' ? (
                  <>
                    <NavLink href="/" icon={<Home size={18} />} dark={isDark}>Home</NavLink>
                    <NavLink href="/chat-rooms" icon={<MessageCircle size={18} />} dark={isDark}>Chatrooms</NavLink>
                    <NavLink href="/education" icon={<BookOpen size={18} />} dark={isDark}>Resources</NavLink>
                    <NavLink href="/professionals" icon={<Users size={18} />} dark={isDark}>Professionals</NavLink>
                    <NavLink href="/about" icon={<Heart size={18} />} dark={isDark}>About</NavLink>
                    <Link
                      href={isLoggedIn ? '/profile' : '/login'}
                      className={`ml-2 inline-flex min-h-10 items-center rounded-full border px-5 text-sm font-semibold transition ${isDark ? 'border-cyan-300/70 text-white hover:bg-cyan-300/10' : 'border-blue-600 text-blue-700 hover:bg-blue-50'}`}
                    >
                      {isLoggedIn ? 'My Space' : 'Join Now'}
                    </Link>
                  </>
                ) : (
                  <>
                    <NavLink href="/" icon={<Home size={18} />} dark={isDark}>Home</NavLink>
                    <NavLink href="/about" icon={<Heart size={18} />} dark={isDark}>About</NavLink>
                    <NavLink href="/emergency" icon={<AlertCircle size={18} />} dark={isDark}>Emergency</NavLink>
                    {!isLoggedIn && <NavLink href="/login" icon={<User size={18} />} dark={isDark}>Sign In</NavLink>}
                    {isLoggedIn && (
                      <>
                        <NavLink href="/chat-rooms" icon={<MessageCircle size={18} />} dark={isDark}>Chat Rooms</NavLink>
                        <NavLink href="/education" icon={<BookOpen size={18} />} dark={isDark}>Resources</NavLink>
                        <NavLink href="/progress" icon={<BarChart3 size={18} />} dark={isDark}>Progress</NavLink>
                        <NavLink href="/professionals" icon={<Users size={18} />} dark={isDark}>Professionals</NavLink>
                        <NavLink href="/profile" icon={<User size={18} />} dark={isDark}>Profile</NavLink>
                      </>
                    )}
                  </>
                )}
              </nav>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${isDark ? 'text-amber-200 hover:bg-white/10' : 'text-slate-700 hover:bg-gray-100'}`}
                  aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  aria-pressed={isDark}
                  title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                >
                  {isDark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
                </button>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`lg:hidden p-2.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
                  aria-label="Toggle menu"
                >
                  {menuOpen ? <X size={24} className={isDark ? 'text-white' : 'text-gray-700'} /> : <Menu size={24} className={isDark ? 'text-white' : 'text-gray-700'} />}
                </button>
              </div>
            </div>
          </div>

          {menuOpen && (
            <div className={`lg:hidden border-t shadow-lg ${isDark ? 'border-white/10 bg-[#080e1a]' : 'border-gray-100 bg-white'}`}>
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="grid grid-cols-2 gap-2 py-2">
                  {pathname === '/' ? (
                    <>
                      <MobileNavLink href="/" icon={<Home size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                        Home
                      </MobileNavLink>
                      <MobileNavLink href="/chat-rooms" icon={<MessageCircle size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                        Chatrooms
                      </MobileNavLink>
                      <MobileNavLink href="/education" icon={<BookOpen size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                        Resources
                      </MobileNavLink>
                      <MobileNavLink href="/professionals" icon={<Users size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                        Professionals
                      </MobileNavLink>
                      <MobileNavLink href="/about" icon={<Heart size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                        About
                      </MobileNavLink>
                      <MobileNavLink href="/emergency" icon={<AlertCircle size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                        Emergency
                      </MobileNavLink>
                      <MobileNavLink href={isLoggedIn ? '/profile' : '/login'} icon={<User size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                        {isLoggedIn ? 'My Space' : 'Join Now'}
                      </MobileNavLink>
                    </>
                  ) : (
                    <>
                      <MobileNavLink href="/" icon={<Home size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                        Home
                      </MobileNavLink>
                      <MobileNavLink href="/about" icon={<Heart size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                        About
                      </MobileNavLink>
                      <MobileNavLink href="/emergency" icon={<AlertCircle size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                        Emergency
                      </MobileNavLink>
                      {!isLoggedIn && (
                        <MobileNavLink href="/login" icon={<User size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                          Sign In
                        </MobileNavLink>
                      )}
                      {isLoggedIn && (
                        <>
                          <MobileNavLink href="/chat-rooms" icon={<MessageCircle size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                            Chat Rooms
                          </MobileNavLink>
                          <MobileNavLink href="/education" icon={<BookOpen size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                            Resources
                          </MobileNavLink>
                          <MobileNavLink href="/academic-resources" icon={<BookOpen size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                            Academic
                          </MobileNavLink>
                          <MobileNavLink href="/progress" icon={<BarChart3 size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                            Progress
                          </MobileNavLink>
                          <MobileNavLink href="/professionals" icon={<Users size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                            Professionals
                          </MobileNavLink>
                          <MobileNavLink href="/profile" icon={<User size={20} />} onClick={() => setMenuOpen(false)} dark={isDark}>
                            My Profile
                          </MobileNavLink>
                        </>
                      )}
                    </>
                  )}
                </div>
                {isLoggedIn && (
                  <div className="pt-4 mt-3 border-t border-gray-100">
                    <a
                      href="/admin/reports"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <BarChart3 size={20} />
                        <span className="font-medium">Reports Dashboard</span>
                      </div>
                      <ChevronRight size={20} className="text-blue-400" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <main className="pt-20 min-h-screen">
          {children}
        </main>

        {!['/', '/chat-rooms', '/chat/anxiety'].includes(pathname) && <AnonymousProfile />}

        <footer className={`border-t ${isDark ? 'border-white/10 bg-[#080e1a]' : 'border-gray-100 bg-gradient-to-b from-white to-blue-50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 rounded-lg">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>UNSPOKEN MINDS SAFEspace</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Safe and Anonymous Support</p>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  A compassionate space for mental health support, resources, and community connection.
                </p>
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-cyan-300' : 'text-blue-600'}`}>
                  <Shield size={16} />
                  <span>Choose an anonymous display name and protect your personal details</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Links</h4>
                <div className="space-y-3">
                  <FooterLink href="/chat-rooms" dark={isDark}>Support Chat Rooms</FooterLink>
                  <FooterLink href="/education" dark={isDark}>Education Hub</FooterLink>
                  <FooterLink href="/academic-resources" dark={isDark}>Academic Resources</FooterLink>
                  <FooterLink href="/professionals" dark={isDark}>Professional Directory</FooterLink>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Support</h4>
                <div className="space-y-3">
                  <FooterLink href="/help" dark={isDark}>Help Center</FooterLink>
                  <FooterLink href="/privacy" dark={isDark}>Privacy Policy</FooterLink>
                  <FooterLink href="/terms" dark={isDark}>Terms of Service</FooterLink>
                  <FooterLink href="/contact" dark={isDark}>Contact Us</FooterLink>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Crisis Support</h4>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-5 shadow-lg">
                  <div className="flex items-start gap-3">
                    <Phone size={24} className="flex-shrink-0" />
                    <div>
                      <p className="font-bold text-lg">24/7 Crisis Line</p>
                      <p className="text-2xl font-black mt-1 tracking-tight">0800 221 444</p>
                      <p className="text-sm text-blue-100 mt-2">Free · Confidential · Immediate Support</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-400">
                    <p className="text-sm text-blue-100">
                      This platform supplements but does not replace professional care.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`mt-12 border-t pt-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className={`flex items-center gap-6 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  <span>Copyright {new Date().getFullYear()} UNSPOKEN MINDS SAFEspace</span>
                  <span className="hidden md:inline">·</span>
                  <div className="flex items-center gap-2">
                    <Lock size={14} />
                    <span>Share only what you feel comfortable sharing</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <a href="/accessibility" className={`text-sm ${isDark ? 'text-slate-400 hover:text-cyan-300' : 'text-gray-600 hover:text-blue-600'}`}>Accessibility</a>
                  <a href="/cookies" className={`text-sm ${isDark ? 'text-slate-400 hover:text-cyan-300' : 'text-gray-600 hover:text-blue-600'}`}>Cookies</a>
                  <a href="/sitemap" className={`text-sm ${isDark ? 'text-slate-400 hover:text-cyan-300' : 'text-gray-600 hover:text-blue-600'}`}>Sitemap</a>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  Based in Kenya · Supporting mental wellness across East Africa
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, icon, children, dark = false }: { href: string; icon: React.ReactNode; children: React.ReactNode; dark?: boolean }) {
  return (
    <a
      href={href}
      className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${dark ? 'text-white/85 hover:text-cyan-200' : 'text-gray-700 hover:text-blue-600'}`}
    >
      <span className={`transition-colors ${dark ? 'text-white/60 group-hover:text-cyan-200' : 'text-gray-500 group-hover:text-blue-500'}`}>
        {icon}
      </span>
      <span>{children}</span>
      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
    </a>
  );
}

function MobileNavLink({ href, icon, onClick, children, dark = false }: {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-colors duration-200 text-center group ${dark ? 'bg-[#111b2d] hover:bg-[#1b2a40]' : 'bg-gray-50 hover:bg-blue-50'}`}
    >
      <div className={`mb-2 transition-transform group-hover:scale-110 ${dark ? 'text-cyan-300' : 'text-blue-600'}`}>
        {icon}
      </div>
      <span className={`text-sm font-medium ${dark ? 'text-white/85 group-hover:text-white' : 'text-gray-700 group-hover:text-blue-700'}`}>{children}</span>
    </a>
  );
}

function FooterLink({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <a
      href={href}
      className={`block transition-all duration-200 text-sm hover:translate-x-1 ${dark ? 'text-slate-400 hover:text-cyan-300' : 'text-gray-600 hover:text-blue-600'}`}
    >
      {children}
    </a>
  );
}
