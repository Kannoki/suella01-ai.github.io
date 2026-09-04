import React, { useState, useMemo } from 'react';
import type { GetStaticProps } from 'next';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import { AnimatedSection } from '../../components/AnimatedSection';
import { getActivities, Activity, getKnowledgeList, Knowledge } from '../../lib/dataService';
import { formatActivityDate } from '../../lib/dateUtils';

export const getStaticProps: GetStaticProps = async () => {
  try {
    const activities = await getActivities();
    const articles = await getKnowledgeList({ status: 'confirmed' });
    return {
      props: { activities, articles },
      revalidate: 10,
    };
  } catch {
    return {
      props: { activities: [], articles: [] },
      revalidate: 10,
    };
  }
};

const TYPES = ['All', 'Workshop', 'Challenge', 'Masterclass', 'Panel'];
const ITEMS_PER_PAGE = 6;

function typeColor(type: string) {
  const map: Record<string, string> = {
    Workshop: 'bg-purple-100 text-purple-700',
    Challenge: 'bg-pink-100 text-pink-600',
    Masterclass: 'bg-emerald-100 text-emerald-700',
    Panel: 'bg-blue-100 text-blue-700',
  };
  return map[type] || 'bg-gray-100 text-gray-700';
}

function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5 19L19 5M19 5H9M19 5v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface CommonKnowledgeProps {
  activities: Activity[];
  articles: Knowledge[];
}

export default function CommonKnowledge({ activities = [], articles = [] }: CommonKnowledgeProps) {
  const [selectedType, setSelectedType] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return activities.filter((act) => {
      const matchType = selectedType === 'All' || act.type === selectedType;
      const matchSearch =
        !search ||
        act.title.toLowerCase().includes(search.toLowerCase()) ||
        act.description.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [activities, selectedType, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const displayed = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const featured = activities[0];

  return (
    <Layout
      title="Common Knowledge & Activities - MechGirl"
      description="Explore workshops, engineering challenges, masterclasses, and panels for mechanical engineering and robotics."
    >
      <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <AnimatedSection>
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-semibold tracking-widest text-purple-700 uppercase bg-pastelPurple/40 px-4 py-1.5 rounded-full border border-purple-200/40">
              Community Hub
            </span>
            <h1 className="text-4xl md:text-5xl font-light text-brandDark tracking-tight">
              Common Knowledge &amp; Events
            </h1>
            <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed">
              Explore community-driven engineering articles, robotics guides, hands-on workshops, and collaborative challenges.
            </p>
          </div>
        </AnimatedSection>

        {/* Community Technical Knowledge Articles Section */}
        {articles.length > 0 && (
          <AnimatedSection delay={0.05}>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-brandDark">Engineering Guides &amp; Articles</h2>
                  <p className="text-xs text-gray-500">Verified peer-reviewed technical publications and student research.</p>
                </div>
                <Link
                  href="/admin"
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1"
                >
                  + Submit Your Article &rarr;
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((art) => (
                  <Link
                    key={art.id}
                    href={`/common-knowledge/${art.slug}`}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft hover:shadow-card hover:border-pastelPurple/60 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {art.image && (
                        <div className="h-40 -mx-6 -mt-6 rounded-t-3xl overflow-hidden bg-gray-100 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={art.image}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3">
                            <span className="badge bg-white/90 text-purple-700 backdrop-blur-sm shadow-xs text-[11px] font-semibold">
                              {art.category}
                            </span>
                          </span>
                        </div>
                      )}

                      {!art.image && (
                        <span className="badge bg-purple-100 text-purple-700 font-semibold text-[11px]">
                          {art.category}
                        </span>
                      )}

                      <h3 className="text-base font-bold text-brandDark group-hover:text-purple-600 transition-colors line-clamp-2">
                        {art.title}
                      </h3>

                      {art.summary && (
                        <p className="text-xs text-gray-500 font-light line-clamp-2 leading-relaxed">
                          {art.summary}
                        </p>
                      )}

                      {art.tags && art.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {art.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-400">
                      <span>{art.authorName || 'Contributor'}</span>
                      <span className="text-purple-600 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Read Article &rarr;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Featured Card */}
        {featured && selectedType === 'All' && !search && page === 1 && (
          <AnimatedSection delay={0.1}>
            <Link href={`/common-knowledge/${featured.slug}`} className="group block">
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-soft hover:shadow-card transition-all duration-300 grid md:grid-cols-2 group-hover:border-pastelPurple/50">
                <div className="h-64 md:h-full relative overflow-hidden bg-gray-100">
                  {featured.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.image}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background =
                          'linear-gradient(135deg, #E8DFFF, #FFD2E1)';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pastelPurple to-pastelPink" />
                  )}
                  <span className="absolute top-4 left-4">
                    <span className="badge bg-white/90 text-purple-700 backdrop-blur-md shadow-sm">
                      Featured Event
                    </span>
                  </span>
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`badge ${typeColor(featured.type)}`}>{featured.type}</span>
                      <span className="text-xs text-gray-400 font-light">{formatActivityDate(featured.date)}</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-brandDark group-hover:text-purple-600 transition-colors leading-snug">
                      {featured.title}
                    </h2>
                    <p className="text-sm text-gray-500 font-light leading-relaxed line-clamp-3">
                      {featured.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                    <div className="text-xs text-gray-500 font-light">
                      {featured.location || 'Online'} &middot; {featured.registered}/{featured.seats} seats
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 group-hover:translate-x-1 transition-transform">
                      Join Activity <ArrowIcon />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </AnimatedSection>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedType(t);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedType === t
                    ? 'bg-brandDark text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/70'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
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
        {displayed.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
            <p className="text-sm text-gray-400">No activities match your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {displayed.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="group"
                >
                  <Link href={`/common-knowledge/${activity.slug}`} className="block h-full">
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col h-full hover:-translate-y-1 hover:border-pastelPurple/50">
                      <div className="h-44 relative overflow-hidden bg-gray-100">
                        {activity.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={activity.image}
                            alt={activity.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e: any) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.style.background =
                                'linear-gradient(135deg, #E8DFFF, #FFD2E1)';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pastelPurple to-pastelPink" />
                        )}
                        <span className="absolute top-3 left-3">
                          <span className={`badge ${typeColor(activity.type)} bg-white/90 backdrop-blur-md`}>
                            {activity.type}
                          </span>
                        </span>
                        {activity.status === 'full' && (
                          <span className="absolute top-3 right-3">
                            <span className="badge bg-red-500 text-white shadow-sm">
                              Full
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[11px] text-gray-400 font-light block">
                            {formatActivityDate(activity.date)}
                          </span>
                          <h3 className="text-base font-semibold text-brandDark group-hover:text-purple-600 transition-colors leading-snug line-clamp-2">
                            {activity.title}
                          </h3>
                          <p className="text-xs text-gray-500 font-light leading-relaxed line-clamp-2">
                            {activity.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                          <span className="text-[11px] text-gray-400">
                            {activity.seats > 0 ? `${activity.registered}/${activity.seats} registered` : 'Open'}
                          </span>
                          <span className="text-xs font-semibold text-purple-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Details &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs disabled:opacity-30 hover:bg-white"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500 px-3">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs disabled:opacity-30 hover:bg-white"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
