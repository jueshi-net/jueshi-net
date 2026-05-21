// Fix: trust the request host to avoid UntrustedHost errors
// when NEXTAUTH_URL domain doesn't match the actual domain jueshi.net
process.env.AUTH_TRUST_HOST = 'true';

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import * as bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use JWT session strategy (no DB session table needed)
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;
        const name = credentials.name as string | undefined;

        const userRecord = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true, email: true, name: true, password: true,
            role: true,
          },
        });

        if (userRecord) {
          if (!userRecord.password) return null;
          const isValid = await bcrypt.compare(password, userRecord.password);
          if (!isValid) return null;
          return {
            id: userRecord.id,
            email: userRecord.email,
            name: userRecord.name,
            role: userRecord.role,
          };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
          data: {
            email,
            name: name || email.split("@")[0],
            password: hashedPassword,
            role: "user",
          },
        });

        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.subdomain = (user as any).subdomain;
      }
      if (trigger === "update" && session) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).subdomain = token.subdomain;
      }
      return session;
    },
  },
});
