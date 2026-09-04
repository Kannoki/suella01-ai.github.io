import type { NextApiRequest, NextApiResponse } from 'next';
import { getKnowledgeById, updateKnowledge, deleteKnowledge, confirmKnowledge } from '../../../lib/dataService';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid knowledge ID' });
  }

  if (req.method === 'GET') {
    try {
      const article = await getKnowledgeById(id);
      if (!article) {
        return res.status(404).json({ error: 'Knowledge article not found' });
      }
      return res.status(200).json(article);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch article' });
    }
  }

  if (req.method === 'PUT') {
    const isAuthed = await requireAuth(req, res);
    if (!isAuthed) return;

    try {
      // Check if this is a quick confirm/reject request
      if (typeof req.body.confirmed === 'boolean' && Object.keys(req.body).length <= 2) {
        const updated = await confirmKnowledge(id, req.body.confirmed);
        if (!updated) {
          return res.status(404).json({ error: 'Article not found' });
        }
        return res.status(200).json(updated);
      }

      const updated = await updateKnowledge(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Article not found' });
      }
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update article' });
    }
  }

  if (req.method === 'DELETE') {
    const isAuthed = await requireAuth(req, res);
    if (!isAuthed) return;

    try {
      const success = await deleteKnowledge(id);
      if (!success) {
        return res.status(404).json({ error: 'Article not found or already deleted' });
      }
      return res.status(200).json({ message: 'Knowledge article deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete article' });
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
