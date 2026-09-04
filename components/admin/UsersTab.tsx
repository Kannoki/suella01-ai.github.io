import React, { useEffect, useState } from 'react';
import { User, TimelineItem } from '../../lib/dataService';
import { getAuthHeaders, compressImageFile } from '../../lib/clientAuth';

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userViewMode, setUserViewMode] = useState<'table' | 'cards'>('table');
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [userFeedback, setUserFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null);

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

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setEditingTimelineId(null);
    setUserForm({
      name: '',
      email: '',
      role: 'user',
      tagline: '',
      bio: '',
      image: '',
      timeline: [],
    });
    setUserTimelineItem({
      startYear: new Date().getFullYear(),
      endYear: '',
      title: '',
      institution: '',
      description: '',
    });
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setEditingTimelineId(null);
    setUserForm({
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'user',
      tagline: u.tagline || '',
      bio: u.bio || '',
      image: u.image || '',
      timeline: u.timeline || [],
    });
    setUserTimelineItem({
      startYear: new Date().getFullYear(),
      endYear: '',
      title: '',
      institution: '',
      description: '',
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name) return;
    setUserActionLoading(true);
    setUserFeedback(null);

    try {
      const res = await fetch(editingUser ? `/api/users/${editingUser.id}` : '/api/users', {
        method: editingUser ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userForm),
      });

      if (res.ok) {
        setUserModalOpen(false);
        setUserFeedback({
          type: 'success',
          message: editingUser
            ? `User "${userForm.name}" updated successfully!`
            : `User "${userForm.name}" created successfully!`,
        });
        setTimeout(() => setUserFeedback(null), 4000);
        fetchUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        setUserFeedback({
          type: 'error',
          message: data.error || 'Failed to save user.',
        });
      }
    } catch {
      setUserFeedback({
        type: 'error',
        message: 'Network error occurred while saving user.',
      });
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${name}"?`)) return;
    setUserActionLoading(true);
    setUserFeedback(null);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        setUserFeedback({
          type: 'success',
          message: `User "${name}" has been deleted.`,
        });
        setTimeout(() => setUserFeedback(null), 4000);
        fetchUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        setUserFeedback({
          type: 'error',
          message: data.error || 'Failed to delete user.',
        });
      }
    } catch {
      setUserFeedback({
        type: 'error',
        message: 'Network error occurred while deleting user.',
      });
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUserImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64Str = await compressImageFile(file, 1000, 1000, 0.82);
      setUserForm((prev) => ({ ...prev, image: base64Str }));
    } catch (err) {
      console.error('User image compression failed, fallback:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUserForm((prev) => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOrUpdateUserTimelineItem = () => {
    if (!userTimelineItem.title || !userTimelineItem.institution) return;
    if (editingTimelineId) {
      setUserForm((prev) => ({
        ...prev,
        timeline: prev.timeline.map((t) =>
          t.id === editingTimelineId
            ? {
                ...t,
                startYear: Number(userTimelineItem.startYear) || new Date().getFullYear(),
                endYear: userTimelineItem.endYear ? Number(userTimelineItem.endYear) : null,
                title: userTimelineItem.title,
                institution: userTimelineItem.institution,
                description: userTimelineItem.description,
              }
            : t
        ),
      }));
      setEditingTimelineId(null);
    } else {
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
    }
    setUserTimelineItem({
      startYear: new Date().getFullYear(),
      endYear: '',
      title: '',
      institution: '',
      description: '',
    });
  };

  const handleEditUserTimelineItem = (item: TimelineItem) => {
    setEditingTimelineId(item.id);
    setUserTimelineItem({
      startYear: item.startYear,
      endYear: item.endYear ?? '',
      title: item.title,
      institution: item.institution,
      description: item.description,
    });
  };

  const handleCancelEditTimelineItem = () => {
    setEditingTimelineId(null);
    setUserTimelineItem({
      startYear: new Date().getFullYear(),
      endYear: '',
      title: '',
      institution: '',
      description: '',
    });
  };

  const handleDeleteUserTimelineItem = (id: string) => {
    if (editingTimelineId === id) setEditingTimelineId(null);
    setUserForm((prev) => ({ ...prev, timeline: prev.timeline.filter((t) => t.id !== id) }));
  };

  const q = userSearch.trim().toLowerCase();
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.tagline && u.tagline.toLowerCase().includes(q));
    const matchesRole =
      userRoleFilter === 'all' ||
      (u.role || 'user').toLowerCase() === userRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-brandDark">User &amp; Author Management</h2>
            <p className="text-xs text-gray-500">
              Manage team members, roles, avatar pictures, and education/career milestones ({users.length} total users).
            </p>
          </div>
          <button
            onClick={handleOpenCreateUser}
            className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New User
          </button>
        </div>

        {/* Feedback Alert */}
        {userFeedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center justify-between gap-2 ${
              userFeedback.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            <span>{userFeedback.message}</span>
            <button
              onClick={() => setUserFeedback(null)}
              className="font-bold opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search, Role Filter, View Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {['all', 'admin', 'author', 'user'].map((r) => {
              const count =
                r === 'all'
                  ? users.length
                  : users.filter((u) => (u.role || 'user').toLowerCase() === r).length;
              return (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                    userRoleFilter === r
                      ? 'bg-brandDark text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search name, email, tagline..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="input-field text-xs py-2 pl-8 pr-3 w-full"
              />
              <svg
                className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="flex p-0.5 bg-gray-100 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setUserViewMode('table')}
                title="Table View"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  userViewMode === 'table'
                    ? 'bg-white text-brandDark shadow-xs'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setUserViewMode('cards')}
                title="Cards View"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  userViewMode === 'cards'
                    ? 'bg-white text-brandDark shadow-xs'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Display */}
      {loadingUsers ? (
        <div className="bg-white p-12 rounded-3xl border text-center text-xs text-gray-400">
          Loading users list...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border text-center text-xs text-gray-400">
          No users found matching your search.
        </div>
      ) : userViewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Tagline</th>
                  <th className="py-3.5 px-4">Milestones</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-purple-200 bg-pastelPurple/30 flex-shrink-0 flex items-center justify-center">
                          {u.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.image} alt={u.name || ''} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-semibold text-purple-700">
                              {(u.name || 'U').slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-brandDark">{u.name || 'Anonymous'}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{u.email || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : u.role === 'author'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">{u.tagline || '—'}</td>
                    <td className="py-3.5 px-4 text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[11px]">
                        {u.timeline?.length || 0} items
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name || 'User')}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft hover:border-pastelPurple/60 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pastelPurple bg-pastelPurple/20 flex-shrink-0 flex items-center justify-center">
                      {u.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.image} alt={u.name || ''} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-purple-700">
                          {(u.name || 'U').slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-brandDark">{u.name || 'Anonymous'}</h3>
                      <p className="text-xs text-gray-400">{u.email || 'No email'}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'author'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {u.role || 'user'}
                  </span>
                </div>

                {u.tagline && (
                  <p className="text-xs font-medium text-brandDark/80 line-clamp-1">{u.tagline}</p>
                )}
                {u.bio && (
                  <p className="text-xs text-gray-500 font-light line-clamp-2">{u.bio}</p>
                )}

                {u.timeline && u.timeline.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Timeline ({u.timeline.length})
                    </p>
                    <div className="space-y-1">
                      {u.timeline.slice(0, 2).map((tl) => (
                        <div key={tl.id} className="text-[11px] text-gray-600 truncate flex items-center gap-1.5">
                          <span className="text-purple-600 font-mono text-[10px]">{tl.startYear}:</span>
                          <span className="font-medium text-gray-800">{tl.title}</span>
                          <span className="text-gray-400">({tl.institution})</span>
                        </div>
                      ))}
                      {u.timeline.length > 2 && (
                        <p className="text-[10px] text-purple-600 font-medium">
                          +{u.timeline.length - 2} more milestones
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleOpenEditUser(u)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => handleDeleteUser(u.id, u.name || 'User')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit User Modal */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-gray-100 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-brandDark">
                  {editingUser ? `Edit User: ${editingUser.name}` : 'Create New User'}
                </h3>
                <p className="text-xs text-gray-500">
                  Update profile information, role credentials, avatar photo, and timeline milestones.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-6">
              {/* Photo Upload with Base64 Preview */}
              <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200/60 space-y-3">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User Avatar / Profile Photo
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pastelPurple shadow-sm bg-white flex-shrink-0 flex items-center justify-center">
                    {userForm.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={userForm.image} alt="User avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">No Photo</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="cursor-pointer text-xs font-semibold px-4 py-2 rounded-full bg-brandDark text-white hover:bg-opacity-90 transition-colors shadow-sm inline-flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload Local Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUserImageUpload}
                          className="hidden"
                        />
                      </label>

                      {userForm.image && (
                        <button
                          type="button"
                          onClick={() => setUserForm((prev) => ({ ...prev, image: '' }))}
                          className="text-xs text-red-600 hover:text-red-700 px-3 py-1.5 rounded-full border border-red-200 hover:bg-red-50 transition-colors"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Uploads are automatically compressed and saved as a high-retina Base64 string directly to <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">users.json</code>.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">
                    Or paste Image URL:
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={userForm.image}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, image: e.target.value }))}
                    className="input-field text-xs font-mono"
                  />
                </div>
              </div>

              {/* Name, Email, Role */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Minh Ngoc"
                    value={userForm.name}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="user@mechgirl.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                    System Role *
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}
                    className="input-field text-xs"
                  >
                    <option value="user">User (Standard)</option>
                    <option value="author">Author (Contributor)</option>
                    <option value="admin">Admin (Full Control)</option>
                  </select>
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Tagline / Professional Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mechanical Engineering Student &amp; STEM Advocate"
                  value={userForm.tagline}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, tagline: e.target.value }))}
                  className="input-field text-xs"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Biography
                </label>
                <textarea
                  rows={3}
                  placeholder="A brief bio describing interests, research areas, or background..."
                  value={userForm.bio}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, bio: e.target.value }))}
                  className="input-field text-xs"
                />
              </div>

              {/* Milestones Editor */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Career &amp; Education Milestones ({userForm.timeline.length})
                    </h4>
                    <p className="text-[11px] text-gray-400">Add degrees, certifications, or career milestones.</p>
                  </div>
                </div>

                {/* Existing Milestones List */}
                {userForm.timeline.length > 0 ? (
                  <div className="space-y-2">
                    {userForm.timeline.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50/80 p-3 rounded-xl border border-gray-200/60 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-brandDark">
                            {item.title} <span className="font-normal text-gray-500">at {item.institution}</span>
                          </p>
                          <p className="text-[11px] text-purple-700 font-medium">
                            {item.startYear} &ndash; {item.endYear || 'Present'}
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-gray-500">{item.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditUserTimelineItem(item)}
                            className="text-purple-700 hover:text-purple-900 px-2 py-1 bg-purple-50 rounded text-[11px]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUserTimelineItem(item.id)}
                            className="text-red-600 hover:text-red-800 px-2 py-1 bg-red-50 rounded text-[11px]"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl">
                    No milestones added yet. Use the fields below to add education or career history.
                  </p>
                )}

                {/* Sub-form to Add/Edit a Milestone */}
                <div className="bg-pastelPurple/10 p-4 rounded-2xl border border-purple-100/60 space-y-3">
                  <p className="text-xs font-semibold text-purple-900">
                    {editingTimelineId ? 'Edit Milestone' : 'Add Milestone Item'}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">
                        Degree / Role Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. B.Sc. Mechanical Engineering"
                        value={userTimelineItem.title}
                        onChange={(e) =>
                          setUserTimelineItem((prev) => ({ ...prev, title: e.target.value }))
                        }
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">
                        Institution / Organization *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Stanford University"
                        value={userTimelineItem.institution}
                        onChange={(e) =>
                          setUserTimelineItem((prev) => ({ ...prev, institution: e.target.value }))
                        }
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">
                        Start Year *
                      </label>
                      <input
                        type="number"
                        placeholder="2024"
                        value={userTimelineItem.startYear}
                        onChange={(e) =>
                          setUserTimelineItem((prev) => ({
                            ...prev,
                            startYear: Number(e.target.value) || new Date().getFullYear(),
                          }))
                        }
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">
                        End Year (leave blank if present)
                      </label>
                      <input
                        type="number"
                        placeholder="2027"
                        value={userTimelineItem.endYear}
                        onChange={(e) =>
                          setUserTimelineItem((prev) => ({ ...prev, endYear: e.target.value }))
                        }
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">
                      Brief Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Specializing in robotics, dynamic controls, and precision mechanics."
                      value={userTimelineItem.description}
                      onChange={(e) =>
                        setUserTimelineItem((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="input-field text-xs py-1.5"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {editingTimelineId && (
                      <button
                        type="button"
                        onClick={handleCancelEditTimelineItem}
                        className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAddOrUpdateUserTimelineItem}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-brandDark text-white hover:bg-opacity-90 transition-colors"
                    >
                      {editingTimelineId ? 'Update Milestone' : '+ Add to Timeline'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-5 py-2 rounded-full text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userActionLoading}
                  className="btn-primary text-xs py-2 px-6 disabled:opacity-50 flex items-center gap-2"
                >
                  {userActionLoading ? (
                    <span>Saving...</span>
                  ) : editingUser ? (
                    'Update User'
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
