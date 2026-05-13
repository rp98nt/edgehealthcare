import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string; role: string };
  }
  interface User {
    role?: string | null;
  }
}

const authSecret =
  process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? undefined;

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  ...(authSecret ? { secret: authSecret } : {}),
  debug: process.env.AUTH_DEBUG === "1",
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email);
        try {
          const rows = await getDb()
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
          const user = rows[0];
          if (!user) return null;
          const ok = await bcrypt.compare(
            String(credentials.password),
            user.passwordHash,
          );
          if (!ok) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (err) {
          console.error("[auth] credentials authorize failed:", err);
          throw new CredentialsSignin();
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          sub: user.id,
          role: user.role ?? "patient",
        };
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        const role = token.role;
        session.user.role =
          typeof role === "string" ? role : "patient";
      }
      return session;
    },
  },
});
