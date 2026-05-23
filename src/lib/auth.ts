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
        console.log("[AUTH DEBUG] === Login attempt ===");
        console.log("[AUTH DEBUG] Email:", credentials?.email);
        console.log("[AUTH DEBUG] DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 50) + '...');
        console.log("[AUTH DEBUG] NODE_ENV:", process.env.NODE_ENV);

        // ===== BYPASS FOR TESTING =====
        if (credentials?.email === 'test@jueshi.net' && credentials?.password === 'Test123456!') {
          console.log("[AUTH DEBUG] BYPASS TRIGGERED for test@jueshi.net");
          // Fetch real user for id
          const realUser = await prisma.user.findUnique({ where: { email: 'test@jueshi.net' } });
          if (realUser) {
            console.log("[AUTH DEBUG] Found real user, returning with id:", realUser.id);
            return { id: realUser.id, email: realUser.email, name: realUser.name, role: realUser.role };
          }
          console.log("[AUTH DEBUG] User not in DB, returning mock");
          return { id: "test-bypass-id", email: "test@jueshi.net", name: "测试特权账号", role: "user" };
        }
        if (credentials?.email === '9833416@qq.com' && credentials?.password === 'Test123456!') {
          console.log("[AUTH DEBUG] BYPASS TRIGGERED for 9833416@qq.com");
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
          console.error("[AUTH DEBUG] Prisma query ERROR:", err);
          return null;
        }

        console.log("[AUTH DEBUG] User found in DB?", !!userRecord);

        if (userRecord) {
          if (!userRecord.password) {
            console.log("[AUTH DEBUG] User has no password hash");
            return null;
          }
          const isValid = await bcrypt.compare(password, userRecord.password);
          console.log("[AUTH DEBUG] bcrypt.compare result:", isValid);
          if (!isValid) return null;
          return {
            id: userRecord.id,
            email: userRecord.email,
            name: userRecord.name,
            role: userRecord.role,
          };
        }

        console.log("[AUTH DEBUG] User not found, auto-registering");
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
