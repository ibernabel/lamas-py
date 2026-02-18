/**
 * NextAuth.js v5 TypeScript type augmentation.
 *
 * Extends the default Session and JWT types to include:
 * - session.accessToken: the FastAPI JWT token
 * - session.user.id: the user's database ID
 */
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}
