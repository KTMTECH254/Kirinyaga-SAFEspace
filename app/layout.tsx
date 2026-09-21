'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './providers';
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
  Moon,
  Sun
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
        <div className="dark:hidden">Light</div>
        <div className="hidden dark:block">Dark</div>
        <header
          className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
            scrolled
              ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
              : 'bg-white border-b border-gray-100'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex min-h-20 items-center justify-between py-3">
              <div className="flex items-center">
                <a href="/" className="flex items-center space-x-3 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-xl blur group-hover:blur-sm transition-all"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2.5 rounded-xl shadow-sm">
                      <Heart size={24} className="fill-current" />
                    </div>
                  </div>
                  <div className="leading-tight">
                    <h1 className="text-lg sm:text-xl xl:text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent leading-[1.05]">
                      <span className="block sm:inline">UNSPOKEN MINDS</span>{' '}
                    </h1>
                    <p className="text-xs text-gray-500 font-medium">Mental Health Support Platform</p>
                  </div>
                </a>
              </div>

              <nav className="hidden lg:flex items-center space-x-1">
                <NavLink href="/" icon={<Home size={18} />}>Home</NavLink>
                <NavLink href="/about" icon={<Heart size={18} />}>About</NavLink>
                <NavLink href="/emergency" icon={<AlertCircle size={18} />}>Emergency</NavLink>
                {!isLoggedIn && <NavLink href="/login" icon={<User size={18} />}>Sign In</NavLink>}
                {isLoggedIn && (
                  <>
                    <NavLink href="/chat-rooms" icon={<MessageCircle size={18} />}>Chat Rooms</NavLink>
                    <NavLink href="/education" icon={<BookOpen size={18} />}>Resources</NavLink>
                    <NavLink href="/progress" icon={<BarChart3 size={18} />}>Progress</NavLink>
                    <NavLink href="/professionals" icon={<Users size={18} />}>Professionals</NavLink>
                    <NavLink href="/profile" icon={<User size={18} />}>Profile</NavLink>
                  </>
                )}
              </nav>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="lg:hidden p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Toggle menu"
                >
                  {menuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
                </button>
              </div>
            </div>
          </div>

          {menuOpen && (
            <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg">
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="grid grid-cols-2 gap-2 py-2">
                  <MobileNavLink href="/" icon={<Home size={20} />} onClick={() => setMenuOpen(false)}>
                    Home
                  </MobileNavLink>
                  <MobileNavLink href="/about" icon={<Heart size={20} />} onClick={() => setMenuOpen(false)}>
                    About
                  </MobileNavLink>
                  <MobileNavLink href="/emergency" icon={<AlertCircle size={20} />} onClick={() => setMenuOpen(false)}>
                    Emergency
                  </MobileNavLink>
                  {!isLoggedIn && (
                    <MobileNavLink href="/login" icon={<User size={20} />} onClick={() => setMenuOpen(false)}>
                      Sign In
                    </MobileNavLink>
                  )}
                  {isLoggedIn && (
                    <>
                      <MobileNavLink href="/chat-rooms" icon={<MessageCircle size={20} />} onClick={() => setMenuOpen(false)}>
                        Chat Rooms
                      </MobileNavLink>
                      <MobileNavLink href="/education" icon={<BookOpen size={20} />} onClick={() => setMenuOpen(false)}>
                        Resources
                      </MobileNavLink>
                      <MobileNavLink href="/academic-resources" icon={<BookOpen size={20} />} onClick={() => setMenuOpen(false)}>
                        Academic
                      </MobileNavLink>
                      <MobileNavLink href="/progress" icon={<BarChart3 size={20} />} onClick={() => setMenuOpen(false)}>
                        Progress
                      </MobileNavLink>
                      <MobileNavLink href="/professionals" icon={<Users size={20} />} onClick={() => setMenuOpen(false)}>
                        Professionals
                      </MobileNavLink>
                      <MobileNavLink href="/profile" icon={<User size={20} />} onClick={() => setMenuOpen(false)}>
                        My Profile
                      </MobileNavLink>
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

        <AnonymousProfile />

        <footer className="bg-gradient-to-b from-white to-blue-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 rounded-lg">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">UNSPOKEN MINDS SAFEspace</h3>
                    <p className="text-sm text-gray-600">Safe and Anonymous Support</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  A compassionate space for mental health support, resources, and community connection.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Shield size={16} />
                  <span>100 percent Anonymous and Secure</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">Quick Links</h4>
                <div className="space-y-3">
                  <FooterLink href="/chat-rooms">Support Chat Rooms</FooterLink>
                  <FooterLink href="/education">Education Hub</FooterLink>
                  <FooterLink href="/academic-resources">Academic Resources</FooterLink>
                  <FooterLink href="/professionals">Professional Directory</FooterLink>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">Support</h4>
                <div className="space-y-3">
                  <FooterLink href="/help">Help Center</FooterLink>
                  <FooterLink href="/privacy">Privacy Policy</FooterLink>
                  <FooterLink href="/terms">Terms of Service</FooterLink>
                  <FooterLink href="/contact">Contact Us</FooterLink>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">Crisis Support</h4>
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

            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>Copyright {new Date().getFullYear()} UNSPOKEN MINDS SAFEspace</span>
                  <span className="hidden md:inline">·</span>
                  <div className="flex items-center gap-2">
                    <Lock size={14} />
                    <span>End-to-end encrypted chats</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <a href="/accessibility" className="text-sm text-gray-600 hover:text-blue-600">Accessibility</a>
                  <a href="/cookies" className="text-sm text-gray-600 hover:text-blue-600">Cookies</a>
                  <a href="/sitemap" className="text-sm text-gray-600 hover:text-blue-600">Sitemap</a>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
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

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group relative flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 rounded-lg transition-all duration-200 font-medium text-sm"
    >
      <span className="text-gray-500 group-hover:text-blue-500 transition-colors">
        {icon}
      </span>
      <span>{children}</span>
      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
    </a>
  );
}

function MobileNavLink({ href, icon, onClick, children }: {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors duration-200 text-center group"
    >
      <div className="text-blue-600 mb-2 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{children}</span>
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="block text-gray-600 hover:text-blue-600 hover:translate-x-1 transition-all duration-200 text-sm"
    >
      {children}
    </a>
  );
}
