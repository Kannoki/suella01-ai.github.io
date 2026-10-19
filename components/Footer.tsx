'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  registerPresence,
  subscribeOnlineCount,
  subscribeAndIncrementVisits,
} from '../lib/siteStats';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/common-knowledge', label: 'Common Knowledge' },
  { to: '/products', label: 'Projects' },
  { to: '/about', label: 'About Me' },
  { to: '/contact', label: 'Contact' },
];

/** Formats a number with locale thousands separators (e.g. 1204 → "1,204"). */
function fmt(n: number) {
  return n.toLocaleString();
}

export default function Footer() {
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [totalVisits, setTotalVisits] = useState<number | null>(null);

  useEffect(() => {
    // Register this session as online and get cleanup
    const cleanupPresence = registerPresence();

    // Subscribe to live online count
    const unsubOnline = subscribeOnlineCount(setOnlineCount);

    // Increment (once per session) and subscribe to total visits
    const unsubVisits = subscribeAndIncrementVisits(setTotalVisits);

    return () => {
      cleanupPresence();
      unsubOnline();
      unsubVisits();
    };
  }, []);

  return (
    <footer className="border-t border-gray-100 bg-white/50 backdrop-blur-sm py-16 mt-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
        <div className="space-y-4">
          <h3 className="text-base font-bold tracking-wider text-brandDark">
            MECH
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
              GIRL
            </span>
          </h3>
          <p className="text-xs text-gray-500 font-light leading-relaxed max-w-sm">
            An open engineering platform designed to inspire and empower women to take the lead in mechanical design and technology.
          </p>

          <div className="text-xs text-gray-400 font-light space-y-2 pt-2">
            <p>&copy; {new Date().getFullYear()} MechGirl &middot; Crafted beautifully for the STEM community.</p>

            {/* Live visitor stats */}
            <p className="flex items-center gap-3 text-[11px] text-gray-400 select-none pt-1">
              {/* Online now */}
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {onlineCount === null ? '…' : fmt(onlineCount)}&nbsp;online now
              </span>

              <span className="text-gray-200" aria-hidden>·</span>

              {/* Total visits */}
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {totalVisits === null ? '…' : fmt(totalVisits)}&nbsp;visits
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Navigation</h4>
          <ul className="text-xs text-gray-600 space-y-2.5 font-light">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link href={to} className="hover:text-purple-600 transition-colors duration-200">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Connect</h4>
          <p className="text-xs text-gray-600 font-light">Email: contact@mechgirl.com</p>
          <p className="text-xs text-gray-600 font-light">Community: Facebook &middot; YouTube &middot; GitHub</p>
          <p className="text-xs text-gray-600 font-light">Focus: Robotics, Kinematics, CAD &amp; IoT</p>
        </div>
      </div>
    </footer>
  );
}
