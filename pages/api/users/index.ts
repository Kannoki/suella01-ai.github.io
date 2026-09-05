import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { getUsers, createUser } from '../../../lib/dataService';
import { checkAuth } from '../../../lib/auth';
import { authOptions } from '../auth/[...nextauth]';
import { Role } from '../../../prisma/generated/enums';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const users = await getUsers();
      // Strip sensitive fields like passwordHash from the response
      return res.status(200).json(users.map(({ passwordHash, ...rest }) => rest));
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch users' });
    }
  }

  if (req.method === 'POST') {
    const isAuthed = await checkAuth(req);
    if (!isAuthed) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Only admin (NextAuth session with role === Role.ADMIN) can create users
    let isAdmin = false;
    try {
      const session: any = await getServerSession(req, ({} as unknown) as any, authOptions);
      if (session?.user?.role === Role.ADMIN) isAdmin = true;
    } catch {
      // ignore
    }
    if (!isAdmin) {
      return res.status(403).json({
        error: 'Only administrators can create user accounts.',
      });
    }

    try {
      const { name, email, image, tagline, bio, role, timeline } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const created = await createUser({
        name,
        email: email || null,
        image: image || null,
        tagline: tagline || null,
        bio: bio || null,
        role: role || Role.USER,
        timeline: timeline || [],
      });

      const { passwordHash, ...safe } = created as any;
      return res.status(201).json(safe);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create user' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};
