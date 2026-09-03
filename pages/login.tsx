import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { saveLoggedInUser, getLoggedInUser, logoutUser } from '../lib/clientAuth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingUser, setExistingUser] = useState<any | null>(null);

  useEffect(() => {
    const user = getLoggedInUser();
    if (user) {
      setExistingUser(user);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // 1. Save user info and admin key into localStorage & cookie
      saveLoggedInUser(data.user, data.token);

      // 2. Also establish NextAuth session
      try {
        await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
      } catch (authErr) {
        console.warn('NextAuth session sync warning:', authErr);
      }

      // 3. Redirect to admin or requested page
      const targetUrl = (router.query.callbackUrl as string) || '/admin';
      router.push(targetUrl);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = () => {
    logoutUser();
    setExistingUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-[#FFF5F8] via-[#F8F5FF] to-[#EFF2FF] relative overflow-hidden font-sans">
      <Head>
        <title>Admin Sign In - MechGirl</title>
        <meta name="description" content="Sign in to the MechGirl Admin Dashboard" />
      </Head>

      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Card Container */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-[0_20px_60px_rgba(45,35,70,0.08)] border border-white/60 relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block group">
            <span className="text-xl font-bold tracking-widest text-brandDark group-hover:opacity-80 transition-opacity">
              MECH<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">GIRL</span>
            </span>
          </Link>
          <h1 className="text-2xl font-semibold text-brandDark tracking-tight">Admin Portal</h1>
          <p className="text-xs text-gray-500">
            Sign in to manage activities, projects, users, and content
          </p>
        </div>

        {/* Existing Session Alert */}
        {existingUser ? (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              {existingUser.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={existingUser.image}
                  alt={existingUser.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover border border-purple-200"
                />
              )}
              <div className="text-left">
                <p className="text-xs font-semibold text-brandDark">{existingUser.name || 'Admin User'}</p>
                <p className="text-[11px] text-gray-500">{existingUser.email}</p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/admin"
                className="btn-primary text-xs py-2 px-4 text-center justify-center"
              >
                Proceed to Admin Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSwitchAccount}
                className="text-xs text-gray-500 hover:text-gray-800 transition-colors py-1"
              >
                Sign in with a different account
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                required
                type="email"
                placeholder="admin@mechgirl.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Password / Admin Key
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-purple-600 hover:text-purple-800 transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs font-semibold tracking-wider uppercase justify-center shadow-lg shadow-purple-200/50 transition-all disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-gray-400 border-t border-gray-100">
          <Link href="/" className="hover:text-purple-600 transition-colors inline-flex items-center gap-1">
            &larr; Back to MechGirl Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
