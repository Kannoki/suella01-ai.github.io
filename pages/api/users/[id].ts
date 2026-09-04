import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById, updateUser, deleteUser } from '../../../lib/dataService';
import { requireAuth } from '../../../lib/auth';

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
      return res.status(200).json(user);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch user' });
    }
  }

  if (req.method === 'PUT') {
    const isAuthed = await requireAuth(req, res);
    if (!isAuthed) return;

    try {
      const updated = await updateUser(id, req.body);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update user' });
    }
  }

  if (req.method === 'DELETE') {
    const isAuthed = await requireAuth(req, res);
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
