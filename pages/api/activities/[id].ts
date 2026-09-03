import type { NextApiRequest, NextApiResponse } from 'next';
import { getActivityBySlug, updateActivity, deleteActivity } from '../../../lib/dataService';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idStr = Array.isArray(id) ? id[0] : id;

  if (!idStr) {
    return res.status(400).json({ error: 'Missing activity ID or slug' });
  }

  if (req.method === 'GET') {
    try {
      const activity = await getActivityBySlug(idStr);
      if (!activity) {
        return res.status(404).json({ error: 'Activity not found' });
      }
      return res.status(200).json(activity);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch activity' });
    }
  }

  if (req.method === 'PUT') {
    if (!(await requireAuth(req, res))) return;

    try {
      const updated = await updateActivity(idStr, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Activity not found' });
      }
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update activity' });
    }
  }

  if (req.method === 'DELETE') {
    if (!(await requireAuth(req, res))) return;

    try {
      const deleted = await deleteActivity(idStr);
      return res.status(200).json({ success: deleted });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete activity' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
