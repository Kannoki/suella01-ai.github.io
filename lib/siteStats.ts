/**
 * siteStats.ts
 * Client-only helpers for:
 *   - Presence tracking  → real-time "online now" count
 *   - Session visit counter → cumulative total visits (once per browser session)
 *
 * Firestore layout:
 *   site_stats/global              { totalVisits: number }
 *   site_stats_presence/<uuid>     { alive: Timestamp }
 */

import { db } from './firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  where,
  increment,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

// ── Session identity ──────────────────────────────────────────────────────────

/** A stable random ID for this browser tab/session (survives soft navigations). */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('_mg_sid');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('_mg_sid', id);
  }
  return id;
}

// ── Presence (online now) ─────────────────────────────────────────────────────

const HEARTBEAT_MS = 30_000; // write presence every 30 s
let _presenceCleanup: (() => void) | null = null;

/**
 * Registers this browser session as "online".
 * Writes a heartbeat to `site_stats_presence/<sessionId>` every 30 s
 * and removes the doc on tab close.
 *
 * Idempotent — calling more than once per session is safe.
 *
 * @returns Cleanup function (clears heartbeat interval, deletes presence doc).
 */
export function registerPresence(): () => void {
  if (typeof window === 'undefined') return () => {};

  // Only register once per module lifetime
  if (_presenceCleanup) return _presenceCleanup;

  const sid = getSessionId();
  if (!sid) return () => {};

  const presenceRef = doc(db, 'site_stats_presence', sid);

  const writeHeartbeat = () =>
    setDoc(presenceRef, { alive: serverTimestamp() }).catch(() => {});

  writeHeartbeat();
  const interval = setInterval(writeHeartbeat, HEARTBEAT_MS);

  const cleanup = () => {
    clearInterval(interval);
    deleteDoc(presenceRef).catch(() => {});
    _presenceCleanup = null;
  };

  window.addEventListener('beforeunload', cleanup);

  _presenceCleanup = cleanup;
  return cleanup;
}

/**
 * Subscribes to a real-time count of sessions alive in the last 90 s.
 * Stale docs from crashed tabs are automatically excluded without a cloud sweeper.
 *
 * @param cb  Called immediately and on every change with the current online count.
 * @returns   Unsubscribe function.
 */
export function subscribeOnlineCount(cb: (count: number) => void): () => void {
  if (typeof window === 'undefined') {
    cb(0);
    return () => {};
  }

  const cutoff = Timestamp.fromDate(new Date(Date.now() - 90_000));
  const q = query(
    collection(db, 'site_stats_presence'),
    where('alive', '>=', cutoff),
  );

  return onSnapshot(
    q,
    (snap) => cb(snap.size),
    () => cb(0),
  );
}

// ── Total visits (session-scoped counter) ────────────────────────────────────

const VISIT_SESSION_KEY = '_mg_visited';

/**
 * Increments `site_stats/global.totalVisits` by 1 exactly once per browser
 * session (tracked via sessionStorage), then opens a real-time listener.
 *
 * @param cb  Called immediately and on every Firestore change with the running total.
 * @returns   Unsubscribe function.
 */
export function subscribeAndIncrementVisits(
  cb: (total: number) => void,
): () => void {
  if (typeof window === 'undefined') {
    cb(0);
    return () => {};
  }

  const globalRef = doc(db, 'site_stats', 'global');

  // Only increment once per browser session
  if (!sessionStorage.getItem(VISIT_SESSION_KEY)) {
    sessionStorage.setItem(VISIT_SESSION_KEY, '1');
    updateDoc(globalRef, { totalVisits: increment(1) }).catch(() => {
      // Doc might not exist yet — create it
      setDoc(globalRef, { totalVisits: 1 }, { merge: true }).catch(() => {});
    });
  }

  return onSnapshot(
    globalRef,
    (snap) => cb((snap.data()?.totalVisits as number) ?? 0),
    () => cb(0),
  );
}
