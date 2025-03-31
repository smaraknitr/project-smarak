import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
      name: string;
      isRegistered: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role?: string;
    email: string;
    name: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    email?: string;
    name?: string;
  }
}
