import type { NextApiRequest, NextApiResponse } from 'next';
import { getRegistrations, deleteRegistration } from '../../../lib/dataService';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const registrations = await getRegistrations();
      return res.status(200).json(registrations);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch registrations' });
    }
  }

  if (req.method === 'DELETE') {
    if (!(await requireAuth(req, res))) return;

    const { id } = req.query;
    const idStr = Array.isArray(id) ? id[0] : id;
    if (!idStr) {
      return res.status(400).json({ error: 'Missing registration ID' });
    }
    try {
      const deleted = await deleteRegistration(idStr);
      return res.status(200).json({ success: deleted });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete registration' });
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
