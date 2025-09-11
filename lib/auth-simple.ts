import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authConfig: NextAuthConfig = {
  debug: true,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log('🚀 SIGNIN CALLBACK:', {
        user: user.email,
        provider: account?.provider,
        time: new Date().toISOString()
      });

      if (account?.provider === 'google') {
        try {
          // Check if user exists
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (!dbUser) {
            // Create new user
            console.log('🎉 CREATING USER:', user.email);
            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || '',
                image: user.image || null,
                onboarded: false,
              },
            });
            console.log('✅ USER CREATED:', dbUser.id);
          }

          return true;
        } catch (error) {
          console.error('❌ SIGNIN ERROR:', error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger }) {
      console.log('🔑 JWT CALLBACK:', {
        hasUser: !!user,
        trigger,
        email: token.email
      });

      if (user) {
        // First time signing in
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      // Always fetch latest user data
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string }
          });

          if (dbUser) {
            token.sub = dbUser.id;
            token.onboarded = dbUser.onboarded;
            token.username = dbUser.username;
          }
        } catch (error) {
          console.error('❌ JWT ERROR:', error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.onboarded = token.onboarded as boolean;
        session.user.username = token.username as string | null;
      }
      return session;
    },
  },
};

import NextAuth from "next-auth";
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
