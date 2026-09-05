import type { NextApiRequest, NextApiResponse } from 'next';
import { submitContactMessage, getContactMessages } from '../../../lib/dataService';
import { checkAuth } from '../../../lib/auth';

// Tiny in-process rate limiter. One submission per IP per minute is enough to
// deter casual abuse without blocking legitimate visitors.
const recentByIp = new Map<string, number>();
const RATE_WINDOW_MS = 60_000;

function clientIp(req: NextApiRequest): string {
  const xf = (req.headers['x-forwarded-for'] as string) || '';
  return (xf.split(',')[0] || '').trim() || req.socket.remoteAddress || 'unknown';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Admin-only: list submitted contact messages
    const isAuthed = await checkAuth(req);
    if (!isAuthed) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    try {
      const messages = await getContactMessages();
      return res.status(200).json(messages);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch messages' });
    }
  }

  if (req.method === 'POST') {
    const ip = clientIp(req);
    const now = Date.now();
    const last = recentByIp.get(ip) || 0;
    if (now - last < RATE_WINDOW_MS) {
      res.setHeader('Retry-After', Math.ceil((RATE_WINDOW_MS - (now - last)) / 1000).toString());
      return res.status(429).json({ error: 'Please wait a moment before sending another message.' });
    }

    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    if (typeof name !== 'string' || name.length > 200) {
      return res.status(400).json({ error: 'Invalid name' });
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (typeof message !== 'string' || message.length > 5000) {
      return res.status(400).json({ error: 'Message must be 5000 characters or fewer' });
    }
    try {
      const created = await submitContactMessage({
        name: String(name).trim(),
        email: String(email).toLowerCase().trim(),
        subject: subject ? String(subject).slice(0, 200) : '',
        message: String(message).trim(),
      });
      recentByIp.set(ip, now);
      return res.status(201).json({ success: true, message: 'Message received. We will be in touch.' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to send message' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
