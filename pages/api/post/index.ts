import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getSession } from 'next-auth/react';
import { checkAuth } from '../../../lib/auth';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const isAuthed = await checkAuth(req);
  if (!isAuthed) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required to create post.' });
  }

  const { title, content } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const session = await getSession({ req });
  const authorEmail = session?.user?.email;

  try {
    const result = await prisma.post.create({
      data: {
        title,
        content: content || '',
        ...(authorEmail ? { author: { connect: { email: authorEmail } } } : {}),
      },
    });
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create post' });
  }
}
