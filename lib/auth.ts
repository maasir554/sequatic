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
  trustHost: true, // Essential for Vercel deployment
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
    async signIn({ user, account }) {
      try {
        // Always allow sign in and handle account linking
        if (account && user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true }
          });
          
          if (existingUser) {
            // Check if this provider account is already linked
            const existingAccount = existingUser.accounts.find(
              acc => acc.provider === account.provider && acc.providerAccountId === account.providerAccountId
            );
            
            if (!existingAccount) {
              // Link the account to the existing user
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state as string,
                }
              });
              console.log(`Linked ${account.provider} account to existing user ${existingUser.email}`);
            }
          } else {
            // Create new user if doesn't exist
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                onboarded: false,
              }
            });
            console.log(`Created new user for ${user.email}`);
          }
        }
        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        // Still allow sign in, let NextAuth handle it
        return true;
      }
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
        // Set token properties from user data
        const extendedUser = user as AuthUserWithOnboarded;
        token.onboarded = extendedUser.onboarded || false;
        token.username = extendedUser.username || null;
      }

      // Always fetch fresh user data to ensure synchronization
      if (token.sub) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.sub }
          }) as ExtendedUser | null;
          
          if (freshUser) {
            token.username = freshUser.username;
            token.onboarded = freshUser.onboarded;
          }
        } catch (error) {
          console.error('Error fetching user data in JWT callback:', error);
        }
      }

      // Handle session updates (e.g., after onboarding)
      if (trigger === "update" && session?.user && token.sub) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.sub }
          }) as ExtendedUser | null;
          
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
  secret: process.env.NEXTAUTH_SECRET,
};

import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);