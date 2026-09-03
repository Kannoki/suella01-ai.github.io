import type { NextApiRequest, NextApiResponse } from 'next';
import { getActivities, createActivity } from '../../../lib/dataService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const activities = await getActivities();
      return res.status(200).json(activities);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch activities' });
    }
  }

  if (req.method === 'POST') {
    try {
      const newActivity = await createActivity(req.body);
      return res.status(201).json(newActivity);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create activity' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
