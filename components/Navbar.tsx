import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLoggedInUser } from '../lib/clientAuth';

const links = [
  { to: '/', label: 'Home' },
  { to: '/common-knowledge', label: 'Common Knowledge' },
  { to: '/products', label: 'Projects' },
  { to: '/about', label: 'About Me' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCurrentUser(getLoggedInUser());
  }, []);

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [router?.asPath]);

  const isActive = (path: string) => {
    if (!router?.pathname) return false;
    if (path === '/') return router.pathname === '/';
    return router.pathname.startsWith(path);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!scrolled ? (
          /* ========================================================= */
          /* HEADER 1: Full Top Header (At top of web: Logo + Nav + Sign In) */
          /* ========================================================= */
          <motion.header
            key="top-header"
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="sticky top-0 z-50 glass border-b border-white/20 w-full"
          >
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
              {/* Logo */}
              <Link href="/" className="text-xl font-bold tracking-widest text-brandDark">
                MECH<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">GIRL</span>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
                {links.map(({ to, label }) => {
                  const active = isActive(to);
                  return (
                    <Link
                      key={to}
                      href={to}
                      className="relative group py-1"
                    >
                      <span className={`transition-colors duration-200 ${active ? 'text-brandDark font-semibold' : 'hover:text-purple-600'}`}>
                        {label}
                      </span>
                      <motion.span
                        className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full origin-left"
                        initial={false}
                        animate={{ scaleX: active ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      />
                      <span className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-pastelPurple/20 -z-10" />
                    </Link>
                  );
                })}
              </div>

              {/* Sign In Button */}
              <div className="hidden md:flex items-center">
                <Link
                  href={currentUser ? "/admin" : "/login"}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm hover:shadow-md hover:opacity-90 transition-all flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>{currentUser ? (currentUser.name || 'Dashboard') : 'Sign In'}</span>
                </Link>
              </div>

              {/* Mobile Hamburger */}
              <button
                className="md:hidden flex flex-col space-y-1.5 p-2 text-brandDark"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-0.5 bg-brandDark block origin-center"
                />
                <motion.span
                  animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-0.5 bg-brandDark block"
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-0.5 bg-brandDark block origin-center"
                />
              </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="md:hidden overflow-hidden glass border-t border-white/20"
                >
                  <div className="px-6 py-4 space-y-3">
                    {links.map(({ to, label }) => (
                      <Link
                        key={to}
                        href={to}
                        onClick={() => setMobileOpen(false)}
                        className={`block text-sm font-medium py-2 ${isActive(to) ? 'text-purple-600 font-semibold' : 'text-gray-600'}`}
                      >
                        {label}
                      </Link>
                    ))}
                    <div className="pt-2 border-t border-gray-100">
                      <Link
                        href={currentUser ? "/admin" : "/login"}
                        onClick={() => setMobileOpen(false)}
                        className="block w-full text-center py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                      >
                        {currentUser ? (currentUser.name || 'Dashboard') : 'Sign In'}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.header>
        ) : (
          /* ========================================================= */
          /* HEADER 2: Floating Center Pill (When scrolled down)       */
          /* ========================================================= */
          <motion.header
            key="floating-pill-header"
            initial={{ y: -30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-4 inset-x-0 z-50 flex justify-center items-center pointer-events-none px-4"
          >
            <div className="glass-nav rounded-full px-3 py-2 shadow-lg flex items-center justify-center gap-1.5 pointer-events-auto max-w-fit mx-auto relative">
              {/* Floating Pill Links */}
              <div className="hidden md:flex items-center justify-center gap-1">
                {links.map(({ to, label }) => {
                  const active = isActive(to);
                  return (
                    <Link
                      key={to}
                      href={to}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                        active
                          ? 'bg-white/90 text-brandDark shadow-sm font-semibold'
                          : 'text-brandDark/70 hover:text-brandDark hover:bg-white/50'
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}

                {/* Compact Sign In Pill */}
                <Link
                  href={currentUser ? "/admin" : "/login"}
                  title={currentUser ? "Admin Dashboard" : "Sign In"}
                  className="ml-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm hover:opacity-90 transition-all flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>{currentUser ? 'Admin' : 'Sign In'}</span>
                </Link>
              </div>

              {/* Mobile Hamburger on Pill */}
              <div className="md:hidden flex items-center justify-between gap-3 px-2">
                <Link href="/" className="text-xs font-bold tracking-wider text-brandDark">
                  MECH<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">GIRL</span>
                </Link>
                <button
                  className="p-1.5 text-brandDark rounded-full hover:bg-white/50"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label="Toggle menu"
                >
                  <div className="w-4 flex flex-col gap-1">
                    <span className="block h-0.5 w-full bg-brandDark" />
                    <span className="block h-0.5 w-full bg-brandDark" />
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown from Pill */}
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 8, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="md:hidden absolute top-full left-1/2 -translate-x-1/2 w-64 glass-nav rounded-2xl p-4 shadow-xl border border-white/60 space-y-2 mt-2"
                >
                  {links.map(({ to, label }) => (
                    <Link
                      key={to}
                      href={to}
                      onClick={() => setMobileOpen(false)}
                      className={`block text-xs font-medium py-2 px-3 rounded-xl transition-colors ${
                        isActive(to) ? 'bg-purple-100 text-purple-800 font-semibold' : 'text-gray-600 hover:bg-white/60'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                  <div className="pt-2 border-t border-gray-100">
                    <Link
                      href={currentUser ? "/admin" : "/login"}
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm"
                    >
                      {currentUser ? 'Admin Dashboard' : 'Sign In'}
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.header>
        )}
      </AnimatePresence>
    </>
  );
}
