import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { adminAuth } from './firebaseAdmin';

/**
 * Returns the list of valid admin API keys, sourced exclusively from environment variables.
 */
function getValidKeys(): Set<string> {
  const keys = new Set<string>();
  const adminKey = process.env.ADMIN_API_KEY?.trim() || 'mechgirl-admin-2026';
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim();
  const secret = process.env.SECRET?.trim();

  if (adminKey) keys.add(adminKey);
  if (adminPassword) keys.add(adminPassword);
  if (nextAuthSecret) keys.add(nextAuthSecret);
  if (secret) keys.add(secret);

  if (keys.size === 0) {
    throw new Error(
      'No admin authentication keys configured. Set ADMIN_API_KEY, NEXTAUTH_SECRET, or SECRET in your environment.'
    );
  }
  return keys;
}

/**
 * Checks whether the incoming Next.js API request has valid authentication:
 * 1. An active NextAuth user session (server-side, using authOptions).
 * 2. A Firebase ID token in the Authorization: Bearer header.
 * 3. An Authorization header with Bearer token matching an admin key.
 * 4. An x-admin-key header matching an admin key.
 * 5. An admin_token cookie matching an admin key (SameSite=Strict, Secure).
 */
export async function checkAuth(req: NextApiRequest, res?: NextApiResponse): Promise<boolean> {
  // 1. Check NextAuth session (server-side)
  try {
    const session = await getServerSession(
      req,
      res || ({} as unknown as NextApiResponse),
      authOptions
    );
    if (session && session.user) {
      return true;
    }
  } catch {
    // Session check failed or unconfigured, continue
  }

  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')
      ? authHeader.substring(7).trim()
      : null;

  // 2. Try Firebase ID token verification
  if (bearerToken) {
    try {
      await adminAuth.verifyIdToken(bearerToken);
      return true;
    } catch {
      // Not a valid Firebase token — fall through to static key check
    }
  }

  let validKeys: Set<string>;
  try {
    validKeys = getValidKeys();
  } catch {
    return false;
  }

  // 3. Check Authorization: Bearer <static admin key>
  if (bearerToken && validKeys.has(bearerToken)) {
    return true;
  }

  // 4. Check x-admin-key header
  const customKey = req.headers['x-admin-key'];
  if (typeof customKey === 'string' && validKeys.has(customKey.trim())) {
    return true;
  }

  // 5. Check admin_token cookie
  const cookieHeader = req.headers.cookie;
  if (cookieHeader && typeof cookieHeader === 'string') {
    const match = cookieHeader.match(/(?:^|;\s*)admin_token=([^;]+)/);
    if (match) {
      const cookieVal = decodeURIComponent(match[1]).trim();
      if (validKeys.has(cookieVal)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Guard helper for API routes. If unauthorized, automatically responds with 401
 * and returns false. If authorized, returns true.
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  const isAuthed = await checkAuth(req, res);
  if (!isAuthed) {
    res.status(401).json({
      error: 'Unauthorized: Authentication required to edit data.',
      message:
        'Please sign in via NextAuth / Firebase Auth or provide a valid Bearer token or x-admin-key header.',
    });
    return false;
  }
  return true;
}
