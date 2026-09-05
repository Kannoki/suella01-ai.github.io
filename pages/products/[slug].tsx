import React from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { AnimatedSection } from '../../components/AnimatedSection';
import { getProductBySlug, type Product } from '../../lib/dataService';
import { sanitizeHtml } from '../../lib/sanitize';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.slug as string;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      product,
    },
  };
};

interface ProductDetailProps {
  product: Product;
}

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    Robotics: 'bg-purple-100 text-purple-700',
    Knowledge: 'bg-blue-100 text-blue-700',
    IoT: 'bg-emerald-100 text-emerald-700',
    Mechatronics: 'bg-orange-100 text-orange-700',
  };
  return map[cat] || 'bg-gray-100 text-gray-700';
}

export default function ProductDetail({ product }: ProductDetailProps) {
  return (
    <Layout
      title={`${product.title} - MechGirl Projects`}
      description={product.description}
    >
      <div className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Breadcrumb */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
          >
            &larr; Back to Projects
          </Link>

          {/* Hero Card */}
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-soft">
            {product.image && (
              <div className="h-72 md:h-96 w-full relative overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="p-6 md:p-10 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge ${categoryColor(product.category)}`}>
                  {product.category}
                </span>
                {product.featured && (
                  <span className="badge bg-amber-100 text-amber-700">Featured Project</span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold text-brandDark leading-tight">
                {product.title}
              </h1>

              <p className="text-base text-gray-600 font-light leading-relaxed">
                {product.description}
              </p>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-pastelPurple/30 text-purple-700 border border-purple-200/40"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-4">
                {product.demo && (
                  <a
                    href={product.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary inline-flex items-center gap-2 shadow-sm"
                  >
                    View Live Demo
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
                {product.github && (
                  <a
                    href={product.github}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline inline-flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    Source Code Repository
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Technical Documentation Content */}
          {product.content && (
            <AnimatedSection>
              <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-soft space-y-4">
                <h2 className="text-xl font-semibold text-brandDark pb-2 border-b border-gray-100">
                  Technical Architecture &amp; Implementation
                </h2>
                <div
                  className="prose-custom"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.content) }}
                />
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </Layout>
  );
}
