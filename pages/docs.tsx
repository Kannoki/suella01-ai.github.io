import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { swaggerSpec } from '../lib/swaggerSpec';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI to prevent SSR window reference errors
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 gap-3">
      <div className="w-8 h-8 border-4 border-pastelPink border-t-brandDark rounded-full animate-spin" />
      <p className="text-sm font-medium">Loading API documentation and interactive console...</p>
    </div>
  ),
});

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Head>
        <title>API Documentation & Management | MechGirl</title>
        <meta
          name="description"
          content="Interactive OpenAPI 3.0 documentation and management interface for MechGirl APIs."
        />
      </Head>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-lg bg-brandDark text-white font-bold flex items-center justify-center text-sm shadow group-hover:scale-105 transition-transform">
                MG
              </span>
              <span className="font-semibold text-lg text-brandDark tracking-tight">
                MechGirl <span className="text-xs font-normal text-gray-500 ml-1">API Docs</span>
              </span>
            </Link>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              OpenAPI 3.0.3
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/openapi.json"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-brandDark px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors font-medium flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Raw Spec (JSON)
            </a>
            <Link
              href="/admin"
              className="text-xs text-gray-700 hover:text-brandDark px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors font-medium"
            >
              Admin Dashboard
            </Link>
            <Link
              href="/"
              className="text-xs bg-brandDark text-white px-3.5 py-1.5 rounded-md hover:bg-opacity-90 transition-colors font-medium shadow-sm"
            >
              Back to Site
            </Link>
          </div>
        </div>
      </header>

      {/* Main Swagger UI Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-4 sm:p-6 lg:p-8">
          <div className="swagger-ui-wrapper">
            <SwaggerUI spec={swaggerSpec} />
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-200 bg-white">
        MechGirl API Console &bull; Live execution enabled &bull; Powered by OpenAPI &amp; Swagger UI
      </footer>

      <style jsx global>{`
        .swagger-ui-wrapper .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui-wrapper .swagger-ui {
          font-family: inherit;
        }
        .swagger-ui-wrapper .swagger-ui .info {
          margin: 10px 0 24px;
        }
        .swagger-ui-wrapper .swagger-ui .info .title {
          color: #1a1a1a;
          font-weight: 700;
        }
        .swagger-ui-wrapper .swagger-ui .opblock {
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          margin-bottom: 14px;
        }
        .swagger-ui-wrapper .swagger-ui .btn {
          border-radius: 6px;
        }
        .swagger-ui-wrapper .swagger-ui select {
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
