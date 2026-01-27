import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'USER' | 'ADMIN';
      emailVerified: boolean;
      kycStatus: string;
      referralCode: string;
      referralCount: number;
      depositBalance?: number;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role: 'USER' | 'ADMIN';
    emailVerified?: Date | null;
    kycStatus: string;
    referralCode?: string;
    referralCount?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: 'USER' | 'ADMIN';
    emailVerified: boolean;
    kycStatus: string;
    referralCode: string;
    referralCount: number;
  }
}
