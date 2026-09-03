import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Activity } from '../../lib/dataService';
import { getAuthHeaders } from '../../lib/clientAuth';

interface ActivityFormProps {
  initialData?: Activity | null;
  isNew?: boolean;
}

const TYPE_OPTIONS = ['Workshop', 'Challenge', 'Masterclass', 'Panel'];

export default function ActivityForm({ initialData, isNew = false }: ActivityFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: initialData?.title || '',
    type: initialData?.type || 'Workshop',
    date: initialData?.date || '',
    time: initialData?.time || '',
    location: initialData?.location || '',
    seats: initialData?.seats || 30,
    image: initialData?.image || '',
    description: initialData?.description || '',
    content: initialData?.content || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = isNew ? '/api/activities' : `/api/activities/${initialData?.id || initialData?.slug}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Save failed');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to save activity');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      await fetch(`/api/activities/${initialData?.id || initialData?.slug}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      router.push('/admin');
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-brandDark">
            {isNew ? 'Create New Activity' : `Edit Activity: ${initialData?.title}`}
          </h2>
          <p className="text-xs text-gray-400 mt-1">Configure event metadata, capacity, and content</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="px-4 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Link>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-full bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100"
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs py-2 px-6 shadow-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : isNew ? 'Create Activity' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl">{error}</div>}

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Activity Title <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            placeholder="Introduction to Robot Kinematics"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Activity Type
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="input-field"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            placeholder="September 15, 2026"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Time Slot
          </label>
          <input
            type="text"
            placeholder="19:00 - 20:30"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Seats / Capacity
          </label>
          <input
            type="number"
            min="0"
            value={form.seats}
            onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Location
          </label>
          <input
            type="text"
            placeholder="Online via Zoom / Lab Room 302"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Banner Image URL
          </label>
          <input
            type="text"
            placeholder="https://images.unsplash.com/..."
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
          Short Summary / Teaser <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          placeholder="Brief description shown on cards..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input-field resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
          Full HTML / Markdown Content
        </label>
        <textarea
          rows={8}
          placeholder="<h2>About This Workshop</h2><p>Detailed overview...</p>"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="input-field resize-none font-mono text-xs"
        />
      </div>
    </form>
  );
}
