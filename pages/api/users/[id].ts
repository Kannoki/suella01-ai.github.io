import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { getUserById, updateUser, deleteUser } from '../../../lib/dataService';
import { checkAuth } from '../../../lib/auth';
import { authOptions } from '../auth/[...nextauth]';
import { Role } from '../../../prisma/generated/enums';

/**
 * Returns true if the request is authenticated as an admin (either via API key
 * or a NextAuth session whose user has role === Role.ADMIN).
 */
async function isAdminRequest(req: NextApiRequest): Promise<boolean> {
  // First, fast path: API key / cookie via lib/auth.ts
  const ok = await checkAuth(req);
  if (!ok) return false;

  // Additionally check the role for role-gated updates (e.g. role/passwordHash changes)
  try {
    const session: any = await getServerSession(req, ({} as unknown) as any, authOptions);
    if (session?.user?.role === Role.ADMIN) return true;
  } catch {
    // ignore
  }

  // If authenticated via API key only (no NextAuth session), allow self-service
  // updates below — but never allow role or passwordHash changes without a
  // verified admin session.
  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (req.method === 'GET') {
    try {
      const user = await getUserById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const { passwordHash, ...safe } = user as any;
      return res.status(200).json(safe);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch user' });
    }
  }

  if (req.method === 'PUT') {
    const isAuthed = await checkAuth(req);
    if (!isAuthed) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Privilege-escalation guard: only an admin (NextAuth session with role==='admin')
    // may change `role` or `passwordHash`. API-key-only callers are rejected for these fields.
    const adminOnly = ['role', 'passwordHash'];
    const bodyKeys = Object.keys(req.body || {});
    const hasAdminField = adminOnly.some((k) => bodyKeys.includes(k));
    if (hasAdminField) {
      const admin = await isAdminRequest(req);
      if (!admin) {
        return res.status(403).json({
          error: 'Only administrators may change role or password.',
        });
      }
    }

    try {
      const updated = await updateUser(id, req.body);
      const { passwordHash, ...safe } = updated as any;
      return res.status(200).json(safe);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update user' });
    }
  }

  if (req.method === 'DELETE') {
    const isAuthed = await checkAuth(req);
    if (!isAuthed) return;

    try {
      const success = await deleteUser(id);
      if (!success) {
        return res.status(404).json({ error: 'User not found or already deleted' });
      }
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete user' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};
