import React, { useEffect, useState } from 'react';
import type { Knowledge } from '../../lib/dataService';
import { getAuthHeaders, compressImageFile } from '../../lib/clientAuth';
import { KnowledgeCategory, KnowledgeStatus } from '../../prisma/generated/enums';

interface CommonKnowledgeTabProps {
  currentUser?: any | null;
  isAdmin: boolean;
}

const CATEGORIES: KnowledgeCategory[] = [
  KnowledgeCategory.ROBOTICS,
  KnowledgeCategory.MECHANICS,
  KnowledgeCategory.ENGINEERING,
  KnowledgeCategory.AI_And_Vision,
  KnowledgeCategory.IoT_And_Hardware,
  KnowledgeCategory.PROGRAMMING,
  KnowledgeCategory.GENERAL,
];

const STATUS_FILTERS: (KnowledgeStatus | 'all')[] = [
  'all',
  KnowledgeStatus.PENDING,
  KnowledgeStatus.CONFIRMED,
  KnowledgeStatus.REJECTED,
];

export default function CommonKnowledgeTab({ currentUser, isAdmin }: CommonKnowledgeTabProps) {
  const [articles, setArticles] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<KnowledgeStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Knowledge | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    category: KnowledgeCategory.ENGINEERING as KnowledgeCategory,
    summary: '',
    content: '',
    image: '',
    tags: '',
  });

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/knowledge');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error('Failed to fetch knowledge articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setForm({
      title: '',
      category: KnowledgeCategory.ENGINEERING,
      summary: '',
      content: '',
      image: '',
      tags: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (art: Knowledge) => {
    setEditingArticle(art);
    setForm({
      title: art.title,
      category: art.category || KnowledgeCategory.ENGINEERING,
      summary: art.summary || '',
      content: art.content || '',
      image: art.image || '',
      tags: Array.isArray(art.tags) ? art.tags.join(', ') : '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setActionLoading(true);
    setFeedback(null);

    const tagList = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: any = {
      title: form.title,
      category: form.category,
      summary: form.summary,
      content: form.content,
      image: form.image || null,
      tags: tagList,
    };

    // If new article, set author information
    if (!editingArticle) {
      payload.authorId = currentUser?.id || 'user-community';
      payload.authorName = currentUser?.name || 'Community Engineer';
      payload.authorEmail = currentUser?.email || 'user@mechgirl.com';
      payload.authorImage = currentUser?.image || null;
      // Admins publish immediately; regular users submit as pending review
      payload.status = isAdmin ? KnowledgeStatus.CONFIRMED : KnowledgeStatus.PENDING;
      payload.confirmed = isAdmin;
    }

    try {
      const url = editingArticle ? `/api/knowledge/${editingArticle.id}` : '/api/knowledge';
      const method = editingArticle ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        setFeedback({
          type: 'success',
          message: editingArticle
            ? `Article "${form.title}" updated successfully!`
            : isAdmin
            ? `Article "${form.title}" published to Common Knowledge!`
            : `Your article "${form.title}" has been submitted for admin confirmation!`,
        });
        setTimeout(() => setFeedback(null), 5000);
        fetchArticles();
      } else {
        const data = await res.json().catch(() => ({}));
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to save knowledge article.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Network error occurred while saving article.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async (id: string, title: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/knowledge/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ confirmed: true, status: KnowledgeStatus.CONFIRMED }),
      });
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Confirmed and published: "${title}"`,
        });
        setTimeout(() => setFeedback(null), 4000);
        fetchArticles();
      } else {
        alert('Failed to confirm article');
      }
    } catch (err) {
      console.error('Error confirming article:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string, title: string) => {
    if (!confirm(`Reject proposal "${title}"?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/knowledge/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ confirmed: false, status: KnowledgeStatus.REJECTED }),
      });
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Article "${title}" has been marked as rejected.`,
        });
        setTimeout(() => setFeedback(null), 4000);
        fetchArticles();
      } else {
        alert('Failed to update article status');
      }
    } catch (err) {
      console.error('Error rejecting article:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Permanently delete knowledge article "${title}"?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/knowledge/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Article "${title}" deleted.`,
        });
        setTimeout(() => setFeedback(null), 4000);
        fetchArticles();
      } else {
        alert('Failed to delete article');
      }
    } catch (err) {
      console.error('Error deleting article:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImageFile(file, 1200, 800, 0.82);
      setForm((prev) => ({ ...prev, image: base64 }));
    } catch (err) {
      console.error('Image upload failed, fallback:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setForm((prev) => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter articles
  const displayedArticles = articles.filter((art) => {
    // If not admin, user sees all confirmed articles PLUS their own pending/rejected articles
    if (!isAdmin && currentUser?.email) {
      const isAuthor = art.authorEmail?.toLowerCase() === currentUser.email.toLowerCase();
      const isConfirmed = art.status === KnowledgeStatus.CONFIRMED;
      if (!isAuthor && !isConfirmed) {
        return false;
      }
    }

    if (filterStatus !== 'all' && art.status !== filterStatus) {
      return false;
    }

    if (search) {
      const q = search.toLowerCase();
      const match =
        art.title.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        (art.summary && art.summary.toLowerCase().includes(q)) ||
        (art.authorName && art.authorName.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const pendingCount = articles.filter((a) => a.status === KnowledgeStatus.PENDING).length;
  const confirmedCount = articles.filter((a) => a.status === KnowledgeStatus.CONFIRMED).length;
  const rejectedCount = articles.filter((a) => a.status === KnowledgeStatus.REJECTED).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-brandDark">Common Knowledge Repository</h2>
              {isAdmin && pendingCount > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                  {pendingCount} Pending Approval
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isAdmin
                ? 'Review and confirm community knowledge proposals, edit technical guides, and publish articles.'
                : 'Share your robotics guides and STEM insights. Articles will be reviewed and confirmed by an administrator.'}
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isAdmin ? '+ Publish Knowledge' : '+ Create Common Knowledge'}
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center justify-between gap-2 ${
              feedback.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="font-bold opacity-60 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-brandDark text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({articles.length})
            </button>

            <button
              onClick={() => setFilterStatus(KnowledgeStatus.PENDING)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatus === KnowledgeStatus.PENDING
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Pending Confirmation ({pendingCount})
            </button>

            <button
              onClick={() => setFilterStatus(KnowledgeStatus.CONFIRMED)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatus === KnowledgeStatus.CONFIRMED
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Confirmed &amp; Published ({confirmedCount})
            </button>

            {isAdmin && (
              <button
                onClick={() => setFilterStatus(KnowledgeStatus.REJECTED)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filterStatus === KnowledgeStatus.REJECTED
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-red-50 text-red-800 hover:bg-red-100'
                }`}
              >
                Rejected ({rejectedCount})
              </button>
            )}
          </div>

          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search title, category, author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field text-xs py-2 pl-8 pr-3 w-full"
            />
            <svg
              className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border text-center text-xs text-gray-400">
          Loading knowledge articles...
        </div>
      ) : displayedArticles.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-soft text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-pastelPurple/30 text-purple-700 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-brandDark">No Knowledge Articles Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {filterStatus === KnowledgeStatus.PENDING
              ? 'There are currently no articles pending review.'
              : 'Be the first to share an engineering tutorial, guide, or hardware breakdown!'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5 shadow-sm mt-2"
          >
            + Create New Article
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {displayedArticles.map((art) => {
            const isMyArticle =
              currentUser?.email &&
              art.authorEmail?.toLowerCase() === currentUser.email.toLowerCase();

            return (
              <div
                key={art.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft hover:border-pastelPurple/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Category & Status Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="badge bg-purple-100 text-purple-700 font-semibold">
                      {art.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        art.status === KnowledgeStatus.CONFIRMED
                          ? 'bg-emerald-100 text-emerald-800'
                          : art.status === KnowledgeStatus.PENDING
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {art.status === KnowledgeStatus.CONFIRMED
                        ? 'Confirmed & Published'
                        : art.status === KnowledgeStatus.PENDING
                        ? 'Pending Confirmation'
                        : 'Rejected'}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h3 className="text-base font-bold text-brandDark line-clamp-2">{art.title}</h3>
                    {art.summary && (
                      <p className="text-xs text-gray-500 font-light mt-1 line-clamp-2">{art.summary}</p>
                    )}
                  </div>

                  {/* Image Thumbnail if exists */}
                  {art.image && (
                    <div className="h-32 rounded-2xl overflow-hidden bg-gray-100 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Tags */}
                  {art.tags && art.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {art.tags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Author Card */}
                  <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-pastelPurple/30 flex items-center justify-center text-[10px] font-bold text-purple-700">
                      {art.authorImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={art.authorImage} alt={art.authorName || ''} className="w-full h-full object-cover" />
                      ) : (
                        (art.authorName || 'U').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-brandDark truncate">
                        {art.authorName || 'Anonymous Author'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {art.createdAt ? new Date(art.createdAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    {/* Admin Confirmation Action */}
                    {isAdmin && art.status === KnowledgeStatus.PENDING && (
                      <button
                        onClick={() => handleConfirm(art.id, art.title)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        ✓ Confirm &amp; Publish
                      </button>
                    )}

                    {isAdmin && art.status === KnowledgeStatus.PENDING && (
                      <button
                        onClick={() => handleReject(art.id, art.title)}
                        disabled={actionLoading}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                    )}

                    {isAdmin && art.status === KnowledgeStatus.REJECTED && (
                      <button
                        onClick={() => handleConfirm(art.id, art.title)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        Restore &amp; Publish
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto">
                    {(isAdmin || isMyArticle) && (
                      <button
                        onClick={() => handleOpenEdit(art)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {(isAdmin || isMyArticle) && (
                      <button
                        onClick={() => handleDelete(art.id, art.title)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Article Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-gray-100 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-brandDark">
                  {editingArticle ? `Edit Article: ${editingArticle.title}` : 'Submit Common Knowledge Blog'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isAdmin
                    ? 'Publish a technical guide or STEM article directly to the community.'
                    : 'Submit your technical guide. An administrator will confirm and publish it.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Title & Category */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Introduction to Autonomous Mobile Robots"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as KnowledgeCategory })}
                    className="input-field text-xs"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Summary / Abstract */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Summary / Abstract
                </label>
                <input
                  type="text"
                  placeholder="A concise 1-2 sentence overview of what this article covers..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              {/* Cover Image */}
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/60 space-y-3">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Cover Image (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {form.image ? (
                    <div className="w-24 h-16 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.image} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  ) : null}

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-full bg-brandDark text-white hover:bg-opacity-90 transition-colors shadow-sm inline-flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>

                      {form.image && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image: '' })}
                          className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Or paste image URL (https://images.unsplash.com/...)"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      className="input-field text-xs py-1"
                    />
                  </div>
                </div>
              </div>

              {/* Content (Markdown / Text) */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Article Content (Markdown Supported) *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Write your article, research notes, equations, or step-by-step tutorial here..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="input-field font-mono text-xs"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Robotics, SLAM, ROS2, Kinematics"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 rounded-full text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary text-xs py-2 px-6 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {actionLoading
                    ? 'Saving...'
                    : editingArticle
                    ? 'Update Article'
                    : isAdmin
                    ? 'Publish to Knowledge'
                    : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
