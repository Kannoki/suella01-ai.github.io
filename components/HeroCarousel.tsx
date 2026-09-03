import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarouselSlide } from '../lib/dataService';

interface HeroCarouselProps {
  slides?: CarouselSlide[];
  interval?: number;
}

export default function HeroCarousel({ slides = [], interval = 5000 }: HeroCarouselProps) {
  const [items, setItems] = useState<CarouselSlide[]>(slides);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides && slides.length > 0) {
      setItems(slides);
    } else {
      fetch('/api/carousel')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setItems(data);
          }
        })
        .catch(() => {});
    }
  }, [slides]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [items.length, interval]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex];
  if (!current) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id || currentIndex}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.src}
            alt={current.alt || 'Engineering carousel background'}
            className="w-full h-full object-cover"
            onError={(e: any) => {
              e.target.style.display = 'none';
            }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-brandBg/80" />

      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'bg-purple-600 w-7'
                  : 'bg-white/60 hover:bg-white/90 w-2'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
