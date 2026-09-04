import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Registration } from '../../lib/dataService';
import { getAuthHeaders } from '../../lib/clientAuth';

interface RegistrationsTabProps {
  currentUser?: any | null;
  isAdmin: boolean;
}

export default function RegistrationsTab({ currentUser, isAdmin }: RegistrationsTabProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/registrations');
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      }
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleDeleteReg = async (id: string) => {
    if (!confirm('Remove this attendee registration?')) return;
    try {
      const res = await fetch(`/api/registrations?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchRegistrations();
      } else {
        alert('Failed to remove registration');
      }
    } catch (err) {
      console.error('Error removing registration:', err);
    }
  };

  // Filter registrations based on role and search query
  const displayedRegistrations = registrations.filter((reg) => {
    // If not admin and user has email, show their own registrations
    if (!isAdmin && currentUser?.email) {
      if (reg.email.toLowerCase() !== currentUser.email.toLowerCase()) {
        return false;
      }
    }
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      reg.name.toLowerCase().includes(q) ||
      reg.email.toLowerCase().includes(q) ||
      reg.phone.toLowerCase().includes(q) ||
      (reg.activityTitle && reg.activityTitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-brandDark">
            {isAdmin ? `Activity Registrations (${registrations.length})` : 'My Workshop Registrations'}
          </h2>
          <p className="text-xs text-gray-500">
            {isAdmin
              ? 'View and manage attendees enrolled across all engineering workshops and challenges.'
              : 'Review your upcoming activity registrations and confirmed seats.'}
          </p>
        </div>

        {isAdmin && (
          <input
            type="text"
            placeholder="Search attendees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field text-xs max-w-xs py-1.5"
          />
        )}
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border text-center text-xs text-gray-400">
          Loading registrations...
        </div>
      ) : displayedRegistrations.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-soft text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-pastelPurple/30 text-purple-700 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-brandDark">
            {isAdmin ? 'No Registrations Recorded' : 'You have no workshop registrations yet'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {isAdmin
              ? 'When participants register for workshops on the website, they will appear here.'
              : 'Explore our hands-on robotics and engineering workshops and reserve your seat today!'}
          </p>
          {!isAdmin && (
            <Link
              href="/common-knowledge"
              className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5 shadow-sm mt-2"
            >
              Browse Upcoming Workshops &rarr;
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Attendee</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Workshop / Activity</th>
                  <th className="py-3.5 px-4">Registered On</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-brandDark">{reg.name}</td>
                    <td className="py-3.5 px-4 text-gray-600">{reg.email}</td>
                    <td className="py-3.5 px-4 text-gray-600">{reg.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full text-[11px]">
                        {reg.activityTitle || reg.activityId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                      {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteReg(reg.id)}
                          className="text-red-500 hover:text-red-700 font-medium text-xs px-2.5 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
