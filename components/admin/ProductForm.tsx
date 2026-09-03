import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Product } from '../../lib/dataService';

interface ProductFormProps {
  initialData?: Product | null;
  isNew?: boolean;
}

const CATEGORY_OPTIONS = ['Robotics', 'Knowledge', 'IoT', 'Mechatronics'];

export default function ProductForm({ initialData, isNew = false }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: initialData?.title || '',
    category: initialData?.category || 'Robotics',
    description: initialData?.description || '',
    content: initialData?.content || '',
    image: initialData?.image || '',
    github: initialData?.github || '',
    demo: initialData?.demo || '',
    tags: initialData?.tags ? initialData.tags.join(', ') : '',
    featured: initialData?.featured ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = isNew ? '/api/products' : `/api/products/${initialData?.id || initialData?.slug}`;
      const method = isNew ? 'POST' : 'PUT';

      const payload = {
        ...form,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Save failed');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetch(`/api/products/${initialData?.id || initialData?.slug}`, {
        method: 'DELETE',
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
            {isNew ? 'Create New Project' : `Edit Project: ${initialData?.title}`}
          </h2>
          <p className="text-xs text-gray-400 mt-1">Configure project details, links, and technical specs</p>
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
            {saving ? 'Saving...' : isNew ? 'Create Project' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl">{error}</div>}

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            placeholder="3-DOF Robotic Arm"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input-field"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            GitHub Repository URL
          </label>
          <input
            type="url"
            placeholder="https://github.com/mechgirl/..."
            value={form.github}
            onChange={(e) => setForm({ ...form, github: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Live Demo / Video URL
          </label>
          <input
            type="url"
            placeholder="https://youtube.com/..."
            value={form.demo}
            onChange={(e) => setForm({ ...form, demo: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
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

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Tags (comma separated)
          </label>
          <input
            type="text"
            placeholder="Arduino, Robotics, CAD"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="featured"
          checked={form.featured}
          onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
        />
        <label htmlFor="featured" className="text-xs font-medium text-brandDark">
          Feature this project on the homepage
        </label>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
          Summary Description <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          placeholder="Brief description of mechanism and key functions..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input-field resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
          Technical Details (HTML / Markdown)
        </label>
        <textarea
          rows={8}
          placeholder="<h3>System Architecture</h3><p>Components used, sensors, and kinematics...</p>"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="input-field resize-none font-mono text-xs"
        />
      </div>
    </form>
  );
}
