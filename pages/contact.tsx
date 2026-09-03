import React, { useState } from 'react';
import type { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { AnimatedSection } from '../components/AnimatedSection';
import { getContactInfo, ContactInfo } from '../lib/dataService';

export const getStaticProps: GetStaticProps = async () => {
  try {
    const contact = await getContactInfo();
    return {
      props: { contact },
      revalidate: 10,
    };
  } catch {
    return {
      props: {
        contact: {
          name: 'MechGirl',
          tagline: 'Dream it, Scheme it, STEM it!',
          email: 'contact@mechgirl.com',
          phone: '+1 (555) 123-4567',
          address: '123 Engineering Way, Innovation District, CA 94043',
          socials: {
            facebook: 'https://facebook.com/mechgirl',
            youtube: 'https://youtube.com/@mechgirl',
            github: 'https://github.com/mechgirl',
            instagram: 'https://instagram.com/mechgirl_official',
          },
        },
      },
      revalidate: 10,
    };
  }
};

const socialIcons = {
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  ),
  github: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
    </svg>
  ),
};

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  href?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-pastelPurple/30 flex items-center justify-center text-purple-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brandDark hover:text-purple-600 transition-colors font-medium"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-brandDark font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}

interface ContactProps {
  contact: ContactInfo;
}

export default function Contact({ contact }: ContactProps) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setSending(false);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    } catch {
      setError('Could not send message right now. Please try again.');
      setSending(false);
    }
  };

  return (
    <Layout
      title="Contact Us - MechGirl STEM"
      description="Connect with MechGirl for workshops, collaborative robotics projects, speaking engagements, and STEM inquiries."
    >
      <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto space-y-12">
        <AnimatedSection>
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-semibold tracking-widest text-purple-700 uppercase bg-pastelPurple/40 px-4 py-1.5 rounded-full border border-purple-200/40">
              Get in Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-light text-brandDark tracking-tight">
              Connect with Our Team
            </h1>
            <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed">
              Have questions about an upcoming workshop, robotics partnership, or CAD library? Send us a message or reach out via our community channels.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Details Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-soft space-y-4">
              <h2 className="text-lg font-semibold text-brandDark">Contact Information</h2>

              <div className="divide-y divide-gray-100">
                <InfoRow
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  }
                  label="Email"
                  value={contact.email}
                  href={`mailto:${contact.email}`}
                />

                <InfoRow
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  }
                  label="Phone"
                  value={contact.phone}
                />

                <InfoRow
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  }
                  label="Location"
                  value={contact.address}
                />
              </div>

              {/* Socials */}
              {contact.socials && (
                <div className="pt-6 border-t border-gray-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    Follow &amp; Follow Along
                  </p>
                  <div className="flex gap-3">
                    {Object.entries(contact.socials).map(([platform, url]) => {
                      if (!url) return null;
                      const icon = (socialIcons as any)[platform];
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          aria-label={platform}
                        >
                          {icon || platform[0].toUpperCase()}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* About Blurb */}
            {contact.about && (
              <div className="bg-gradient-to-br from-pastelPurple/20 to-pastelPink/20 rounded-3xl p-6 border border-white/80">
                <p className="text-xs text-gray-600 font-light leading-relaxed">
                  {contact.about}
                </p>
              </div>
            )}
          </div>

          {/* Interactive Inquiry Form */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-soft">
            <h2 className="text-lg font-semibold text-brandDark mb-6">Send Us a Direct Message</h2>

            {sent && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mb-6 bg-emerald-50 text-emerald-700 text-xs rounded-2xl border border-emerald-200"
              >
                Thank you! Your message has been sent successfully. We will get back to you shortly.
              </motion.div>
            )}

            {error && (
              <div className="p-4 mb-6 bg-red-50 text-red-600 text-xs rounded-2xl border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Workshop Question / Collaboration"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input-field resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary w-full py-3 disabled:opacity-50"
                >
                  {sending ? 'Sending Message...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
