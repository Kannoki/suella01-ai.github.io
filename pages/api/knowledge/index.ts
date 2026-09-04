import type { NextApiRequest, NextApiResponse } from 'next';
import { getKnowledgeList, createKnowledge } from '../../../lib/dataService';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { status, authorEmail, search } = req.query;
      const list = await getKnowledgeList({
        status: typeof status === 'string' ? status : undefined,
        authorEmail: typeof authorEmail === 'string' ? authorEmail : undefined,
        search: typeof search === 'string' ? search : undefined,
      });
      return res.status(200).json(list);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch knowledge articles' });
    }
  }

  if (req.method === 'POST') {
    const isAuthed = await requireAuth(req, res);
    if (!isAuthed) return;

    try {
      const { title, category, summary, content, image, tags, authorId, authorName, authorEmail, authorImage, status } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const created = await createKnowledge({
        title,
        category: category || 'Engineering',
        summary: summary || '',
        content,
        image: image || null,
        status: status || 'pending',
        authorId: authorId || null,
        authorName: authorName || 'Community Member',
        authorEmail: authorEmail || null,
        authorImage: authorImage || null,
        tags: Array.isArray(tags) ? tags : [],
      });

      return res.status(201).json(created);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create knowledge article' });
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
