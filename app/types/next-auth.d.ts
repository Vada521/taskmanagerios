import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      xp: number;
      level: number;
      gold: number;
    } & DefaultSession['user'];
  }
  
  interface User extends DefaultUser {
    id: string;
    xp: number;
    level: number;
    gold: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    xp: number;
    level: number;
    gold: number;
  }
} 