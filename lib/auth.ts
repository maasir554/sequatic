import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig, Session, User as AuthUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import type { User } from "@prisma/client";

// Extended user type that includes onboarded field
type ExtendedUser = User & {
  onboarded: boolean;
};

// Type for user data in auth callbacks
type AuthUserWithOnboarded = AuthUser & {
  onboarded?: boolean;
  username?: string | null;
};

export const authConfig: NextAuthConfig = {
  debug: process.env.NODE_ENV === 'development',
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          onboarded: false,
        };
      },
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          onboarded: false,
        };
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.emailOrUsername || !credentials?.password) {
          return null;
        }

        // Try to find user by email or username
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.emailOrUsername as string },
              { username: credentials.emailOrUsername as string }
            ]
          },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          onboarded: user.onboarded || false,
          username: user.username,
        } as AuthUserWithOnboarded;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.username = token.username as string | null;
        session.user.onboarded = token.onboarded as boolean;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }: { token: JWT; user: AuthUser | null; trigger?: string; session?: Session }) {
      if (user) {
        // Set token properties from user data
        const extendedUser = user as AuthUserWithOnboarded;
        token.onboarded = extendedUser.onboarded || false;
        token.username = extendedUser.username || null;
      }

      // Handle session updates (e.g., after onboarding)
      if (trigger === "update" && session?.user) {
        // Fetch fresh user data from database
        const freshUser = await prisma.user.findUnique({
          where: { id: token.sub! }
        }) as ExtendedUser | null;
        
        if (freshUser) {
          token.username = freshUser.username;
          token.onboarded = freshUser.onboarded;
        }
      }

      return token;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding"
  },
  secret: process.env.NEXTAUTH_SECRET,
};

import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);