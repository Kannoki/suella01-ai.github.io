import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserByEmail, getUsers, createUser, updateUser } from '../../../lib/dataService';
import { verifyPassword, hashPassword } from '../../../lib/passwords';
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
    const rawEmail = String(email).toLowerCase().trim();
    const normalizedEmail = (rawEmail === 'admin' || rawEmail === 'admin@mechgirl.com') ? 'admin@mechgirl.com' : rawEmail;

    let user = await getUserByEmail(normalizedEmail);

    // Fallback search for admin by id or role if primary lookup misses
    if (!user && (normalizedEmail === 'admin@mechgirl.com' || rawEmail === 'admin')) {
      const allUsers = await getUsers();
      user = allUsers.find((u) => u.role === Role.ADMIN || u.id === 'user-1') || null;
    }

    const adminKey = process.env.ADMIN_API_KEY || 'mechgirl-admin-2026';
    const adminPassword = process.env.ADMIN_PASSWORD || 'mechgirl-admin-2026';
    const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || adminKey;

    // Bootstrap if no user exists or initial admin is requested
    if (!user) {
      if ((password === bootstrapPassword || password === adminKey) && (normalizedEmail === 'admin@mechgirl.com' || rawEmail === 'admin')) {
        const passwordHash = await hashPassword(password);
        const created = await createUser({
          id: 'user-1',
          name: 'Minh Ngọc',
          email: 'admin@mechgirl.com',
          role: Role.ADMIN,
          passwordHash,
          tagline: 'Mechanical Engineering Student & STEM Advocate',
        });
        user = created;
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    const isAdmin = user.role === Role.ADMIN || user.id === 'user-1';

    let ok = false;
    if (user.passwordHash) {
      ok = await verifyPassword(password, user.passwordHash);
    }
    // Allow admin key/password directly for admin users
    if (!ok && isAdmin && (password === adminKey || password === adminPassword)) {
      ok = true;
      // Auto-repair passwordHash if missing
      if (!user.passwordHash) {
        try {
          const passwordHash = await hashPassword(password);
          await updateUser(user.id, { passwordHash });
        } catch {
          // Non-fatal
        }
      }
    }

    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: isAdmin ? adminKey : undefined,
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
