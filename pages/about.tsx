import React, { useState } from 'react';
import type { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { AnimatedSection, AnimatedStagger, StaggerItem } from '../components/AnimatedSection';
import { getAboutProfile, AboutProfile } from '../lib/dataService';

export const getStaticProps: GetStaticProps = async () => {
  try {
    const profile = await getAboutProfile();
    return {
      props: { profile },
      revalidate: 10,
    };
  } catch {
    return {
      props: {
        profile: {
          name: 'MINH NGOC',
          tagline: 'Mechanical Engineering Student',
          bio: 'A passionate mechanical engineering student exploring mechanics, robotics, and tech.',
          timeline: [],
        },
      },
      revalidate: 10,
    };
  }
};

function PhotoFrame({ src, name }: { src?: string | null; name: string }) {
  const [errored, setErrored] = useState(false);
  const showImage = src && !errored;
  const initials = (name || 'MN')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <div
      className="relative w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden ring-4 ring-white/80 shadow-[0_20px_60px_rgba(31,38,135,0.15)] mx-auto md:mx-0 flex-shrink-0"
      style={{
        background: 'linear-gradient(135deg, #FFD2E1 0%, #E8DFFF 50%, #C9B8FF 100%)',
      }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={name || 'Profile'}
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-5xl md:text-6xl font-light text-white/90 tracking-wide">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}

function DropWordName({ text }: { text: string }) {
  const words = (text || 'MINH NGOC').split(' ').filter(Boolean);
  return (
    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-brandDark mt-4 mb-3 tracking-tight leading-tight flex flex-wrap justify-center md:justify-start gap-x-3 gap-y-1">
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-flex overflow-hidden pb-1">
          <motion.span
            initial={{ y: '110%', opacity: 0, rotateX: -45 }}
            animate={{ y: '0%', opacity: 1, rotateX: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2 + i * 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block will-change-transform"
            style={{ transformOrigin: '50% 100%' }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

interface AboutProps {
  profile: AboutProfile;
}

export default function About({ profile }: AboutProps) {
  const { name, tagline, bio, photoUrl, timeline = [] } = profile;

  return (
    <Layout
      title={`About ${name} - MechGirl`}
      description={`${name} - ${tagline}. ${bio.slice(0, 150)}`}
    >
      <div className="pt-28 pb-20 px-6 max-w-5xl mx-auto space-y-16">
        {/* Profile Card Header */}
        <AnimatedSection>
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-soft flex flex-col md:flex-row items-center gap-10">
            <PhotoFrame src={photoUrl} name={name} />

            <div className="flex-1 text-center md:text-left space-y-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-purple-700 bg-pastelPurple/40 px-4 py-1.5 rounded-full border border-purple-200/40">
                Engineer &amp; Creator
              </span>

              <DropWordName text={name} />

              <p className="text-lg font-light text-purple-600">
                {tagline}
              </p>

              <p className="text-sm text-gray-600 font-light leading-relaxed max-w-xl">
                {bio}
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Education & Experience Timeline */}
        <section className="space-y-8">
          <AnimatedSection>
            <div>
              <h2 className="section-title">Education &amp; Experience</h2>
              <p className="section-subtitle">Academic Journey &amp; Engineering Focus</p>
            </div>
          </AnimatedSection>

          {timeline.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No timeline items recorded yet.</div>
          ) : (
            <AnimatedStagger staggerDelay={0.1} className="relative pl-6 md:pl-8 border-l-2 border-pastelPurple space-y-8 ml-3 md:ml-4">
              {timeline.map((item) => (
                <StaggerItem key={item.id}>
                  <div className="relative group">
                    {/* Node Dot */}
                    <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-purple-500 group-hover:scale-125 transition-transform" />

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft hover:shadow-card hover:border-pastelPurple/50 transition-all duration-300">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                          {item.startYear} {item.endYear ? `– ${item.endYear}` : '– Present'}
                        </span>
                        <span className="text-xs text-gray-400 font-light">{item.institution}</span>
                      </div>

                      <h3 className="text-lg font-semibold text-brandDark mb-2">
                        {item.title}
                      </h3>

                      <p className="text-xs md:text-sm text-gray-500 font-light leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </AnimatedStagger>
          )}
        </section>
      </div>
    </Layout>
  );
}
