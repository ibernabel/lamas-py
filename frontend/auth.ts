/**
 * NextAuth.js v5 configuration.
 *
 * Uses Credentials provider to authenticate against the FastAPI backend.
 * The JWT access_token from the backend is stored in the NextAuth session
 * and attached to all API requests via the axios client.
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api/v1";
          const res = await fetch(`${apiBaseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: parsed.data.email,
              password: parsed.data.password,
            }),
          });

          if (!res.ok) {
            console.error(
              `[NextAuth] Backend login failed with HTTP ${res.status}`
            );
            return null;
          }

          const data = await res.json();

          // Fetch user info from /auth/me using access_token
          let userId = parsed.data.email;
          let userName = parsed.data.email;
          let userEmail = parsed.data.email;

          try {
            const meRes = await fetch(`${apiBaseUrl}/auth/me`, {
              headers: {
                Authorization: `Bearer ${data.access_token}`,
              },
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              userId = String(meData.id ?? userId);
              userName = meData.name ?? userName;
              userEmail = meData.email ?? userEmail;
            }
          } catch (meErr) {
            console.warn(
              "[NextAuth] Failed to fetch /auth/me profile:",
              meErr
            );
          }

          return {
            id: userId,
            name: userName,
            email: userEmail,
            accessToken: data.access_token,
          };
        } catch (err) {
          console.error("[NextAuth] Exception during authorize:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, persist the backend access_token in the JWT
      if (user) {
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose the access_token and user id in the session object
      session.accessToken = token.accessToken as string;
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
