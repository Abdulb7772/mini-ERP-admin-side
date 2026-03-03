import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log('🔐 Attempting login with:', credentials?.email);
          console.log('🌐 API URL:', `${API_URL}/auth/login`);
          
          const response = await axios.post(`${API_URL}/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
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
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
