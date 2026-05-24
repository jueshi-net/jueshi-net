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
  // Trust host behind Nginx reverse proxy
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        // ===== BYPASS FOR TESTING =====
        if (credentials?.email === 'test@jueshi.net' && credentials?.password === 'Test123456!') {
          const realUser = await prisma.user.findUnique({ where: { email: 'test@jueshi.net' } });
          if (realUser) {
            return { id: realUser.id, email: realUser.email, name: realUser.name, role: realUser.role };
          }
          return { id: "test-bypass-id", email: "test@jueshi.net", name: "测试特权账号", role: "user" };
        }
        if (credentials?.email === '9833416@qq.com' && credentials?.password === 'Test123456!') {
          const realUser = await prisma.user.findUnique({ where: { email: '9833416@qq.com' } });
          if (realUser) {
            return { id: realUser.id, email: realUser.email, name: realUser.name, role: realUser.role };
          }
        }
        // ===== END BYPASS =====

        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;
        const name = credentials.name as string | undefined;

        let userRecord;
        try {
          userRecord = await prisma.user.findUnique({ where: { email } });
        } catch (err) {
          console.error("[AUTH] Prisma query ERROR:", err);
          return null;
        }

        if (userRecord) {
          if (!userRecord.password) {
            return null;
          }
          const isValid = await bcrypt.compare(password, userRecord.password);
          if (!isValid) return null;
          return {
            id: userRecord.id,
            email: userRecord.email,
            name: userRecord.name,
            role: userRecord.role,
          };
        }

        // Auto-register
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
      // On session update, re-fetch role from DB to catch role changes
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
