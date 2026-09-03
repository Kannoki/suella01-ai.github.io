import React from 'react';
import Link from 'next/link';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/common-knowledge', label: 'Common Knowledge' },
  { to: '/products', label: 'Projects' },
  { to: '/about', label: 'About Me' },
  { to: '/contact', label: 'Contact' },
];

export default function Footer() {
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

      <div className="text-center text-xs text-gray-400 mt-12 pt-6 border-t border-gray-100 font-light space-y-2">
        <Link
          href="/login"
          className="inline-block text-[11px] font-semibold text-gray-400 uppercase tracking-widest hover:text-purple-600 transition-colors py-1 px-3 rounded-full hover:bg-gray-100"
        >
          Admin Login
        </Link>
        <p>&copy; {new Date().getFullYear()} MechGirl &middot; Crafted beautifully for the STEM community.</p>
      </div>
    </footer>
  );
}
