import { NextApiHandler } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '../../../lib/prisma';
import { verifyPassword } from '../../../lib/passwords';
import { Role } from '../../../prisma/generated/enums';

// Ensure a secret is configured at boot — fail fast rather than silently accepting misconfigured deployments.
const authSecret = process.env.NEXTAUTH_SECRET || process.env.SECRET;
if (!authSecret) {
  // eslint-disable-next-line no-console
  console.warn(
    '[nextauth] WARNING: NEXTAUTH_SECRET / SECRET is not set. JWT sessions will be insecure.'
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@mechgirl.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.passwordHash) return null;
          const ok = await verifyPassword(password, user.passwordHash);
          if (!ok) return null;
          return {
            id: user.id,
            name: user.name || undefined,
            email: user.email || undefined,
            image: user.image || undefined,
          };
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[nextauth] credentials authorize error:', err);
          return null;
        }
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  secret: authSecret,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Persist role + id on the JWT for downstream authorization checks
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        // Look up the role on each request so role changes propagate immediately
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          });
          (session.user as any).role = dbUser?.role || Role.USER;
        } catch {
          (session.user as any).role = Role.USER;
        }
      }
      return session;
    },
  },
};

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, authOptions);
export default authHandler;
