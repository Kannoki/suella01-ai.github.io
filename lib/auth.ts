import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

// Default keys for development / fallback if not configured in .env
const VALID_KEYS = new Set([
  process.env.ADMIN_API_KEY,
  process.env.SECRET,
  'mechgirl-admin-2026',
  'mechgirl-suella-secret-key-32charsmin!',
].filter(Boolean) as string[]);

/**
 * Checks whether the incoming Next.js API request has valid authentication:
 * 1. An active NextAuth user session.
 * 2. An Authorization header with Bearer token matching an admin key.
 * 3. An x-admin-key header matching an admin key.
 * 4. An admin_token cookie matching an admin key.
 */
export async function checkAuth(req: NextApiRequest): Promise<boolean> {
  // 1. Check NextAuth session
  try {
    const session = await getSession({ req });
    if (session && session.user) {
      return true;
    }
  } catch {
    // Session check failed or unconfigured, continue checking API keys
  }

  // 2. Check Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.substring(7).trim();
    if (VALID_KEYS.has(token)) {
      return true;
    }
  }

  // 3. Check x-admin-key: <key>
  const customKey = req.headers['x-admin-key'];
  if (typeof customKey === 'string' && VALID_KEYS.has(customKey.trim())) {
    return true;
  }

  // 4. Check admin_token cookie
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)admin_token=([^;]+)/);
    if (match) {
      const cookieVal = decodeURIComponent(match[1]).trim();
      if (VALID_KEYS.has(cookieVal)) {
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
  const isAuthed = await checkAuth(req);
  if (!isAuthed) {
    res.status(401).json({
      error: 'Unauthorized: Authentication required to edit data.',
      message:
        'Please sign in via NextAuth or provide a valid Bearer token or x-admin-key header.',
    });
    return false;
  }
  return true;
}
