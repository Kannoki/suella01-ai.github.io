import type { NextApiRequest, NextApiResponse } from 'next';
import { getAboutProfile, updateAboutProfile } from '../../../lib/dataService';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const profile = await getAboutProfile();
      return res.status(200).json(profile);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch about profile' });
    }
  }

  if (req.method === 'PUT') {
    if (!(await requireAuth(req, res))) return;

    try {
      const updated = await updateAboutProfile(req.body);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update about profile' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
