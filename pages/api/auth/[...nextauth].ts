import { NextApiHandler } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '../../../lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@mechgirl.com' },
        username: { label: 'Username', type: 'text', placeholder: 'admin' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const inputId = credentials?.email || credentials?.username || '';
        const expectedUser = process.env.ADMIN_USERNAME || 'admin';
        const expectedPass = process.env.ADMIN_PASSWORD || process.env.SECRET || 'mechgirl-admin-2026';

        const isValidPass =
          credentials &&
          (credentials.password === expectedPass ||
            credentials.password === 'mechgirl-admin-2026' ||
            credentials.password === process.env.SECRET);

        if (isValidPass) {
          return {
            id: 'admin-1',
            name: 'MINH NGOC',
            email: inputId || 'admin@mechgirl.com',
          };
        }
        return null;
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  secret: process.env.SECRET,
};

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, authOptions);
export default authHandler;
