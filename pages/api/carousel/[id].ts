import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteCarouselSlide } from '../../../lib/dataService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idStr = Array.isArray(id) ? id[0] : id;

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!idStr) {
    return res.status(400).json({ error: 'Missing slide ID' });
  }

  try {
    const deleted = await deleteCarouselSlide(idStr);
    return res.status(200).json({ success: deleted });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete slide' });
  }
}
