import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig, Session, User as AuthUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

// Type for user data in auth callbacks
type AuthUserWithOnboarded = AuthUser & {
  onboarded?: boolean;
  username?: string | null;
};

export const authConfig: NextAuthConfig = {
  debug: true, // Enable debug in production temporarily
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // This is key!
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // This is key!
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
    async signIn({ user, account }) {
      console.log('SignIn callback:', { 
        userEmail: user.email, 
        provider: account?.provider,
        userId: user.id
      });
      
      // Always allow sign in - let PrismaAdapter handle user creation
      return true;
    },
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
        // For new users, set default values
        token.onboarded = false; // New users are never onboarded
        token.username = null;
        
        // Try to get the actual user data from database
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { onboarded: true, username: true }
          });
          
          if (dbUser) {
            token.onboarded = dbUser.onboarded;
            token.username = dbUser.username;
          }
        } catch (error) {
          console.error('Error fetching user in JWT callback:', error);
        }
      }

      // Always fetch fresh user data to ensure synchronization
      if (token.sub && token.email) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { onboarded: true, username: true }
          });
          
          if (freshUser) {
            token.username = freshUser.username;
            token.onboarded = freshUser.onboarded;
          }
        } catch (error) {
          console.error('Error fetching fresh user data in JWT callback:', error);
        }
      }

      // Handle session updates (e.g., after onboarding)
      if (trigger === "update" && session?.user && token.email) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { onboarded: true, username: true }
          });
          
          if (freshUser) {
            token.username = freshUser.username;
            token.onboarded = freshUser.onboarded;
          }
        } catch (error) {
          console.error('Error updating user data in JWT callback:', error);
        }
      }

      return token;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
    error: "/login" // Redirect errors to login page
  },
  events: {
    async createUser({ user }) {
      console.log('CreateUser event:', { userEmail: user.email, userId: user.id });
      
      // Set onboarded to false for new users
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { onboarded: false }
        });
        console.log('Set new user onboarded to false');
      } catch (error) {
        console.error('Error in createUser event:', error);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);