import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserByEmail } from '../../../lib/dataService';
import { verifyPassword, hashPassword } from '../../../lib/passwords';
import prisma from '../../../lib/prisma';
import { Role } from '../../../prisma/generated/enums';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await getUserByEmail(String(email).toLowerCase().trim());

    // First-time bootstrap: if no user record exists yet and the caller knows the
    // ADMIN_BOOTSTRAP_PASSWORD, create the initial admin. This only fires the
    // very first time (no user row exists) and the env var is set, so a leaked
    // password alone is not enough.
    if (!user) {
      const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
      if (bootstrapPassword && password === bootstrapPassword) {
        const existingAny = await prisma.user.count();
        if (existingAny === 0) {
          const passwordHash = await hashPassword(bootstrapPassword);
          const created = await prisma.user.create({
            data: {
              name: 'Administrator',
              email: String(email).toLowerCase().trim(),
              role: Role.ADMIN,
              passwordHash,
              tagline: 'Site Administrator',
            },
            select: { id: true, name: true, email: true, role: true, tagline: true, image: true, bio: true },
          });
          return res.status(200).json({
            success: true,
            message: 'Bootstrap admin account created',
            user: created,
          });
        }
      }
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.passwordHash) {
      // User exists but has no password set (e.g. legacy OAuth-only account)
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return the user profile only — never echo the plaintext password as a token.
    // Client uses NextAuth signIn() with the credentials to obtain a real session JWT.
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || Role.USER,
        tagline: user.tagline || '',
        image: user.image || null,
        bio: user.bio || '',
      },
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[/api/auth/login] error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
}
