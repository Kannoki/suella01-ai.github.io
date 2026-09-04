import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { getLoggedInUser, logoutUser } from '../../lib/clientAuth';

// Modular Tab Components
import ActivitiesTab from '../../components/admin/ActivitiesTab';
import ProductsTab from '../../components/admin/ProductsTab';
import RegistrationsTab from '../../components/admin/RegistrationsTab';
import CarouselTab from '../../components/admin/CarouselTab';
import UsersTab from '../../components/admin/UsersTab';
import AboutTab from '../../components/admin/AboutTab';
import ContactTab from '../../components/admin/ContactTab';
import CommonKnowledgeTab from '../../components/admin/CommonKnowledgeTab';

const ADMIN_TABS = [
  'Activities',
  'Products',
  'Registrations',
  'Carousel',
  'Users',
  'About Me',
  'Contact',
  'Common Knowledge',
];

const USER_TABS = [
  'Registrations',
  'Common Knowledge',
];

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('Registrations');

  useEffect(() => {
    const user = getLoggedInUser();
    if (user) {
      setCurrentUser(user);
      // Default to Activities if Admin, or Registrations if regular user
      if (user.role === 'admin') {
        setActiveTab('Activities');
      } else {
        setActiveTab('Registrations');
      }
    } else {
      // If not logged in, redirect to login page
      router.push('/login?callbackUrl=/admin');
    }
  }, [router]);

  const isAdmin = currentUser?.role === 'admin';
  const availableTabs = isAdmin ? ADMIN_TABS : USER_TABS;

  // Ensure user cannot stay on an admin-only tab if logged in as regular user
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab('Registrations');
    }
  }, [availableTabs, activeTab]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    router.push('/login');
  };

  return (
    <Layout
      title={isAdmin ? 'Admin Dashboard — MechGirl Management' : 'Community Member Portal — MechGirl'}
      description="Manage workshops, robotics projects, common knowledge blogs, and profile details."
    >
      <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold tracking-widest text-purple-700 uppercase bg-pastelPurple/40 px-3 py-1 rounded-full border border-purple-200/40">
              {isAdmin ? 'System Administration' : 'Member Workspace'}
            </span>
            <h1 className="text-3xl font-bold text-brandDark mt-2">
              {isAdmin ? 'Content & Community Manager' : 'Member Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/docs"
                className="text-xs font-semibold px-4 py-2 rounded-full bg-pastelPurple/30 text-purple-800 border border-purple-200 hover:bg-pastelPurple/50 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                API Docs (Swagger)
              </Link>
            )}
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
                  {(currentUser?.name || 'User').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-brandDark">
                  {currentUser?.name || 'MINH NGOC'}
                </p>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {currentUser?.role || 'user'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                {currentUser?.email || 'user@mechgirl.com'} &bull;{' '}
                <span className="text-emerald-600 font-medium">Logged in</span>
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
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Tab Navigation (Role-Filtered) */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          {availableTabs.map((tab) => (
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

        {/* Modular Tab Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'Activities' && isAdmin && <ActivitiesTab />}
          {activeTab === 'Products' && isAdmin && <ProductsTab />}
          {activeTab === 'Registrations' && (
            <RegistrationsTab currentUser={currentUser} isAdmin={isAdmin} />
          )}
          {activeTab === 'Carousel' && isAdmin && <CarouselTab />}
          {activeTab === 'Users' && isAdmin && <UsersTab />}
          {activeTab === 'About Me' && isAdmin && <AboutTab />}
          {activeTab === 'Contact' && isAdmin && <ContactTab />}
          {activeTab === 'Common Knowledge' && (
            <CommonKnowledgeTab currentUser={currentUser} isAdmin={isAdmin} />
          )}
        </div>
      </div>
    </Layout>
  );
}
