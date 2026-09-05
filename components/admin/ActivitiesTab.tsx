import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Activity } from '../../lib/dataService';
import { formatActivityDate } from '../../lib/dateUtils';
import { getAuthHeaders } from '../../lib/clientAuth';
import { ActivityType, ActivityStatus } from '../../prisma/generated/enums';

const TYPE_FILTERS: (ActivityType | 'All')[] = [
  'All',
  ActivityType.WORKSHOP,
  ActivityType.CHALLENGE,
  ActivityType.MASTERCLASS,
  ActivityType.PANEL,
];

export default function ActivitiesTab() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<ActivityType | 'All'>('All');

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/activities');
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchActivities();
      } else {
        alert('Failed to delete activity');
      }
    } catch (err) {
      console.error('Error deleting activity:', err);
    }
  };

  const filtered = activities.filter((act) => {
    const matchType = selectedType === 'All' || act.type === selectedType;
    const matchSearch =
      !search ||
      act.title.toLowerCase().includes(search.toLowerCase()) ||
      act.description.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-brandDark">
            All Activities &amp; Workshops ({activities.length})
          </h2>
          <p className="text-xs text-gray-500">Manage STEM workshops, hackathons, challenges, and panels.</p>
        </div>
        <Link
          href="/admin/activities/new"
          className="btn-primary text-xs py-2 px-5 shadow-sm inline-flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Activity
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedType === t
                  ? 'bg-brandDark text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field text-xs max-w-xs py-1.5"
        />
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border text-center text-xs text-gray-400">
          Loading activities...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border text-center text-xs text-gray-400">
          No activities found matching your criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-pastelPurple/50 transition-colors shadow-soft"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="badge bg-purple-100 text-purple-700">{act.type}</span>
                  <span className="text-xs text-gray-400 font-mono">/{act.slug}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    act.status === ActivityStatus.OPEN ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {act.status}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-brandDark truncate">{act.title}</h3>
                <p className="text-xs text-gray-500 font-light">
                  {formatActivityDate(act.date)} {act.time ? `• ${act.time}` : ''} • {act.registered}/{act.seats} seats reserved
                  {act.location ? ` • Location: ${act.location}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/admin/activities/${act.slug}`}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteActivity(act.id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
