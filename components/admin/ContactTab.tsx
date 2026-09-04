import React, { useEffect, useState } from 'react';
import { ContactInfo } from '../../lib/dataService';
import { getAuthHeaders } from '../../lib/clientAuth';

export default function ContactTab() {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [contactSaved, setContactSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contactJsonMode, setContactJsonMode] = useState(false);
  const [contactRawJson, setContactRawJson] = useState('');
  const [contactJsonError, setContactJsonError] = useState('');

  const fetchContact = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact');
      if (res.ok) {
        const data = await res.json();
        setContact(data);
        setContactRawJson(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error('Failed to fetch contact details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;
    setSaving(true);
    setContactJsonError('');

    try {
      let payload = contact;
      if (contactJsonMode) {
        try {
          payload = JSON.parse(contactRawJson);
          setContact(payload);
        } catch (err: any) {
          setContactJsonError('Invalid JSON format: ' + err.message);
          setSaving(false);
          return;
        }
      }

      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        setContact(saved);
        setContactRawJson(JSON.stringify(saved, null, 2));
        setContactSaved(true);
        setTimeout(() => setContactSaved(false), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setContactJsonError(err.error || 'Failed to save contact info.');
      }
    } catch {
      setContactJsonError('Network error occurred while saving contact info.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !contact) {
    return (
      <div className="bg-white p-12 rounded-3xl border text-center text-xs text-gray-400">
        Loading contact details...
      </div>
    );
  }

  if (!contact) return null;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSaveContact} className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-brandDark">Contact &amp; Organization Details</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                JSON Persisted
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Directly editable in form or raw JSON. Persisted directly to <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">contact.json</code>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!contactJsonMode) {
                  setContactRawJson(JSON.stringify(contact, null, 2));
                } else {
                  try {
                    const parsed = JSON.parse(contactRawJson);
                    setContact(parsed);
                    setContactJsonError('');
                  } catch (e: any) {
                    setContactJsonError('Syntax error in JSON: ' + e.message);
                    return;
                  }
                }
                setContactJsonMode(!contactJsonMode);
              }}
              className="text-xs font-semibold px-3.5 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {contactJsonMode ? 'Form View' : 'Raw JSON View'}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs py-2 px-6 shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : contactSaved ? 'Saved!' : 'Save Contact'}
            </button>
          </div>
        </div>

        {contactJsonError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
            <span>{contactJsonError}</span>
            <button
              type="button"
              onClick={() => setContactJsonError('')}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {contactJsonMode ? (
          /* Raw JSON Editor */
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Raw JSON Editor (<code className="text-purple-600">contact.json</code>)
              </label>
              <span className="text-[11px] text-gray-400">Valid JSON required</span>
            </div>
            <textarea
              rows={18}
              value={contactRawJson}
              onChange={(e) => {
                setContactRawJson(e.target.value);
                setContactJsonError('');
              }}
              className="w-full p-4 font-mono text-xs bg-gray-900 text-emerald-400 rounded-2xl border border-gray-800 focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
              spellCheck={false}
            />
          </div>
        ) : (
          /* Form View */
          <div className="grid md:grid-cols-2 gap-6">
            {/* General Info Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft space-y-4">
              <h3 className="text-sm font-semibold text-brandDark pb-2 border-b border-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                General Contact Information
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Platform / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Tagline / Motto *
                </label>
                <input
                  type="text"
                  required
                  value={contact.tagline}
                  onChange={(e) => setContact({ ...contact, tagline: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={contact.phone || ''}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Physical / Mailing Address
                </label>
                <input
                  type="text"
                  value={contact.address || ''}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
            </div>

            {/* Mission & Social Links Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft space-y-4">
              <h3 className="text-sm font-semibold text-brandDark pb-2 border-b border-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                Mission Statement &amp; Social Links
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  About Platform / Mission Description
                </label>
                <textarea
                  rows={4}
                  value={contact.about || ''}
                  onChange={(e) => setContact({ ...contact, about: e.target.value })}
                  className="input-field text-xs"
                  placeholder="Tell visitors about the mission, engineering resources, and workshops..."
                />
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Social Media Links
                </h4>

                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/mechgirl"
                    value={contact.socials?.github || ''}
                    onChange={(e) =>
                      setContact({
                        ...contact,
                        socials: { ...contact.socials, github: e.target.value },
                      })
                    }
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">YouTube URL</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@mechgirl"
                    value={contact.socials?.youtube || ''}
                    onChange={(e) =>
                      setContact({
                        ...contact,
                        socials: { ...contact.socials, youtube: e.target.value },
                      })
                    }
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Facebook URL</label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/mechgirl"
                    value={contact.socials?.facebook || ''}
                    onChange={(e) =>
                      setContact({
                        ...contact,
                        socials: { ...contact.socials, facebook: e.target.value },
                      })
                    }
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Instagram URL</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/mechgirl_official"
                    value={contact.socials?.instagram || ''}
                    onChange={(e) =>
                      setContact({
                        ...contact,
                        socials: { ...contact.socials, instagram: e.target.value },
                      })
                    }
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/company/mechgirl"
                    value={contact.socials?.linkedin || ''}
                    onChange={(e) =>
                      setContact({
                        ...contact,
                        socials: { ...contact.socials, linkedin: e.target.value },
                      })
                    }
                    className="input-field text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
