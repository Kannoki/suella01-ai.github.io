import type { NextApiRequest, NextApiResponse } from 'next';
import { getUsers, createUser } from '../../../lib/dataService';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const users = await getUsers();
      return res.status(200).json(users);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch users' });
    }
  }

  if (req.method === 'POST') {
    const isAuthed = await requireAuth(req, res);
    if (!isAuthed) return;

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
        role: role || 'user',
        timeline: timeline || [],
      });

      return res.status(201).json(created);
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
