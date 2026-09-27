import React, { useState } from 'react';
import type { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { AnimatedSection, AnimatedStagger, StaggerItem } from '../components/AnimatedSection';
import { getAboutProfile, type AboutProfile, getUsers, type User } from '../lib/dataService';
import { Role } from '../prisma/generated/enums';

export const getStaticProps: GetStaticProps = async () => {
  try {
    const profile = await getAboutProfile();
    const allUsers = await getUsers();
    const contributors = allUsers.filter((u) => u.role === Role.ADMIN || u.role === Role.AUTHOR);
    return {
      props: {
        profile,
        contributors: contributors.length > 0 ? contributors : allUsers,
      },
      revalidate: 10,
    };
  } catch {
    return {
      props: {
        profile: {
          name: 'Minh Ngọc',
          tagline: 'Mechanical Engineering Student & STEM Advocate',
          bio: 'A passionate mechanical engineering student exploring mechanics, robotics, and tech.',
          timeline: [],
        },
        contributors: [],
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

function ContributorCard({ user }: { user: User }) {
  const [imageError, setImageError] = useState(false);
  const initials = (user.name || 'Admin')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  const roleBadgeColor =
    user.role === Role.ADMIN
      ? 'bg-purple-100 text-purple-700 border-purple-200/60'
      : user.role === Role.AUTHOR
      ? 'bg-pink-100 text-pink-700 border-pink-200/60'
      : 'bg-gray-100 text-gray-700 border-gray-200/60';

  const roleLabel =
    user.role === Role.ADMIN ? 'Administrator' : user.role === Role.AUTHOR ? 'Author & Contributor' : 'Contributor';

  const latestTimeline = user.timeline && user.timeline.length > 0 ? user.timeline[0] : null;

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1 hover:border-pastelPurple/50 transition-all duration-300 flex flex-col justify-between h-full group">
      <div className="space-y-4">
        {/* Avatar + Badge + Name */}
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-pastelPurple/40 bg-gradient-to-br from-pastelPink via-pastelPurple to-purple-200 flex-shrink-0 shadow-sm">
            {user.image && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-purple-700">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${roleBadgeColor}`}>
              {roleLabel}
            </span>
            <h3 className="text-lg font-semibold text-brandDark mt-1 truncate group-hover:text-purple-600 transition-colors">
              {user.name || 'Contributor'}
            </h3>
            {user.tagline && (
              <p className="text-xs text-purple-600 font-medium line-clamp-1">
                {user.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio ? (
          <p className="text-xs text-gray-500 font-light leading-relaxed line-clamp-3">
            {user.bio}
          </p>
        ) : (
          <p className="text-xs text-gray-400 font-light italic">
            Core team member contributing to the MechGirl STEM platform &amp; community.
          </p>
        )}

        {/* Education/Affiliation highlight */}
        {latestTimeline && (
          <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 text-[11px] space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider block">
              Focus / Education
            </span>
            <p className="font-medium text-brandDark truncate">{latestTimeline.title}</p>
            <p className="text-gray-500 font-light truncate">{latestTimeline.institution}</p>
          </div>
        )}
      </div>

      {/* Footer: Email */}
      {user.email && (
        <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <a
            href={`mailto:${user.email}`}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 transition-colors truncate"
          >
            <svg className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{user.email}</span>
          </a>
          <span className="text-[10px] text-gray-400 font-mono">Team</span>
        </div>
      )}
    </div>
  );
}

interface AboutProps {
  profile: AboutProfile;
  contributors: User[];
}

export default function About({ profile, contributors = [] }: AboutProps) {
  const { name, tagline, bio, image, photoUrl, timeline = [] } = profile;

  return (
    <Layout
      title={`About ${name} - MechGirl`}
      description={`${name} - ${tagline}. ${bio.slice(0, 150)}`}
    >
      <div className="pt-28 pb-20 px-6 max-w-5xl mx-auto space-y-16">
        {/* Profile Card Header */}
        <AnimatedSection>
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-soft flex flex-col md:flex-row items-center gap-10">
            <PhotoFrame src={image || photoUrl} name={name} />

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

        {/* Contributors / Team Section */}
        <section className="space-y-8 pt-8 border-t border-gray-100">
          <AnimatedSection>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-purple-700 bg-pastelPurple/40 px-3.5 py-1 rounded-full border border-purple-200/40 inline-block mb-3">
                  Leadership &amp; Community
                </span>
                <h2 className="section-title">Contributors</h2>
                <p className="section-subtitle">The administrators, engineers, and mentors behind MechGirl</p>
              </div>
              <div className="text-xs text-gray-400 font-light">
                {contributors.length} {contributors.length === 1 ? 'contributor' : 'contributors'}
              </div>
            </div>
          </AnimatedSection>

          {contributors.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 text-gray-400 text-sm">
              No contributors listed yet.
            </div>
          ) : (
            <AnimatedStagger staggerDelay={0.08} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {contributors.map((user) => (
                <StaggerItem key={user.id}>
                  <ContributorCard user={user} />
                </StaggerItem>
              ))}
            </AnimatedStagger>
          )}
        </section>
      </div>
    </Layout>
  );
}
