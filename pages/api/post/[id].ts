import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

// DELETE /api/post/:id
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const postId = req.query.id;
  if (!postId) {
    return res.status(400).json({ error: 'Missing post ID' });
  }

  if (!(await requireAuth(req, res))) return;

  try {
    const post = await prisma.post.delete({
      where: { id: String(postId) },
    });
    return res.status(200).json(post);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete post' });
  }
}
