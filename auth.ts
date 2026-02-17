import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          console.log('🔐 Attempting login with:', credentials.email);
          console.log('🌐 API URL:', `${API_URL}/auth/login`);
          
          const response = await axios.post(`${API_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          console.log('✅ Login response:', response.data);
          
          const { user, token } = response.data.data;

          if (user && token) {
            return {
              id: user.id || user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              isVerified: user.isVerified,
              isActive: user.isActive,
              accessToken: token,
            };
          }
          return null;
        } catch (error: any) {
          console.error("❌ Auth error:", error.response?.data || error.message);
          console.error("❌ Full error:", error);
          // Throw error with message so NextAuth can display it
          throw new Error(error.response?.data?.message || "Invalid credentials");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.id = user.id;
        token.isVerified = user.isVerified;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
