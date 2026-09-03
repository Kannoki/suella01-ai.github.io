import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const isActive = (path: string) => {
    if (!router?.pathname) return false;
    if (path === '/') return router.pathname === '/';
    return router.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-nav rounded-full px-3 py-2 max-w-fit mx-auto">
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                href={to}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  active
                    ? 'bg-white/90 text-brandDark shadow-sm'
                    : 'text-brandDark/70 hover:text-brandDark hover:bg-white/50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <button
          className="md:hidden p-2 text-brandDark"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation menu"
        >
          <span className="sr-only">Menu</span>
          <div className="w-5 flex flex-col gap-1">
            <span className="block h-0.5 w-full bg-brandDark" />
            <span className="block h-0.5 w-full bg-brandDark" />
            <span className="block h-0.5 w-full bg-brandDark" />
          </div>
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="glass-dropdown absolute top-full mt-2 left-1/2 -translate-x-1/2 rounded-2xl p-2 min-w-[200px] md:hidden shadow-lg"
            >
              {links.map(({ to, label }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    href={to}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      active
                        ? 'bg-white/90 text-brandDark shadow-sm'
                        : 'text-brandDark/70 hover:text-brandDark hover:bg-white/50'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
