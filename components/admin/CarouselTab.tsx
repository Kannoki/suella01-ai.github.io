import React, { useEffect, useState } from 'react';
import { CarouselSlide } from '../../lib/dataService';
import { getAuthHeaders } from '../../lib/clientAuth';

export default function CarouselTab() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSlideSrc, setNewSlideSrc] = useState('');
  const [newSlideAlt, setNewSlideAlt] = useState('');
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCarousel = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/carousel');
      if (res.ok) {
        const data = await res.json();
        setSlides(data);
      }
    } catch (err) {
      console.error('Failed to fetch carousel slides:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousel();
  }, []);

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideSrc) return;
    setSaving(true);
    try {
      const res = await fetch('/api/carousel', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          src: newSlideSrc,
          alt: newSlideAlt,
          title: newSlideTitle,
          subtitle: newSlideSubtitle,
          order: slides.length + 1,
        }),
      });
      if (res.ok) {
        setNewSlideSrc('');
        setNewSlideAlt('');
        setNewSlideTitle('');
        setNewSlideSubtitle('');
        fetchCarousel();
      } else {
        alert('Failed to add carousel slide');
      }
    } catch (err) {
      console.error('Error adding slide:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm('Delete this carousel slide?')) return;
    try {
      const res = await fetch(`/api/carousel/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchCarousel();
      } else {
        alert('Failed to delete slide');
      }
    } catch (err) {
      console.error('Error deleting slide:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-brandDark">
          Hero Carousel Slides ({slides.length})
        </h2>
        <p className="text-xs text-gray-500">Manage high-resolution images shown in the rotating homepage banner.</p>
      </div>

      {/* Add Slide Form */}
      <form onSubmit={handleAddSlide} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700">Add New Carousel Slide</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Image URL / Local Asset Path *</label>
            <input
              required
              type="text"
              placeholder="/asset/carousel/filename.jpg or https://..."
              value={newSlideSrc}
              onChange={(e) => setNewSlideSrc(e.target.value)}
              className="input-field text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Alt Description *</label>
            <input
              required
              type="text"
              placeholder="e.g. Mechanical workshop CAD model"
              value={newSlideAlt}
              onChange={(e) => setNewSlideAlt(e.target.value)}
              className="input-field text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Overlay Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Robotics & Automation"
              value={newSlideTitle}
              onChange={(e) => setNewSlideTitle(e.target.value)}
              className="input-field text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Overlay Subtitle (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Inspiring the next generation in STEM"
              value={newSlideSubtitle}
              onChange={(e) => setNewSlideSubtitle(e.target.value)}
              className="input-field text-xs"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary text-xs py-2 px-6 disabled:opacity-50"
        >
          {saving ? 'Adding...' : 'Add Slide'}
        </button>
      </form>

      {/* Slides List */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border text-center text-xs text-gray-400">
          Loading carousel slides...
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border text-center text-xs text-gray-400">
          No carousel slides configured yet. Add your first slide above.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {slides.map((s, idx) => (
            <div key={s.id || idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-soft flex flex-col group">
              <div className="h-36 bg-gray-100 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.src}
                  alt={s.alt || ''}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-brandDark/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                  #{idx + 1}
                </span>
              </div>
              <div className="p-3.5 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <p className="text-gray-800 font-medium truncate">{s.title || s.alt || `Slide #${idx + 1}`}</p>
                  {s.subtitle && <p className="text-gray-400 text-[11px] truncate">{s.subtitle}</p>}
                </div>
                <button
                  onClick={() => handleDeleteSlide(s.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
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
