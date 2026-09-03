import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import ProductForm from '../../../components/admin/ProductForm';
import { Product } from '../../../lib/dataService';

export default function EditProductPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const slugStr = Array.isArray(slug) ? slug[0] : slug;
    fetch(`/api/products/${slugStr}`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  return (
    <Layout title="Edit Project - Admin">
      <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
        {loading ? (
          <p className="text-xs text-gray-400">Loading project...</p>
        ) : product ? (
          <ProductForm initialData={product} isNew={false} />
        ) : (
          <p className="text-xs text-red-500">Project not found.</p>
        )}
      </div>
    </Layout>
  );
}
