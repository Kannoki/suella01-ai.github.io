import type { NextApiRequest, NextApiResponse } from 'next';
import { submitContactMessage, getContactMessages } from '../../../lib/dataService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const messages = await getContactMessages();
      return res.status(200).json(messages);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch messages' });
    }
  }

  if (req.method === 'POST') {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    try {
      const created = await submitContactMessage({ name, email, subject, message });
      return res.status(201).json(created);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to send message' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
