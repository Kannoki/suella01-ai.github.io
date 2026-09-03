import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

// PUT /api/publish/:id
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const postId = req.query.id;
  if (!postId) {
    return res.status(400).json({ error: 'Missing post ID' });
  }

  if (!(await requireAuth(req, res))) return;

  try {
    const post = await prisma.post.update({
      where: { id: String(postId) },
      data: { published: true },
    });
    return res.status(200).json(post);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to publish post' });
  }
}
