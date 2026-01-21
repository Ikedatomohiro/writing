import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isEmailAllowed } from "./whitelist";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!isEmailAllowed(user.email)) {
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.email) {
        session.user.email = token.email;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
