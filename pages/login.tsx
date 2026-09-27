import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { saveLoggedInUser, getLoggedInUser, logoutUser } from '../lib/clientAuth';

// ─── types ───────────────────────────────────────────────────────────────────
type Mode = 'signin' | 'signup';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  image?: string | null;
  tagline?: string;
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

const UserCircleIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AdminIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

// ─── Sub-components (must be at module scope — NOT inside LoginPage —
//     otherwise React sees a new component type on every render, which
//     unmounts + remounts inputs causing them to lose focus on each keystroke)

function ModeToggle({ mode, switchMode }: { mode: Mode; switchMode: (m: Mode) => void }) {
  return (
    <div className="flex p-1 bg-gray-100/80 rounded-full gap-1">
      {(['signin', 'signup'] as Mode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => switchMode(m)}
          className={`flex-1 py-1.5 px-4 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${mode === m
            ? 'bg-white text-brandDark shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          {m === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>
      ))}
    </div>
  );
}

function ErrorAlert({ msg }: { msg: string }) {
  return (
    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
      <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{msg}</span>
    </div>
  );
}

function SuccessAlert({ msg }: { msg: string }) {
  return (
    <div className="p-3.5 rounded-2xl bg-green-50 border border-green-200 text-xs text-green-700 flex items-center gap-2">
      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{msg}</span>
    </div>
  );
}

interface FieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  trailing?: React.ReactNode;
}

function Field({ label, id, type = 'text', placeholder, value, onChange, autoComplete, trailing }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          required
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="input-field text-sm pr-10"
        />
        {trailing && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {trailing}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [existingUser, setExistingUser] = useState<StoredUser | null>(null);

  // Sign-in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Sign-up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  useEffect(() => {
    const user = getLoggedInUser();
    if (user) setExistingUser(user);
  }, []);

  // Switch mode and reset errors
  const switchMode = (m: Mode) => {
    setMode(m);
    setSignInError(null);
    setSignUpError(null);
    setSignUpSuccess(false);
  };

  // ── Sign-in handler ──────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    setSignInLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signInEmail, password: signInPassword }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      saveLoggedInUser(data.user, data.token);

      // Sync NextAuth session (best-effort)
      try {
        await signIn('credentials', { email: signInEmail, password: signInPassword, redirect: false });
      } catch (e) {
        console.warn('NextAuth session sync warning:', e);
      }

      const target = (router.query.callbackUrl as string) || '/admin';
      router.push(target);
    } catch (err: any) {
      setSignInError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setSignInLoading(false);
    }
  };

  // ── Sign-up handler ──────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (signUpPassword !== signUpConfirm) {
      setSignUpError('Passwords do not match.');
      return;
    }
    if (signUpPassword.length < 6) {
      setSignUpError('Password must be at least 6 characters.');
      return;
    }

    setSignUpLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: signUpName, email: signUpEmail, password: signUpPassword }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      saveLoggedInUser(data.user, data.token);

      // Sync NextAuth session (best-effort)
      try {
        await signIn('credentials', { email: signUpEmail, password: signUpPassword, redirect: false });
      } catch (e) {
        console.warn('NextAuth session sync warning:', e);
      }

      setSignUpSuccess(true);

      // After 1.5 s, switch to sign-in view showing the new account
      setTimeout(() => {
        setExistingUser(data.user);
      }, 1500);
    } catch (err: any) {
      setSignUpError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSignUpLoading(false);
    }
  };

  // ── Switch account ─────────────────────────────────────────────────────
  const handleSwitchAccount = () => {
    logoutUser();
    setExistingUser(null);
    setSignInEmail('');
    setSignInPassword('');
  };

  // ── Initials avatar fallback ──────────────────────────────────────────
  const initials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-[#FFF5F8] via-[#F8F5FF] to-[#EFF2FF] relative overflow-hidden font-sans">
      <Head>
        <title>{mode === 'signin' ? 'Sign In' : 'Sign Up'} — MechGirl</title>
        <meta name="description" content="Sign in or create an account on MechGirl" />
      </Head>

      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-[0_20px_60px_rgba(45,35,70,0.10)] border border-white/60 relative z-10 space-y-6">

        {/* Brand */}
        <div className="text-center space-y-1">
          <Link href="/" className="inline-block group">
            <span className="text-xl font-bold tracking-widest text-brandDark group-hover:opacity-80 transition-opacity">
              MECH<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">GIRL</span>
            </span>
          </Link>
          <p className="text-xs text-gray-400">
            {mode === 'signin' ? 'Sign in to access your dashboard' : 'Create your MechGirl community account'}
          </p>
        </div>

        {/* ── Logged-in card (shown when a session is already saved) ──────── */}
        {existingUser ? (
          <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100 text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              {existingUser.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={existingUser.image}
                  alt={existingUser.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-300 shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {initials(existingUser.name || 'MG')}
                </div>
              )}
              <div className="text-left">
                <p className="text-sm font-semibold text-brandDark">{existingUser.name}</p>
                <p className="text-xs text-gray-500">{existingUser.email}</p>
                <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${existingUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'
                  }`}>
                  {existingUser.role || 'user'}
                </span>
              </div>
            </div>

            <div className="pt-1 flex flex-col gap-2">
              {existingUser.role === 'admin' && (
                <Link
                  href="/admin"
                  className="btn-primary text-xs py-2.5 px-4 text-center flex items-center justify-center gap-1.5"
                >
                  <AdminIcon />
                  Go to Admin Dashboard
                </Link>
              )}
              <Link
                href="/about"
                className="px-4 py-2 rounded-full text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-white transition-colors flex items-center justify-center gap-1.5"
              >
                <UserCircleIcon />
                View Profile
              </Link>
              <button
                type="button"
                onClick={handleSwitchAccount}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
              >
                Sign out of this account
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Mode toggle ────────────────────────────────────────────── */}
            <ModeToggle mode={mode} switchMode={switchMode} />

            {/* ── Sign In form ────────────────────────────────────────────── */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                {signInError && <ErrorAlert msg={signInError} />}

                <Field
                  id="signin-email"
                  label="Email Address"
                  type="email"
                  placeholder="admin@mechgirl.com"
                  value={signInEmail}
                  onChange={setSignInEmail}
                  autoComplete="email"
                />

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="signin-password" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Password / Admin Key
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="text-[11px] text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1"
                    >
                      <EyeIcon open={showSignInPassword} />
                      {showSignInPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="signin-password"
                    required
                    type={showSignInPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    autoComplete="current-password"
                    className="input-field text-sm"
                  />
                </div>

                <button
                  type="submit"
                  id="signin-submit"
                  disabled={signInLoading}
                  className="btn-primary w-full py-3 text-xs font-semibold tracking-wider uppercase justify-center shadow-lg shadow-purple-200/50 transition-all disabled:opacity-60"
                >
                  {signInLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <p className="text-center text-[11px] text-gray-400">
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => switchMode('signup')} className="text-purple-600 hover:underline font-medium">
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* ── Sign Up form ────────────────────────────────────────────── */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                {signUpError && <ErrorAlert msg={signUpError} />}
                {signUpSuccess && <SuccessAlert msg="Account created! Redirecting…" />}

                <Field
                  id="signup-name"
                  label="Full Name"
                  type="text"
                  placeholder="Your Name"
                  value={signUpName}
                  onChange={setSignUpName}
                  autoComplete="name"
                />

                <Field
                  id="signup-email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={signUpEmail}
                  onChange={setSignUpEmail}
                  autoComplete="email"
                />

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="signup-password" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="text-[11px] text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1"
                    >
                      <EyeIcon open={showSignUpPassword} />
                      {showSignUpPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="signup-password"
                    required
                    type={showSignUpPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    autoComplete="new-password"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="signup-confirm" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm"
                    required
                    type={showSignUpPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={signUpConfirm}
                    onChange={(e) => setSignUpConfirm(e.target.value)}
                    autoComplete="new-password"
                    className="input-field text-sm"
                  />
                </div>

                <button
                  type="submit"
                  id="signup-submit"
                  disabled={signUpLoading || signUpSuccess}
                  className="btn-primary w-full py-3 text-xs font-semibold tracking-wider uppercase justify-center shadow-lg shadow-purple-200/50 transition-all disabled:opacity-60"
                >
                  {signUpLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <p className="text-center text-[11px] text-gray-400">
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('signin')} className="text-purple-600 hover:underline font-medium">
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </>
        )}

        {/* Footer link */}
        <div className="pt-2 text-center text-xs text-gray-400 border-t border-gray-100">
          <Link href="/" className="hover:text-purple-600 transition-colors inline-flex items-center gap-1">
            ← Back to MechGirl Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
