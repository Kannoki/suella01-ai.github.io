import type { NextApiRequest, NextApiResponse } from 'next';
import { registerForActivity } from '../../../../lib/dataService';

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

  const { name, email, phone, address } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required fields' });
  }

  try {
    const success = await registerForActivity(idStr, { name, email, phone, address });
    if (!success) {
      return res.status(400).json({ error: 'Registration could not be completed' });
    }
    return res.status(200).json({ success: true, message: 'Successfully registered' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
}
