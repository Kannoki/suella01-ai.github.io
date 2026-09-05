import type { NextApiRequest, NextApiResponse } from 'next';
import { registerForActivity } from '../../../../lib/dataService';

// In-process rate limiter: max 5 registration attempts per IP per 5 minutes.
const attemptsByIp = new Map<string, number[]>();
const RATE_WINDOW_MS = 5 * 60_000;
const RATE_MAX = 5;

function clientIp(req: NextApiRequest): string {
  const xf = (req.headers['x-forwarded-for'] as string) || '';
  return (xf.split(',')[0] || '').trim() || req.socket.remoteAddress || 'unknown';
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (attemptsByIp.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) {
    attemptsByIp.set(ip, arr);
    return true;
  }
  arr.push(now);
  attemptsByIp.set(ip, arr);
  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idStr = Array.isArray(id) ? id[0] : id;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!idStr) {
    return res.status(400).json({ error: 'Missing activity identifier' });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    res.setHeader('Retry-After', Math.ceil(RATE_WINDOW_MS / 1000).toString());
    return res.status(429).json({ error: 'Too many registration attempts. Please try again later.' });
  }

  const { name, email, phone, address } = req.body || {};
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required fields' });
  }
  if (typeof name !== 'string' || name.length > 200) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (typeof phone !== 'string' || phone.length > 50) {
    return res.status(400).json({ error: 'Invalid phone' });
  }

  try {
    const success = await registerForActivity(idStr, {
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      phone: String(phone).trim(),
      address: address ? String(address).slice(0, 500) : '',
    });
    if (!success) {
      return res.status(409).json({ error: 'Activity is full or no longer accepting registrations' });
    }
    return res.status(200).json({ success: true, message: 'Successfully registered' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
}
