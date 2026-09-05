import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserByEmail, createUser } from '../../../lib/dataService';
import { hashPassword } from '../../../lib/passwords';
import { Role } from '../../../prisma/generated/enums';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // Basic email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Reject duplicate emails
    const existing = await getUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const passwordHash = await hashPassword(password);

    const created = await createUser({
      name: String(name).trim(),
      email: normalizedEmail,
      role: Role.USER,
      passwordHash,
      tagline: 'MechGirl Community Member',
    });

    // Return a non-sensitive payload (no passwordHash) — the client logs the user in
    // and stores the JWT from NextAuth, not a raw password.
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        tagline: created.tagline,
        image: created.image,
        bio: created.bio,
      },
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[/api/auth/register] error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again later.' });
  }
}
