import type { NextApiRequest, NextApiResponse } from 'next';
import { getCarouselSlides, addCarouselSlide } from '../../../lib/dataService';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const slides = await getCarouselSlides();
      return res.status(200).json(slides);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch slides' });
    }
  }

  if (req.method === 'POST') {
    if (!(await requireAuth(req, res))) return;

    try {
      const newSlide = await addCarouselSlide(req.body);
      return res.status(201).json(newSlide);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to add slide' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
