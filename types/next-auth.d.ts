import { type DefaultSession, type User } from 'next-auth';
import { type JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string | null;
      onboarded: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    username?: string | null;
    onboarded?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username?: string | null;
    onboarded?: boolean;
  }
}