import React from 'react';
import type { GetStaticProps } from 'next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import { AnimatedSection, AnimatedStagger, StaggerItem } from '../components/AnimatedSection';
import AnimatedCard from '../components/AnimatedCard';
import {
  getActivities,
  getProducts,
  getCarouselSlides,
  Activity,
  Product,
  CarouselSlide,
} from '../lib/dataService';
import { formatActivityDate } from '../lib/dateUtils';

export const getStaticProps: GetStaticProps = async () => {
  try {
    const [allActivities, allProducts, slides] = await Promise.all([
      getActivities(),
      getProducts(),
      getCarouselSlides(),
    ]);

    const upcomingActivities = allActivities.slice(0, 3);
    const featuredProducts = allProducts.filter((p) => p.featured).slice(0, 3);

    return {
      props: {
        upcomingActivities,
        featuredProducts,
        slides,
      },
      revalidate: 10,
    };
  } catch (e) {
    return {
      props: {
        upcomingActivities: [],
        featuredProducts: [],
        slides: [],
      },
      revalidate: 10,
    };
  }
};

interface HomeProps {
  upcomingActivities: Activity[];
  featuredProducts: Product[];
  slides: CarouselSlide[];
}

function activityTypeColor(type: string) {
  const map: Record<string, string> = {
    Workshop: 'bg-purple-100/70 text-purple-700',
    Challenge: 'bg-pink-100/70 text-pink-600',
    Masterclass: 'bg-emerald-100/70 text-emerald-700',
    Panel: 'bg-blue-100/70 text-blue-700',
  };
  return map[type] || 'bg-gray-100 text-gray-700';
}

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    Robotics: 'bg-purple-50 text-purple-600 border border-purple-100',
    Knowledge: 'bg-blue-50 text-blue-600 border border-blue-100',
    IoT: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    Mechatronics: 'bg-orange-50 text-orange-600 border border-orange-100',
  };
  return map[cat] || 'bg-gray-50 text-gray-600 border border-gray-100';
}

export default function Home({ upcomingActivities = [], featuredProducts = [], slides = [] }: HomeProps) {
  return (
    <Layout
      title="MechGirl - Empowering Women in Mechanics, Robotics & STEM"
      description="An open engineering platform designed to inspire and empower women in mechanical design, robotics, and technology."
    >
      <div className="min-h-screen">
        <Hero slides={slides} />

        <div className="max-w-6xl mx-auto px-6 py-20 space-y-24">
          {/* Activities Section */}
          <section>
            <AnimatedSection>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-purple-600 block mb-1">
                    Join Our Events &amp; Workshops
                  </span>
                  <h2 className="section-title">Upcoming Activities</h2>
                </div>
                <Link
                  href="/common-knowledge"
                  className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  View All
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 7h12M8 3l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </AnimatedSection>

            {upcomingActivities.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No upcoming activities right now. Check back soon!
              </div>
            ) : (
              <AnimatedStagger staggerDelay={0.08} className="space-y-4">
                {upcomingActivities.map((activity) => (
                  <StaggerItem key={activity.id}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row gap-5 hover:border-pastelPurple/60 hover:shadow-md transition-all duration-200"
                    >
                      {activity.image && (
                        <div className="sm:w-44 sm:h-32 h-40 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={activity.image}
                            alt={activity.title}
                            className="w-full h-full object-cover"
                            onError={(e: any) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.style.background =
                                'linear-gradient(135deg, #E8DFFF, #FFD2E1)';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`badge ${activityTypeColor(activity.type)}`}>
                              {activity.type}
                            </span>
                            {activity.status === 'full' && (
                              <span className="badge bg-red-100 text-red-600">Full</span>
                            )}
                          </div>
                          <Link
                            href={`/common-knowledge/${activity.slug}`}
                            className="text-base font-semibold text-brandDark leading-snug hover:text-purple-600 transition-colors block truncate"
                          >
                            {activity.title}
                          </Link>
                          <p className="text-xs text-gray-500 font-light line-clamp-2 leading-relaxed">
                            {activity.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <rect x="1" y="2" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
                                <path d="M1 5h10M4 1v2M8 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                              </svg>
                              {formatActivityDate(activity.date)}
                            </span>
                            {activity.seats > 0 && (
                              <span>
                                {activity.registered}/{activity.seats} registered
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/common-knowledge/${activity.slug}`}
                            className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            Learn More &rarr;
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </AnimatedStagger>
            )}

            <div className="mt-6 text-center md:hidden">
              <Link
                href="/common-knowledge"
                className="btn-outline text-xs px-6 py-2.5 inline-block"
              >
                View All Activities
              </Link>
            </div>
          </section>

          {/* Featured Projects Section */}
          <section>
            <AnimatedSection>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-purple-600 block mb-1">
                    Hands-on Engineering Designs
                  </span>
                  <h2 className="section-title">Featured Projects</h2>
                </div>
                <Link
                  href="/products"
                  className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  View All Projects
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 7h12M8 3l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredProducts.map((prod, idx) => (
                <AnimatedCard key={prod.id} delay={idx * 0.1}>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full flex flex-col hover:border-pastelPurple/60 transition-all duration-300">
                    <div className="h-48 overflow-hidden relative bg-gray-50">
                      {prod.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          onError={(e: any) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.background =
                              'linear-gradient(135deg, #FFD2E1, #E8DFFF)';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pastelPurple to-pastelPink flex items-center justify-center text-brandDark/40 font-mono text-xs">
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
                      <div>
                        <Link
                          href={`/products/${prod.slug}`}
                          className="text-base font-semibold text-brandDark hover:text-purple-600 transition-colors line-clamp-1 mb-2 block"
                        >
                          {prod.title}
                        </Link>
                        <p className="text-xs text-gray-500 font-light line-clamp-2 leading-relaxed mb-4">
                          {prod.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1.5">
                          {prod.tags?.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <Link
                            href={`/products/${prod.slug}`}
                            className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            Explore Details &rarr;
                          </Link>
                          {prod.github && (
                            <a
                              href={prod.github}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-gray-400 hover:text-brandDark transition-colors flex items-center gap-1"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                              </svg>
                              Code
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </section>

          {/* Mission / Value Props */}
          <section className="bg-gradient-to-r from-pastelPink/30 via-pastelPurple/30 to-purple-100/30 rounded-3xl p-8 md:p-12 border border-white/60">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-purple-700 bg-white/80 px-4 py-1.5 rounded-full shadow-sm">
                Empowering STEM
              </span>
              <h2 className="text-2xl md:text-3xl font-semibold text-brandDark">
                Building the Future of Mechanics &amp; Automation
              </h2>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                MechGirl is committed to bridging the gender gap in mechanical engineering, CAD modeling, and robotics. Through open-source libraries, structured workshops, and real-world projects, we give students and makers the tools to engineer their dreams.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link href="/about" className="btn-primary">
                  About Our Mission
                </Link>
                <Link href="/contact" className="btn-outline bg-white/60">
                  Get in Touch
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
