import type { NextApiRequest, NextApiResponse } from 'next';
import { getContactInfo, updateContactInfo } from '../../../lib/dataService';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const contact = await getContactInfo();
      return res.status(200).json(contact);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch contact info' });
    }
  }

  if (req.method === 'PUT') {
    if (!(await requireAuth(req, res))) return;

    try {
      const updated = await updateContactInfo(req.body);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update contact info' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
