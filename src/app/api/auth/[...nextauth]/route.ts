import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { NextAuthOptions } from "next-auth";
import { sendWelcomeEmail } from "@/lib/email";
import { headers } from "next/headers";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 3600, // 1 hour session lifetime for vault security
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        console.log('--- NEXTAUTH JWT CALLBACK USER ---', user);
        token.id = user.id;
        token.picture = user.image;
        
        // Ensure role is fetched correctly from db if adapter misses it
        if (user.id) {
          const dbUser = await db.select({ role: users.role }).from(users).where(eq(users.id, user.id)).limit(1);
          if (dbUser.length > 0) {
            token.role = dbUser[0].role;
          } else {
            token.role = (user as any).role || 'user';
          }
        }
      }
      if (trigger === "update" && session) {
        if (session.name) {
          token.name = session.name;
        }
        if (session.user?.image) {
          token.picture = session.user.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string || token.sub as string;
        session.user.image = token.picture as string | undefined;
        (session.user as any).role = token.role as string | undefined;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const headersList = await headers();
      const acceptLanguage = headersList.get('accept-language') || '';
      const detectedLocale = /(^|,\s*)ar(\s*[;,]|$)/i.test(acceptLanguage) ? 'ar' : 'en';

      if (user.id) {
        await db.update(users).set({ preferredLocale: detectedLocale }).where(eq(users.id, user.id));
      }

      if (user.email) {
        await sendWelcomeEmail(user.email, user.name || 'User', detectedLocale);
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
