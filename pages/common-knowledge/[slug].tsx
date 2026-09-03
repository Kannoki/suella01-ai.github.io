import React, { useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { AnimatedSection } from '../../components/AnimatedSection';
import { getActivityBySlug, Activity } from '../../lib/dataService';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.slug as string;
  const activity = await getActivityBySlug(slug);

  if (!activity) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      activity,
    },
  };
};

interface ActivityDetailProps {
  activity: Activity;
}

function typeColor(type: string) {
  const map: Record<string, string> = {
    Workshop: 'bg-purple-100 text-purple-700',
    Challenge: 'bg-pink-100 text-pink-600',
    Masterclass: 'bg-emerald-100 text-emerald-700',
    Panel: 'bg-blue-100 text-blue-700',
  };
  return map[type] || 'bg-gray-100 text-gray-700';
}

function RegistrationForm({
  activity,
  onClose,
  onRegistered,
}: {
  activity: Activity;
  onClose: () => void;
  onRegistered: () => void;
}) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/activities/${activity.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }

      setSubmitting(false);
      setSuccess(true);
      onRegistered();
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M6 14l5 5L22 8" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h4 className="text-lg font-semibold text-brandDark mb-2">You&apos;re Registered!</h4>
        <p className="text-sm text-gray-500">
          We have saved your spot. Confirmation details will be sent to your email.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          required
          type="text"
          className="input-field"
          placeholder="Jane Doe"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          required
          type="email"
          className="input-field"
          placeholder="jane@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          required
          type="tel"
          className="input-field"
          placeholder="+1 (555) 000-0000"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
          Address / Affiliation
        </label>
        <input
          type="text"
          className="input-field"
          placeholder="University or City"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </div>
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary py-3 text-center disabled:opacity-50"
        >
          {submitting ? 'Registering...' : 'Confirm Registration'}
        </button>
      </div>
    </form>
  );
}

export default function ActivityDetail({ activity: initialActivity }: ActivityDetailProps) {
  const [activity, setActivity] = useState<Activity>(initialActivity);
  const [modalOpen, setModalOpen] = useState(false);

  const isFull = activity.seats > 0 && activity.registered >= activity.seats;

  const handleRegistered = () => {
    setActivity((prev) => ({
      ...prev,
      registered: prev.registered + 1,
      status: prev.registered + 1 >= prev.seats ? 'full' : 'open',
    }));
  };

  return (
    <Layout
      title={`${activity.title} - MechGirl`}
      description={activity.description}
    >
      <div className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Breadcrumb */}
          <Link
            href="/common-knowledge"
            className="inline-flex items-center gap-2 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
          >
            &larr; Back to All Activities
          </Link>

          {/* Hero Header */}
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-soft">
            {activity.image && (
              <div className="h-72 md:h-96 w-full relative overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="p-6 md:p-10 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge ${typeColor(activity.type)}`}>{activity.type}</span>
                {isFull ? (
                  <span className="badge bg-red-100 text-red-600">Event Full</span>
                ) : (
                  <span className="badge bg-emerald-100 text-emerald-700">Open for Registration</span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold text-brandDark leading-tight">
                {activity.title}
              </h1>

              <p className="text-base text-gray-600 font-light leading-relaxed">
                {activity.description}
              </p>

              {/* Event Meta Grid */}
              <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-sm">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Date &amp; Time
                  </span>
                  <p className="text-brandDark font-medium">{activity.date}</p>
                  {activity.time && <p className="text-xs text-gray-500 font-light">{activity.time}</p>}
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Location
                  </span>
                  <p className="text-brandDark font-medium">{activity.location || 'Online Event'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Capacity
                  </span>
                  <p className="text-brandDark font-medium">
                    {activity.seats > 0
                      ? `${activity.registered} / ${activity.seats} seats filled`
                      : 'Unlimited Seats'}
                  </p>
                </div>
              </div>

              {/* CTA Register */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="text-xs text-gray-500">
                  {isFull
                    ? 'This event has reached full capacity.'
                    : 'Spots are free for students and community members.'}
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  disabled={isFull}
                  className="btn-primary w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  {isFull ? 'Registration Full' : 'Register Now &rarr;'}
                </button>
              </div>
            </div>
          </div>

          {/* Rich Content Details */}
          {activity.content && (
            <AnimatedSection>
              <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-soft space-y-4">
                <h2 className="text-xl font-semibold text-brandDark pb-2 border-b border-gray-100">
                  Event Overview &amp; Details
                </h2>
                <div
                  className="prose-custom"
                  dangerouslySetInnerHTML={{ __html: activity.content }}
                />
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Register: ${activity.title}`}
      >
        <RegistrationForm
          activity={activity}
          onClose={() => setModalOpen(false)}
          onRegistered={handleRegistered}
        />
      </Modal>
    </Layout>
  );
}
