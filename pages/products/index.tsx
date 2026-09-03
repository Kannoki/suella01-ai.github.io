import React, { useState, useMemo } from 'react';
import type { GetStaticProps } from 'next';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import { AnimatedSection } from '../../components/AnimatedSection';
import { getProducts, Product } from '../../lib/dataService';

export const getStaticProps: GetStaticProps = async () => {
  try {
    const products = await getProducts();
    return {
      props: { products },
      revalidate: 10,
    };
  } catch {
    return {
      props: { products: [] },
      revalidate: 10,
    };
  }
};

const CATEGORIES = ['All', 'Robotics', 'Knowledge', 'IoT', 'Mechatronics'];

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    Robotics: 'bg-purple-100 text-purple-700',
    Knowledge: 'bg-blue-100 text-blue-700',
    IoT: 'bg-emerald-100 text-emerald-700',
    Mechatronics: 'bg-orange-100 text-orange-700',
  };
  return map[cat] || 'bg-gray-100 text-gray-700';
}

interface ProductsProps {
  products: Product[];
}

export default function Products({ products = [] }: ProductsProps) {
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCat === 'All' || p.category === selectedCat;
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, selectedCat, search]);

  return (
    <Layout
      title="Projects & Engineering Showcase - MechGirl"
      description="Discover open-source robotics mechanisms, kinematics simulations, IoT stations, and CAD model libraries."
    >
      <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <AnimatedSection>
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-semibold tracking-widest text-purple-700 uppercase bg-pastelPurple/40 px-4 py-1.5 rounded-full border border-purple-200/40">
              Portfolio &amp; Showcase
            </span>
            <h1 className="text-4xl md:text-5xl font-light text-brandDark tracking-tight">
              Engineering Projects &amp; Tools
            </h1>
            <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed">
              Open-source mechanisms, robotics architectures, CAD component libraries, and embedded automation projects built with precision and passion.
            </p>
          </div>
        </AnimatedSection>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedCat === cat
                    ? 'bg-brandDark text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <input
              type="text"
              placeholder="Search projects or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-9 rounded-full text-xs bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pastelPurple"
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3 top-2.5 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
        </div>

        {/* Grid List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
            <p className="text-sm text-gray-400">No projects found for the current search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((prod, index) => (
                <motion.div
                  key={prod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col h-full hover:-translate-y-1 hover:border-pastelPurple/50">
                    <div className="h-48 relative overflow-hidden bg-gray-100">
                      {prod.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e: any) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.background =
                              'linear-gradient(135deg, #FFD2E1, #E8DFFF)';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pastelPurple to-pastelPink flex items-center justify-center text-xs font-mono text-gray-400">
                          {prod.category}
                        </div>
                      )}
                      <span className="absolute top-3 left-3">
                        <span className={`badge ${categoryColor(prod.category)} bg-white/90 backdrop-blur-md`}>
                          {prod.category}
                        </span>
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <Link
                          href={`/products/${prod.slug}`}
                          className="text-base font-semibold text-brandDark group-hover:text-purple-600 transition-colors block line-clamp-1"
                        >
                          {prod.title}
                        </Link>
                        <p className="text-xs text-gray-500 font-light leading-relaxed line-clamp-3">
                          {prod.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {prod.tags?.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <Link
                            href={`/products/${prod.slug}`}
                            className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            Details &rarr;
                          </Link>
                          <div className="flex items-center gap-3">
                            {prod.demo && (
                              <a
                                href={prod.demo}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-purple-600 hover:underline"
                              >
                                Live Demo
                              </a>
                            )}
                            {prod.github && (
                              <a
                                href={prod.github}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-gray-400 hover:text-brandDark transition-colors flex items-center gap-1"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                Code
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
}
