import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Product } from '../../lib/dataService';
import { getAuthHeaders } from '../../lib/clientAuth';
import { ProductCategory } from '../../prisma/generated/enums';

const CATEGORY_FILTERS: (ProductCategory | 'All')[] = [
  'All',
  ProductCategory.ROBOTICS,
  ProductCategory.IOT,
  ProductCategory.MECHATRONICS,
  ProductCategory.KNOWLEDGE,
];

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<ProductCategory | 'All'>('All');
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete project');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const filtered = products.filter((prod) => {
    const matchCat = category === 'All' || prod.category === category;
    const matchSearch =
      !search ||
      prod.title.toLowerCase().includes(search.toLowerCase()) ||
      prod.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-brandDark">
            All Projects &amp; Hardware ({products.length})
          </h2>
          <p className="text-xs text-gray-500">Manage robotics builds, IoT devices, and open-source CAD models.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="btn-primary text-xs py-2 px-5 shadow-sm inline-flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-brandDark text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field text-xs max-w-xs py-1.5"
        />
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border text-center text-xs text-gray-400">
          Loading projects...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border text-center text-xs text-gray-400">
          No projects found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((prod) => (
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
                {prod.tags && prod.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {prod.tags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
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
  );
}
