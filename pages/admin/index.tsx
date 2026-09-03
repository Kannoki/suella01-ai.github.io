import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import {
  Activity,
  Product,
  CarouselSlide,
  Registration,
  AboutProfile,
  ContactInfo,
} from '../../lib/dataService';

const TABS = [
  'Activities',
  'Products',
  'Registrations',
  'Carousel',
  'About Me',
  'Contact',
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Activities');

  // Activities State
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Registrations State
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  // Carousel State
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [newSlideSrc, setNewSlideSrc] = useState('');
  const [newSlideAlt, setNewSlideAlt] = useState('');

  // About State
  const [about, setAbout] = useState<AboutProfile | null>(null);
  const [aboutSaved, setAboutSaved] = useState(false);

  // Contact State
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [contactSaved, setContactSaved] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    fetchActivities();
    fetchProducts();
    fetchRegistrations();
    fetchCarousel();
    fetchAbout();
    fetchContact();
  }, []);

  const fetchActivities = () => {
    setLoadingActivities(true);
    fetch('/api/activities')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setActivities(d);
        setLoadingActivities(false);
      })
      .catch(() => setLoadingActivities(false));
  };

  const fetchProducts = () => {
    setLoadingProducts(true);
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setProducts(d);
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));
  };

  const fetchRegistrations = () => {
    setLoadingRegs(true);
    fetch('/api/registrations')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setRegistrations(d);
        setLoadingRegs(false);
      })
      .catch(() => setLoadingRegs(false));
  };

  const fetchCarousel = () => {
    fetch('/api/carousel')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setSlides(d);
      });
  };

  const fetchAbout = () => {
    fetch('/api/about')
      .then((r) => r.json())
      .then((d) => setAbout(d));
  };

  const fetchContact = () => {
    fetch('/api/contact')
      .then((r) => r.json())
      .then((d) => setContact(d));
  };

  // Activity Actions
  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    await fetch(`/api/activities/${id}`, { method: 'DELETE' });
    fetchActivities();
  };

  // Product Actions
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  // Registration Actions
  const handleDeleteReg = async (id: string) => {
    if (!confirm('Remove this attendee registration?')) return;
    await fetch(`/api/registrations?id=${id}`, { method: 'DELETE' });
    fetchRegistrations();
  };

  // Carousel Actions
  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideSrc) return;
    await fetch('/api/carousel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ src: newSlideSrc, alt: newSlideAlt }),
    });
    setNewSlideSrc('');
    setNewSlideAlt('');
    fetchCarousel();
  };

  const handleDeleteSlide = async (id: string) => {
    await fetch(`/api/carousel/${id}`, { method: 'DELETE' });
    fetchCarousel();
  };

  // About Save
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!about) return;
    await fetch('/api/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(about),
    });
    setAboutSaved(true);
    setTimeout(() => setAboutSaved(false), 3000);
  };

  // Contact Save
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;
    await fetch('/api/contact', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    setContactSaved(true);
    setTimeout(() => setContactSaved(false), 3000);
  };

  return (
    <Layout
      title="Admin Dashboard - MechGirl Management"
      description="Manage activities, projects, registrations, carousel slides, about profile, and contact details."
    >
      <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold tracking-widest text-purple-700 uppercase bg-pastelPurple/40 px-3 py-1 rounded-full border border-purple-200/40">
              System Administration
            </span>
            <h1 className="text-3xl font-bold text-brandDark mt-2">Content &amp; Community Manager</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold px-4 py-2 rounded-full border border-gray-200 hover:bg-white transition-colors"
            >
              &larr; View Live Site
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-brandDark text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Activities */}
        {activeTab === 'Activities' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-brandDark">
                All Activities ({activities.length})
              </h2>
              <Link
                href="/admin/activities/new"
                className="btn-primary text-xs py-2 px-5 shadow-sm"
              >
                + New Activity
              </Link>
            </div>

            {loadingActivities ? (
              <p className="text-xs text-gray-400">Loading activities...</p>
            ) : activities.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border text-center text-xs text-gray-400">
                No activities yet. Create your first one above!
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-pastelPurple/50 transition-colors shadow-soft"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="badge bg-purple-100 text-purple-700">{act.type}</span>
                        <span className="text-xs text-gray-400 font-mono">/{act.slug}</span>
                      </div>
                      <h3 className="text-base font-semibold text-brandDark truncate">{act.title}</h3>
                      <p className="text-xs text-gray-500 font-light">
                        {act.date} &middot; {act.registered}/{act.seats} seats &middot; Status: {act.status}
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
        )}

        {/* Tab 2: Products */}
        {activeTab === 'Products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-brandDark">
                All Projects ({products.length})
              </h2>
              <Link
                href="/admin/products/new"
                className="btn-primary text-xs py-2 px-5 shadow-sm"
              >
                + New Project
              </Link>
            </div>

            {loadingProducts ? (
              <p className="text-xs text-gray-400">Loading projects...</p>
            ) : products.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border text-center text-xs text-gray-400">
                No projects yet. Create your first one above!
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-pastelPurple/50 transition-colors shadow-soft"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="badge bg-blue-100 text-blue-700">{prod.category}</span>
                        {prod.featured && <span className="badge bg-amber-100 text-amber-700">Featured</span>}
                        <span className="text-xs text-gray-400 font-mono">/{prod.slug}</span>
                      </div>
                      <h3 className="text-base font-semibold text-brandDark truncate">{prod.title}</h3>
                      <p className="text-xs text-gray-500 font-light line-clamp-1">{prod.description}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/admin/products/${prod.slug}`}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
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
        )}

        {/* Tab 3: Registrations */}
        {activeTab === 'Registrations' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-brandDark">
              Activity Registrations ({registrations.length})
            </h2>

            {loadingRegs ? (
              <p className="text-xs text-gray-400">Loading registrations...</p>
            ) : registrations.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border text-center text-xs text-gray-400">
                No attendee registrations recorded yet.
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-soft">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium uppercase">
                      <tr>
                        <th className="py-3.5 px-4">Attendee</th>
                        <th className="py-3.5 px-4">Email</th>
                        <th className="py-3.5 px-4">Phone</th>
                        <th className="py-3.5 px-4">Activity</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-gray-50/60">
                          <td className="py-3.5 px-4 font-medium text-brandDark">{reg.name}</td>
                          <td className="py-3.5 px-4 text-gray-600">{reg.email}</td>
                          <td className="py-3.5 px-4 text-gray-600">{reg.phone}</td>
                          <td className="py-3.5 px-4 text-purple-700 font-medium">
                            {reg.activityTitle || reg.activityId}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteReg(reg.id)}
                              className="text-red-500 hover:text-red-700 font-medium"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Carousel */}
        {activeTab === 'Carousel' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-brandDark">
              Hero Carousel Slides ({slides.length})
            </h2>

            {/* Add Slide Form */}
            <form onSubmit={handleAddSlide} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Add New Carousel Slide</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Image URL / Path</label>
                  <input
                    required
                    type="text"
                    placeholder="/asset/carousel/filename.jpg or https://..."
                    value={newSlideSrc}
                    onChange={(e) => setNewSlideSrc(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Alt Text</label>
                  <input
                    type="text"
                    placeholder="Describe the image"
                    value={newSlideAlt}
                    onChange={(e) => setNewSlideAlt(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary text-xs py-2 px-6">
                Add Slide
              </button>
            </form>

            {/* Slides List */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {slides.map((s, idx) => (
                <div key={s.id || idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-soft flex flex-col">
                  <div className="h-32 bg-gray-100 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.src} alt={s.alt || ''} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2 text-xs">
                    <span className="text-gray-500 truncate">{s.alt || `Slide #${idx + 1}`}</span>
                    <button
                      onClick={() => handleDeleteSlide(s.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: About Me */}
        {activeTab === 'About Me' && about && (
          <form onSubmit={handleSaveAbout} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-brandDark">Profile &amp; Biography</h2>
              <button type="submit" className="btn-primary text-xs py-2 px-6">
                {aboutSaved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>

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
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Photo URL
              </label>
              <input
                type="text"
                value={about.photoUrl || ''}
                onChange={(e) => setAbout({ ...about, photoUrl: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Biography
              </label>
              <textarea
                rows={5}
                value={about.bio}
                onChange={(e) => setAbout({ ...about, bio: e.target.value })}
                className="input-field resize-none"
              />
            </div>
          </form>
        )}

        {/* Tab 6: Contact Info */}
        {activeTab === 'Contact' && contact && (
          <form onSubmit={handleSaveContact} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-brandDark">Contact Details &amp; Social Links</h2>
              <button type="submit" className="btn-primary text-xs py-2 px-6">
                {contactSaved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Phone
                </label>
                <input
                  type="text"
                  value={contact.phone || ''}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Address
              </label>
              <input
                type="text"
                value={contact.address || ''}
                onChange={(e) => setContact({ ...contact, address: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  GitHub URL
                </label>
                <input
                  type="text"
                  value={contact.socials?.github || ''}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      socials: { ...contact.socials, github: e.target.value },
                    })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  YouTube URL
                </label>
                <input
                  type="text"
                  value={contact.socials?.youtube || ''}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      socials: { ...contact.socials, youtube: e.target.value },
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
