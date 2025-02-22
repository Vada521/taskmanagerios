import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    xp: number;
    level: number;
  }

  interface Session {
    user: User & {
      id: string;
      xp: number;
      level: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    xp: number;
    level: number;
  }
} 