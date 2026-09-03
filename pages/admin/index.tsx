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
  TimelineItem,
  User,
} from '../../lib/dataService';
import { useRouter } from 'next/router';
import { getAuthHeaders, getLoggedInUser, logoutUser } from '../../lib/clientAuth';

const TABS = [
  'Activities',
  'Products',
  'Registrations',
  'Carousel',
  'Users',
  'About Me',
  'Contact',
];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Activities');
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    router.push('/login');
  };

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
  const [newTimeline, setNewTimeline] = useState({
    startYear: new Date().getFullYear(),
    endYear: '' as string | number,
    title: '',
    institution: '',
    description: '',
  });

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<{
    name: string;
    email: string;
    role: string;
    tagline: string;
    bio: string;
    image: string;
    timeline: TimelineItem[];
  }>({
    name: '',
    email: '',
    role: 'user',
    tagline: '',
    bio: '',
    image: '',
    timeline: [],
  });
  const [userTimelineItem, setUserTimelineItem] = useState({
    startYear: new Date().getFullYear(),
    endYear: '' as string | number,
    title: '',
    institution: '',
    description: '',
  });

  // Contact State
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [contactSaved, setContactSaved] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    const u = getLoggedInUser();
    if (u) setCurrentUser(u);

    fetchActivities();
    fetchProducts();
    fetchRegistrations();
    fetchCarousel();
    fetchUsers();
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
    await fetch(`/api/activities/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    fetchActivities();
  };

  // Product Actions
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    fetchProducts();
  };

  // Registration Actions
  const handleDeleteReg = async (id: string) => {
    if (!confirm('Remove this attendee registration?')) return;
    await fetch(`/api/registrations?id=${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    fetchRegistrations();
  };

  // Carousel Actions
  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideSrc) return;
    await fetch('/api/carousel', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ src: newSlideSrc, alt: newSlideAlt }),
    });
    setNewSlideSrc('');
    setNewSlideAlt('');
    fetchCarousel();
  };

  const handleDeleteSlide = async (id: string) => {
    await fetch(`/api/carousel/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    fetchCarousel();
  };

  // About Save
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!about) return;
    await fetch('/api/about', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(about),
    });
    setAboutSaved(true);
    setTimeout(() => setAboutSaved(false), 3000);
  };

  // Image Upload to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64Str = reader.result;
        setAbout((prev) => (prev ? { ...prev, image: base64Str, photoUrl: base64Str } : null));
      }
    };
    reader.readAsDataURL(file);
  };

  // Timeline Items Operations
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

  // Contact Save
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;
    await fetch('/api/contact', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(contact),
    });
    setContactSaved(true);
    setTimeout(() => setContactSaved(false), 3000);
  };

  // User Management Handlers
  const fetchUsers = () => {
    setLoadingUsers(true);
    fetch('/api/users')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setUsers(d);
        setLoadingUsers(false);
      })
      .catch(() => setLoadingUsers(false));
  };

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      role: 'user',
      tagline: '',
      bio: '',
      image: '',
      timeline: [],
    });
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setUserForm({
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'user',
      tagline: u.tagline || '',
      bio: u.bio || '',
      image: u.image || '',
      timeline: u.timeline || [],
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name) return;

    if (editingUser) {
      await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userForm),
      });
    } else {
      await fetch('/api/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userForm),
      });
    }
    setUserModalOpen(false);
    fetchUsers();
    fetchAbout();
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    fetchUsers();
  };

  const handleUserImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setUserForm((prev) => ({ ...prev, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddUserTimelineItem = () => {
    if (!userTimelineItem.title || !userTimelineItem.institution) return;
    const item: TimelineItem = {
      id: `tl-${Date.now()}`,
      startYear: Number(userTimelineItem.startYear) || new Date().getFullYear(),
      endYear: userTimelineItem.endYear ? Number(userTimelineItem.endYear) : null,
      title: userTimelineItem.title,
      institution: userTimelineItem.institution,
      description: userTimelineItem.description,
      order: userForm.timeline.length + 1,
    };
    setUserForm((prev) => ({ ...prev, timeline: [...prev.timeline, item] }));
    setUserTimelineItem({
      startYear: new Date().getFullYear(),
      endYear: '',
      title: '',
      institution: '',
      description: '',
    });
  };

  const handleDeleteUserTimelineItem = (id: string) => {
    setUserForm((prev) => ({ ...prev, timeline: prev.timeline.filter((t) => t.id !== id) }));
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
              href="/docs"
              className="text-xs font-semibold px-4 py-2 rounded-full bg-pastelPurple/30 text-purple-800 border border-purple-200 hover:bg-pastelPurple/50 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              API Docs (Swagger)
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold px-4 py-2 rounded-full border border-gray-200 hover:bg-white transition-colors"
            >
              &larr; View Live Site
            </Link>
          </div>
        </div>

        {/* User Credentials Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pastelPurple shadow-sm bg-pastelPurple/20 flex-shrink-0 flex items-center justify-center">
              {currentUser?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentUser.image} alt={currentUser.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-semibold text-purple-700">
                  {(currentUser?.name || 'Admin').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-brandDark">
                  {currentUser?.name || 'MINH NGOC'}
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {currentUser?.role || 'admin'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                {currentUser?.email || 'admin@mechgirl.com'} &bull; <span className="text-emerald-600 font-medium">Active in localStorage</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-medium px-3.5 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="text-xs font-medium px-3.5 py-1.5 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
              >
                Sign In with Credentials
              </Link>
            )}
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

        {/* Tab: Users Management */}
        {activeTab === 'Users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-soft">
              <div>
                <h2 className="text-lg font-semibold text-brandDark">User &amp; Author Profiles</h2>
                <p className="text-xs text-gray-500">
                  Manage user accounts, author permissions, Base64 profile pictures, and career timelines.
                </p>
              </div>
              <button
                onClick={handleOpenCreateUser}
                className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New User
              </button>
            </div>

            {/* Users Grid */}
            {loadingUsers ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center space-y-2">
                <p className="text-sm font-medium text-gray-600">No users found</p>
                <p className="text-xs text-gray-400">Click &quot;Add New User&quot; to create your first user record.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {users.map((u) => {
                  const initials = (u.name || 'User')
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase())
                    .join('');

                  return (
                    <div
                      key={u.id}
                      className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 flex flex-col justify-between space-y-4 hover:border-pastelPurple/60 transition-all duration-300"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-pastelPurple shadow-sm bg-pastelPurple/20 flex-shrink-0 flex items-center justify-center">
                              {u.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={u.image}
                                  alt={u.name || 'Avatar'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-semibold text-purple-700">{initials}</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-brandDark">{u.name}</h3>
                                <span
                                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    u.role === 'admin'
                                      ? 'bg-purple-100 text-purple-800'
                                      : u.role === 'author'
                                      ? 'bg-pink-100 text-pink-800'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {u.role || 'user'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">{u.email || 'No email specified'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="text-xs text-purple-600 hover:text-purple-800 font-medium px-2.5 py-1 rounded-lg hover:bg-purple-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {u.tagline && (
                          <p className="text-xs font-medium text-purple-700 bg-purple-50/60 px-3 py-1.5 rounded-xl">
                            {u.tagline}
                          </p>
                        )}

                        {u.bio && (
                          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                            {u.bio}
                          </p>
                        )}

                        {u.timeline && u.timeline.length > 0 && (
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                            <span>Timeline milestones:</span>
                            <span className="font-medium text-brandDark">{u.timeline.length} items</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Create / Edit User Modal */}
            {userModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="text-base font-semibold text-brandDark">
                        {editingUser ? `Edit User: ${editingUser.name}` : 'Create New User'}
                      </h3>
                      <p className="text-xs text-gray-400">
                        Profile information with Base64 image and career/education timeline array.
                      </p>
                    </div>
                    <button
                      onClick={() => setUserModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleSaveUser} className="space-y-5">
                    {/* Photo Upload Section */}
                    <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/60 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pastelPurple bg-white flex-shrink-0 flex items-center justify-center">
                        {userForm.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={userForm.image} alt="User avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">No Image</span>
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-full bg-brandDark text-white hover:bg-opacity-90 transition-colors inline-flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Upload Base64
                            <input type="file" accept="image/*" onChange={handleUserImageUpload} className="hidden" />
                          </label>
                          {userForm.image && (
                            <button
                              type="button"
                              onClick={() => setUserForm((prev) => ({ ...prev, image: '' }))}
                              className="text-xs text-red-600 hover:text-red-700 px-2.5 py-1 rounded-full border border-red-200"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Or paste Base64 or Image URL"
                          value={userForm.image}
                          onChange={(e) => setUserForm({ ...userForm, image: e.target.value })}
                          className="input-field text-xs font-mono py-1"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                        <input
                          required
                          type="text"
                          value={userForm.name}
                          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                          className="input-field text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                        <input
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                          className="input-field text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                        <select
                          value={userForm.role}
                          onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                          className="input-field text-xs"
                        >
                          <option value="user">User</option>
                          <option value="author">Author</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Tagline / Subtitle</label>
                        <input
                          type="text"
                          placeholder="e.g. Robotics Researcher"
                          value={userForm.tagline}
                          onChange={(e) => setUserForm({ ...userForm, tagline: e.target.value })}
                          className="input-field text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Biography</label>
                      <textarea
                        rows={3}
                        value={userForm.bio}
                        onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })}
                        className="input-field text-xs resize-none"
                      />
                    </div>

                    {/* Timeline Array Editor inside User Form */}
                    <div className="pt-3 border-t border-gray-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-semibold text-brandDark uppercase tracking-wider">
                          Career &amp; Education Timeline ({userForm.timeline.length} items)
                        </label>
                      </div>

                      {userForm.timeline.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto p-1">
                          {userForm.timeline.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 bg-gray-50 rounded-xl border border-gray-200/70 flex justify-between items-start text-xs"
                            >
                              <div>
                                <span className="font-semibold text-brandDark">{item.title}</span> —{' '}
                                <span className="text-purple-700">{item.institution}</span> ({item.startYear}
                                {item.endYear ? `–${item.endYear}` : '–Present'})
                                <p className="text-gray-500 text-[11px] mt-0.5">{item.description}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteUserTimelineItem(item.id)}
                                className="text-red-500 hover:text-red-700 font-medium ml-2"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Timeline Item sub-form */}
                      <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-100 space-y-2 text-xs">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <input
                            type="number"
                            placeholder="Start (2024)"
                            value={userTimelineItem.startYear}
                            onChange={(e) => setUserTimelineItem({ ...userTimelineItem, startYear: Number(e.target.value) })}
                            className="input-field text-xs py-1"
                          />
                          <input
                            type="number"
                            placeholder="End (or blank)"
                            value={userTimelineItem.endYear}
                            onChange={(e) => setUserTimelineItem({ ...userTimelineItem, endYear: e.target.value })}
                            className="input-field text-xs py-1"
                          />
                          <input
                            type="text"
                            placeholder="Title / Degree"
                            value={userTimelineItem.title}
                            onChange={(e) => setUserTimelineItem({ ...userTimelineItem, title: e.target.value })}
                            className="input-field text-xs py-1 col-span-2"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Institution"
                            value={userTimelineItem.institution}
                            onChange={(e) => setUserTimelineItem({ ...userTimelineItem, institution: e.target.value })}
                            className="input-field text-xs py-1"
                          />
                          <input
                            type="text"
                            placeholder="Description"
                            value={userTimelineItem.description}
                            onChange={(e) => setUserTimelineItem({ ...userTimelineItem, description: e.target.value })}
                            className="input-field text-xs py-1 col-span-2"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddUserTimelineItem}
                          className="text-xs px-3 py-1 rounded-lg border border-purple-300 bg-white text-purple-700 hover:bg-purple-100"
                        >
                          + Append Milestone
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setUserModalOpen(false)}
                        className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary text-xs py-2 px-6">
                        {editingUser ? 'Update User' : 'Create User'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: About Me */}
        {activeTab === 'About Me' && about && (
          <div className="space-y-8">
            <form onSubmit={handleSaveAbout} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-brandDark">Profile &amp; Biography</h2>
                  <p className="text-xs text-gray-500">Stored in database with Base64 profile photo and timeline object array.</p>
                </div>
                <button type="submit" className="btn-primary text-xs py-2 px-6">
                  {aboutSaved ? 'Saved!' : 'Save Changes'}
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
                      Selecting an image file will automatically encode it as a Base64 string and persist it to the <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">about</code> table.
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
                  className="input-field resize-none"
                  required
                />
              </div>

              {/* Education & Experience Timeline (Stored as array of objects) */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold text-brandDark">Timeline Items</h3>
                    <p className="text-xs text-gray-500">Stored directly as an array of objects in the table.</p>
                  </div>
                  <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                    {about.timeline?.length || 0} items
                  </span>
                </div>

                {/* Timeline Items List */}
                <div className="space-y-3">
                  {(!about.timeline || about.timeline.length === 0) ? (
                    <div className="p-4 rounded-xl bg-gray-50 text-xs text-gray-400 text-center border border-dashed border-gray-200">
                      No timeline entries yet. Add your education or work history below.
                    </div>
                  ) : (
                    about.timeline.map((t, idx) => (
                      <div
                        key={t.id || idx}
                        className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-brandDark">{t.title}</span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                              {t.startYear} {t.endYear ? `– ${t.endYear}` : '– Present'}
                            </span>
                          </div>
                          <p className="text-xs text-purple-700 font-medium">{t.institution}</p>
                          <p className="text-xs text-gray-600">{t.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTimelineItem(t.id)}
                          className="text-xs text-red-500 hover:text-red-700 p-1 font-medium"
                          title="Remove item"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Timeline Item Inline Form */}
                <div className="p-4 rounded-2xl border border-pastelPurple/40 bg-purple-50/30 space-y-3">
                  <h4 className="text-xs font-semibold text-brandDark uppercase tracking-wider">
                    + Add New Timeline Item
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1">Start Year</label>
                      <input
                        type="number"
                        placeholder="2024"
                        value={newTimeline.startYear}
                        onChange={(e) => setNewTimeline({ ...newTimeline, startYear: Number(e.target.value) })}
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1">End Year (or blank)</label>
                      <input
                        type="number"
                        placeholder="Present"
                        value={newTimeline.endYear}
                        onChange={(e) => setNewTimeline({ ...newTimeline, endYear: e.target.value })}
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-gray-500 mb-1">Role / Degree Title</label>
                      <input
                        type="text"
                        placeholder="B.Sc. Mechanical Engineering"
                        value={newTimeline.title}
                        onChange={(e) => setNewTimeline({ ...newTimeline, title: e.target.value })}
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1">Institution / Company</label>
                      <input
                        type="text"
                        placeholder="University or Lab Name"
                        value={newTimeline.institution}
                        onChange={(e) => setNewTimeline({ ...newTimeline, institution: e.target.value })}
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-gray-500 mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="Key coursework, achievements, or engineering focus"
                        value={newTimeline.description}
                        onChange={(e) => setNewTimeline({ ...newTimeline, description: e.target.value })}
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTimelineItem}
                    className="text-xs font-semibold px-4 py-2 rounded-full border border-purple-300 bg-white text-purple-800 hover:bg-purple-100 transition-colors"
                  >
                    + Add to Timeline List
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" className="btn-primary text-xs py-2.5 px-8">
                  {aboutSaved ? 'Saved!' : 'Save All Changes'}
                </button>
              </div>
            </form>
          </div>
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
