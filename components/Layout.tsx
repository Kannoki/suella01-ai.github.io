import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({
  children,
  title = 'MechGirl - Dream it, Scheme it, STEM it',
  description = 'An open engineering platform designed to inspire and empower women in mechanical design, robotics, and technology.',
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-brandBg text-brandDark">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex-1 w-full">
        {children}
      </main>

      <Footer />
    </div>
  );
}
