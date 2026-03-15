import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Scale, Menu, X, ChevronDown, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen]         = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dashPath = user?.role === 'admin'  ? '/dashboard/admin'
                 : user?.role === 'lawyer' ? '/dashboard/lawyer'
                 : '/dashboard/client';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/lawyers',               label: 'Find Lawyers' },
    { href: '/lawyers?spec=3',        label: 'Immigration' },
    { href: '/lawyers?spec=1',        label: 'Real Estate' },
    { href: '/lawyers?spec=4',        label: 'Business Law' },
  ];

  const isHome = router.pathname === '/';

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled || !isHome
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      )}
    >
      <div className="container-lg">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center group-hover:bg-gold-500 transition-colors duration-200">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span
              className={clsx('text-xl font-bold transition-colors', isHome && !scrolled ? 'text-white' : 'text-navy-950')}
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Lex<span className="text-gold-500">Bridge</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  'text-sm font-medium transition-colors hover:text-navy-900',
                  isHome && !scrolled ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-navy-900',
                  router.pathname === l.href && 'text-navy-900 font-semibold'
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropdown(!dropdown)}
                  className="flex items-center gap-2 text-sm font-medium text-navy-900 hover:text-navy-700"
                >
                  <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <span className={clsx(isHome && !scrolled ? 'text-white' : 'text-navy-900')}>
                    {user.firstName}
                  </span>
                  <ChevronDown className={clsx('w-4 h-4', isHome && !scrolled ? 'text-white' : 'text-gray-500')} />
                </button>
                {dropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-card-lg border border-gray-100 py-1.5 z-50 animate-fade-up">
                    <Link href={dashPath} onClick={() => setDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <LayoutDashboard className="w-4 h-4 text-gray-400" /> Dashboard
                    </Link>
                    <Link href="/profile" onClick={() => setDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4 text-gray-400" /> Profile
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={clsx('text-sm font-medium transition-colors', isHome && !scrolled ? 'text-white hover:text-white/80' : 'text-gray-600 hover:text-navy-900')}
                >
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className={clsx('md:hidden', isHome && !scrolled ? 'text-white' : 'text-navy-900')}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-medium text-gray-700 hover:text-navy-900">
              {l.label}
            </Link>
          ))}
          <hr className="border-gray-100 my-2" />
          {user ? (
            <>
              <Link href={dashPath} onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-medium text-navy-900">Dashboard</Link>
              <button onClick={() => { handleLogout(); setOpen(false); }}
                className="block py-2.5 text-sm text-red-600 w-full text-left">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setOpen(false)}
                className="block py-2.5 text-sm text-gray-700">Sign In</Link>
              <Link href="/auth/register" onClick={() => setOpen(false)}
                className="btn-primary w-full mt-2">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
