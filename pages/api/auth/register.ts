import type { NextApiRequest, NextApiResponse } from 'next';
import { saveLoggedInUser } from '../../../lib/clientAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // For this site, registration just creates a local profile.
  // In production you'd persist to DB; here we return a user object for localStorage.
  const user = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role: 'user',
    tagline: 'MechGirl Community Member',
    image: null,
    bio: '',
  };

  return res.status(200).json({
    success: true,
    message: 'Account created successfully',
    token: password,
    user,
  });
}
