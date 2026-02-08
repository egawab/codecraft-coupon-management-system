import { Role } from '@prisma/client';
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      emailVerified: Date | null;
      isActive: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: Role;
    emailVerified: Date | null;
    avatar?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    role: Role;
    emailVerified: Date | null;
    isActive: boolean;
  }
}
