import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";

const handler = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 3600, // 1 hour session lifetime for vault security
  },
  callbacks: {
    async jwt({ token, user, profile }) {
      // Pass the Google profile picture directly into the encrypted JWT cookie
      if (profile?.picture) {
        token.picture = profile.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.image = token.picture as string | undefined;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
