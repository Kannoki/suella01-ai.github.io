import type { NextApiRequest, NextApiResponse } from 'next';
import { getKnowledgeList, createKnowledge } from '../../../lib/dataService';
import { requireAuth } from '../../../lib/auth';
import { KnowledgeCategory, KnowledgeStatus } from '../../../prisma/generated/enums';

/**
 * Strips author PII (email) from knowledge articles before returning them publicly.
 * Email is only needed for admin moderation views and should never be exposed to anonymous visitors.
 */
function sanitizeKnowledgeForPublic(article: any) {
  if (!article) return article;
  const { authorEmail, ...safe } = article;
  return safe;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { status, authorEmail, search } = req.query;
      let statusFilter: KnowledgeStatus | 'all' | undefined = undefined;
      if (typeof status === 'string') {
        const s = status.toUpperCase();
        if (status === 'all') {
          statusFilter = 'all';
        } else if (s === 'CONFIRMED') {
          statusFilter = KnowledgeStatus.CONFIRMED;
        } else if (s === 'PENDING') {
          statusFilter = KnowledgeStatus.PENDING;
        } else if (s === 'REJECTED') {
          statusFilter = KnowledgeStatus.REJECTED;
        }
      }
      const list = await getKnowledgeList({
        status: statusFilter,
        authorEmail: typeof authorEmail === 'string' ? authorEmail : undefined,
        search: typeof search === 'string' ? search : undefined,
      });
      // Strip authorEmail from every public article
      return res.status(200).json(list.map(sanitizeKnowledgeForPublic));
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
        category: category || KnowledgeCategory.ENGINEERING,
        summary: summary || '',
        content,
        image: image || null,
        status: status || KnowledgeStatus.PENDING,
        authorId: authorId || null,
        authorName: authorName || 'Community Member',
        authorEmail: authorEmail || null,
        authorImage: authorImage || null,
        tags: Array.isArray(tags) ? tags : [],
      });

      return res.status(201).json(sanitizeKnowledgeForPublic(created));
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
