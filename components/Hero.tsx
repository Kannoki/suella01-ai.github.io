import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import HeroCarousel from './HeroCarousel';
import { CarouselSlide } from '../lib/dataService';

interface HeroProps {
  slides?: CarouselSlide[];
}

export default function Hero({ slides = [] }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-hero-gradient pt-32 pb-24 md:py-36 px-6">
      <div
        aria-hidden
        className="absolute inset-0 -z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(120% 80% at 80% 20%, #FFD2E1 0%, transparent 55%), radial-gradient(90% 70% at 10% 80%, #C9B8FF 0%, transparent 60%), linear-gradient(135deg, #FFE5F1 0%, #E8DFFF 50%, #FBC9DC 100%)',
        }}
      />

      <HeroCarousel slides={slides} />

      {/* Floating geometric decorative elements */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-16 left-[8%] w-14 h-14 rounded-2xl bg-pink-300/70 rotate-12 hidden md:block z-0 pointer-events-none"
      />
      <motion.div
        animate={{ y: [10, -15, 10], rotate: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-24 right-[12%] w-20 h-20 rounded-full bg-purple-300/60 hidden md:block z-0 pointer-events-none"
      />
      <motion.div
        animate={{ y: [-8, 12, -8], rotate: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-20 left-[15%] w-12 h-12 rounded-xl bg-pink-400/50 -rotate-12 hidden md:block z-0 pointer-events-none"
      />
      <motion.div
        animate={{ y: [12, -8, 12], rotate: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-16 right-[8%] w-24 h-24 rounded-2xl bg-purple-400/50 rotate-6 hidden md:block z-0 pointer-events-none"
      />

      {/* Main Glass Panel Aligned with 6xl Content Grid */}
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="glass-panel max-w-2xl mx-auto lg:mx-0 p-8 md:p-12 text-center lg:text-left shadow-[0_8px_40px_rgba(31,38,135,0.14)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="inline-block text-xs font-semibold tracking-widest text-purple-700 uppercase bg-white/70 px-4 py-1.5 rounded-full border border-white/60 shadow-sm">
              Engineering &amp; Innovation
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl md:text-5xl lg:text-6xl font-light text-brandDark mt-7 mb-6 tracking-tight leading-tight"
          >
            Dream it, Scheme it <br className="hidden md:block" />
            <span className="relative inline-block mt-1">
              <motion.span
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute inset-0 bg-gradient-to-r from-pink-400/30 to-purple-500/30 blur-xl rounded-2xl -z-10"
              />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                STEM it!
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-sm md:text-base text-gray-600 max-w-lg mx-auto lg:mx-0 mb-8 font-light leading-relaxed"
          >
            Sharing advanced engineering resources, hosting tech events, and connecting the next generation of creative minds in STEM.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Link
              href="/common-knowledge"
              className="btn-primary inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              Explore Common Knowledge
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="/products"
              className="btn-outline inline-flex items-center justify-center bg-white/40 backdrop-blur-sm"
            >
              View Projects
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brandBg to-transparent pointer-events-none" />
    </section>
  );
}
