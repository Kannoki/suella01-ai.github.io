import React, { useEffect, useState } from 'react';
import type { AboutProfile, TimelineItem } from '../../lib/dataService';
import { getAuthHeaders, compressImageFile } from '../../lib/clientAuth';

export default function AboutTab() {
  const [about, setAbout] = useState<AboutProfile | null>(null);
  const [aboutSaved, setAboutSaved] = useState(false);
  const [aboutSaving, setAboutSaving] = useState(false);
  const [aboutError, setAboutError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [newTimeline, setNewTimeline] = useState({
    startYear: new Date().getFullYear(),
    endYear: '' as string | number,
    title: '',
    institution: '',
    description: '',
  });

  const fetchAbout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/about');
      if (res.ok) {
        const data = await res.json();
        setAbout(data);
      }
    } catch (err) {
      console.error('Failed to fetch about profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!about) return;
    setAboutSaving(true);
    setAboutError(null);
    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(about),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to save (Status ${res.status})`);
      }
      setAboutSaved(true);
      setTimeout(() => setAboutSaved(false), 3000);
      fetchAbout();
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setAboutError(err.message || 'Failed to save profile.');
    } finally {
      setAboutSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64Str = await compressImageFile(file, 1000, 1000, 0.82);
      setAbout((prev) => (prev ? { ...prev, image: base64Str, photoUrl: base64Str } : null));
    } catch (err) {
      console.error('Image compression failed, fallback:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64Str = reader.result;
          setAbout((prev) => (prev ? { ...prev, image: base64Str, photoUrl: base64Str } : null));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTimelineItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeline.title || !newTimeline.institution) return;
    const item: TimelineItem = {
      id: `tl-${Date.now()}`,
      startYear: Number(newTimeline.startYear) || new Date().getFullYear(),
      endYear: newTimeline.endYear ? Number(newTimeline.endYear) : null,
      title: newTimeline.title,
      institution: newTimeline.institution,
      description: newTimeline.description,
      order: (about?.timeline?.length || 0) + 1,
    };
    setAbout((prev) => (prev ? { ...prev, timeline: [...(prev.timeline || []), item] } : null));
    setNewTimeline({
      startYear: new Date().getFullYear(),
      endYear: '',
      title: '',
      institution: '',
      description: '',
    });
  };

  const handleDeleteTimelineItem = (id: string) => {
    setAbout((prev) => (prev ? { ...prev, timeline: (prev.timeline || []).filter((t) => t.id !== id) } : null));
  };

  if (loading && !about) {
    return (
      <div className="bg-white p-12 rounded-3xl border text-center text-xs text-gray-400">
        Loading profile information...
      </div>
    );
  }

  if (!about) return null;

  return (
    <div className="space-y-8">
      <form onSubmit={handleSaveAbout} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-6">
        {aboutError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{aboutError}</span>
            <button type="button" onClick={() => setAboutError(null)} className="text-red-500 hover:text-red-700 font-bold ml-2">×</button>
          </div>
        )}

        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-brandDark">Profile &amp; Biography</h2>
            <p className="text-xs text-gray-500">
              Stored in user profile (<code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">users.json</code>) with Base64 profile photo and timeline milestones.
            </p>
          </div>
          <button
            type="submit"
            disabled={aboutSaving}
            className="btn-primary text-xs py-2 px-6 disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {aboutSaving ? 'Saving...' : aboutSaved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Base64 Image Upload Section */}
        <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200/60 space-y-4">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Profile Photo (Base64 Stored)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-pastelPurple shadow-sm bg-white flex-shrink-0 flex items-center justify-center">
              {about.image || about.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={about.image || about.photoUrl || ''}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400 font-medium">No Image</span>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer text-xs font-semibold px-4 py-2 rounded-full bg-brandDark text-white hover:bg-opacity-90 transition-colors shadow-sm inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Image (Base64)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {(about.image || about.photoUrl) && (
                  <button
                    type="button"
                    onClick={() => setAbout({ ...about, image: null, photoUrl: null })}
                    className="text-xs text-red-600 hover:text-red-700 px-3 py-1.5 rounded-full border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                Selecting an image file will automatically downscale and compress it as Base64 and persist it directly to <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">users.json</code>.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-gray-500 mb-1">
              Or paste Image URL / Raw Base64 string:
            </label>
            <input
              type="text"
              placeholder="data:image/png;base64,... or https://..."
              value={about.image || about.photoUrl || ''}
              onChange={(e) => setAbout({ ...about, image: e.target.value, photoUrl: e.target.value })}
              className="input-field text-xs font-mono"
            />
          </div>
        </div>

        {/* Name and Tagline */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              value={about.name}
              onChange={(e) => setAbout({ ...about, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={about.tagline}
              onChange={(e) => setAbout({ ...about, tagline: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Biography */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Biography
          </label>
          <textarea
            rows={4}
            value={about.bio}
            onChange={(e) => setAbout({ ...about, bio: e.target.value })}
            className="input-field"
            required
          />
        </div>
      </form>

      {/* Timeline Section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-6">
        <h3 className="text-base font-semibold text-brandDark pb-3 border-b border-gray-100">
          Education &amp; Experience Timeline ({about.timeline?.length || 0})
        </h3>

        {/* Add Timeline Item Form */}
        <form onSubmit={handleAddTimelineItem} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Add New Timeline Entry
          </h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Year *</label>
              <input
                required
                type="number"
                value={newTimeline.startYear}
                onChange={(e) => setNewTimeline({ ...newTimeline, startYear: Number(e.target.value) })}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Year (or blank if ongoing)</label>
              <input
                type="number"
                placeholder="2027"
                value={newTimeline.endYear}
                onChange={(e) => setNewTimeline({ ...newTimeline, endYear: e.target.value })}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Degree / Role Title *</label>
              <input
                required
                type="text"
                placeholder="e.g. B.Sc. Mechanical Engineering"
                value={newTimeline.title}
                onChange={(e) => setNewTimeline({ ...newTimeline, title: e.target.value })}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Institution / Company *</label>
              <input
                required
                type="text"
                placeholder="e.g. Stanford University"
                value={newTimeline.institution}
                onChange={(e) => setNewTimeline({ ...newTimeline, institution: e.target.value })}
                className="input-field text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description / Focus Areas</label>
            <input
              type="text"
              placeholder="e.g. Autonomous robotics, dynamic controls, mechanics"
              value={newTimeline.description}
              onChange={(e) => setNewTimeline({ ...newTimeline, description: e.target.value })}
              className="input-field text-xs"
            />
          </div>
          <button type="submit" className="btn-primary text-xs py-2 px-5">
            + Add to Timeline
          </button>
        </form>

        {/* Existing Timeline Items List */}
        <div className="space-y-3">
          {about.timeline && about.timeline.length > 0 ? (
            about.timeline.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-pastelPurple/40 transition-colors bg-white shadow-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-purple-700">
                      {item.startYear} &ndash; {item.endYear || 'Present'}
                    </span>
                    <span className="text-xs font-semibold text-brandDark">{item.title}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {item.institution} {item.description ? `&bull; ${item.description}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteTimelineItem(item.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium px-2.5 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">No timeline entries yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
