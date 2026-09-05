import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { Activity } from '../../lib/dataService';
import { toDateInputValue, formatActivityDate } from '../../lib/dateUtils';
import { getAuthHeaders, compressImageFile } from '../../lib/clientAuth';
import { ActivityType, ActivityStatus } from '../../prisma/generated/enums';

interface ActivityFormProps {
  initialData?: Activity | null;
  isNew?: boolean;
}

const TYPE_OPTIONS: ActivityType[] = [
  ActivityType.WORKSHOP,
  ActivityType.CHALLENGE,
  ActivityType.MASTERCLASS,
  ActivityType.PANEL,
];

const STATUS_OPTIONS: ActivityStatus[] = [
  ActivityStatus.OPEN,
  ActivityStatus.FULL,
  ActivityStatus.CLOSED,
];

function parseInitialTime(timeStr?: string | null) {
  if (!timeStr) return { startTime: '', endTime: '', isAllDay: false, isCustom: false, customText: '' };
  const trimmed = timeStr.trim();
  if (trimmed.toLowerCase() === 'all day event') {
    return { startTime: '', endTime: '', isAllDay: true, isCustom: false, customText: '' };
  }
  const rangeMatch = trimmed.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
  if (rangeMatch) {
    const padTime = (t: string) => (t.length === 4 ? `0${t}` : t);
    return { startTime: padTime(rangeMatch[1]), endTime: padTime(rangeMatch[2]), isAllDay: false, isCustom: false, customText: '' };
  }
  const singleMatch = trimmed.match(/^(\d{1,2}:\d{2})$/);
  if (singleMatch) {
    const padTime = (t: string) => (t.length === 4 ? `0${t}` : t);
    return { startTime: padTime(singleMatch[1]), endTime: '', isAllDay: false, isCustom: false, customText: '' };
  }
  return { startTime: '', endTime: '', isAllDay: false, isCustom: true, customText: trimmed };
}

export default function ActivityForm({ initialData, isNew = false }: ActivityFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const initialTimeState = parseInitialTime(initialData?.time);
  const [startTime, setStartTime] = useState(initialTimeState.startTime);
  const [endTime, setEndTime] = useState(initialTimeState.endTime);
  const [isAllDay, setIsAllDay] = useState(initialTimeState.isAllDay);
  const [isCustomTime, setIsCustomTime] = useState(initialTimeState.isCustom);
  const [customTimeText, setCustomTimeText] = useState(initialTimeState.customText);

  const [form, setForm] = useState({
    title: initialData?.title || '',
    type: initialData?.type || ActivityType.WORKSHOP,
    date: toDateInputValue(initialData?.date),
    time: initialData?.time || '',
    location: initialData?.location || '',
    seats: initialData?.seats ?? 30,
    status: initialData?.status || ActivityStatus.OPEN,
    featured: Boolean(initialData?.featured),
    image: initialData?.image || '',
    description: initialData?.description || '',
    content: initialData?.content || '',
  });

  // Re-sync if initialData changes (e.g. async fetch in slug page)
  useEffect(() => {
    if (initialData) {
      const parsedTime = parseInitialTime(initialData.time);
      setStartTime(parsedTime.startTime);
      setEndTime(parsedTime.endTime);
      setIsAllDay(parsedTime.isAllDay);
      setIsCustomTime(parsedTime.isCustom);
      setCustomTimeText(parsedTime.customText);

      setForm({
        title: initialData.title || '',
        type: initialData.type || ActivityType.WORKSHOP,
        date: toDateInputValue(initialData.date),
        time: initialData.time || '',
        location: initialData.location || '',
        seats: initialData.seats ?? 30,
        status: initialData.status || ActivityStatus.OPEN,
        featured: Boolean(initialData.featured),
        image: initialData.image || '',
        description: initialData.description || '',
        content: initialData.content || '',
      });
    }
  }, [initialData]);

  // Synchronize time inputs to form.time
  const updateTimeSlot = (
    newStart = startTime,
    newEnd = endTime,
    allDay = isAllDay,
    custom = isCustomTime,
    customTxt = customTimeText
  ) => {
    if (custom) {
      setForm((prev) => ({ ...prev, time: customTxt }));
    } else if (allDay) {
      setForm((prev) => ({ ...prev, time: 'All Day Event' }));
    } else if (newStart && newEnd) {
      setForm((prev) => ({ ...prev, time: `${newStart} - ${newEnd}` }));
    } else if (newStart) {
      setForm((prev) => ({ ...prev, time: newStart }));
    } else {
      setForm((prev) => ({ ...prev, time: '' }));
    }
  };

  const handleStartTimeChange = (val: string) => {
    setStartTime(val);
    updateTimeSlot(val, endTime, false, false, customTimeText);
  };

  const handleEndTimeChange = (val: string) => {
    setEndTime(val);
    updateTimeSlot(startTime, val, false, false, customTimeText);
  };

  const handleAllDayToggle = (checked: boolean) => {
    setIsAllDay(checked);
    if (checked) {
      setIsCustomTime(false);
    }
    updateTimeSlot(startTime, endTime, checked, false, customTimeText);
  };

  const handleCustomTimeToggle = (custom: boolean) => {
    setIsCustomTime(custom);
    if (custom) {
      setIsAllDay(false);
    }
    updateTimeSlot(startTime, endTime, false, custom, customTimeText);
  };

  const handleCustomTimeChange = (txt: string) => {
    setCustomTimeText(txt);
    updateTimeSlot(startTime, endTime, false, true, txt);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImageFile(file, 1200, 800, 0.75);
      setForm((prev) => ({ ...prev, image: base64 }));
    } catch {
      alert('Failed to process image file');
    }
  };

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
          <p className="text-xs text-gray-400 mt-1">Configure event scheduling, capacity, and workshop content</p>
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

      {/* Title and Type */}
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
            onChange={(e) => setForm({ ...form, type: e.target.value as ActivityType })}
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

      {/* Date and Time Pickers */}
      <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200/60 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brandDark flex items-center gap-1.5">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Event Date &amp; Schedule
          </span>
          {form.time && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Slot: {form.time}
            </span>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {/* HTML5 Date Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input-field bg-white"
            />
            {form.date ? (
              <p className="text-[11px] text-purple-600 font-medium mt-1">
                Formatted: {formatActivityDate(form.date)}
              </p>
            ) : (
              <p className="text-[11px] text-gray-400 mt-1">Select the event date</p>
            )}
          </div>

          {/* HTML5 Time Inputs */}
          <div className="sm:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Time Schedule
              </label>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 text-gray-600 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => handleAllDayToggle(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                  />
                  All Day Event
                </label>
                <button
                  type="button"
                  onClick={() => handleCustomTimeToggle(!isCustomTime)}
                  className="text-purple-600 hover:text-purple-800 underline text-[11px]"
                >
                  {isCustomTime ? 'Use clock pickers' : 'Custom text'}
                </button>
              </div>
            </div>

            {isCustomTime ? (
              <div>
                <input
                  type="text"
                  placeholder="e.g. 19:00 - 20:30 or Flexible Schedule"
                  value={customTimeText}
                  onChange={(e) => handleCustomTimeChange(e.target.value)}
                  className="input-field bg-white"
                />
                <p className="text-[10px] text-gray-400 mt-1">Custom time slot string</p>
              </div>
            ) : isAllDay ? (
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100 text-xs font-medium text-purple-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Scheduled as an All Day Event
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">Start Time</span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="input-field bg-white"
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">End Time</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className="input-field bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seats, Location, and Status */}
      <div className="grid sm:grid-cols-3 gap-5">
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
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as ActivityStatus })}
            className="input-field"
          >
            <option value={ActivityStatus.OPEN}>Open (Accepting Registrations)</option>
            <option value={ActivityStatus.FULL}>Full (Capacity Reached)</option>
            <option value={ActivityStatus.CLOSED}>Closed</option>
          </select>
        </div>
      </div>

      {/* Banner Image URL or Upload */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Banner Image (URL or Upload)
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-200/60">
          {form.image ? (
            <div className="w-24 h-16 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-24 h-16 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
              No Image
            </div>
          )}

          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-full bg-brandDark text-white hover:bg-opacity-90 transition-colors shadow-sm inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
              {form.image && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                  className="text-xs text-red-500 hover:text-red-700 underline"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Or paste image URL (https://images.unsplash.com/...)"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="input-field text-xs bg-white"
            />
          </div>
        </div>
      </div>

      {/* Featured Checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="featured"
          checked={form.featured}
          onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
        />
        <label htmlFor="featured" className="text-xs font-medium text-brandDark cursor-pointer">
          Feature this activity prominently on the website
        </label>
      </div>

      {/* Short Summary */}
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

      {/* Full Content */}
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
