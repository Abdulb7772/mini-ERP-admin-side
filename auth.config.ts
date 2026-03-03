import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const isOnVerifyEmail = nextUrl.pathname.startsWith("/verify-email");
      const isOnPublic = nextUrl.pathname === "/";
      
      console.log('🔐 [Auth Check]', {
        path: nextUrl.pathname,
        isLoggedIn,
        userRole,
        isOnLogin,
        isOnVerifyEmail
      });
      
      // Allow public routes (login, verify-email, home)
      if (isOnLogin || isOnVerifyEmail || isOnPublic) {
        return true;
      }

      // All other routes are protected - require authentication
      if (!isLoggedIn) {
        console.log('❌ Not logged in, redirecting to login');
        return false; // Redirect unauthenticated users to login page
      }
      
      // Block customers from accessing admin routes
      if (userRole === "customer") {
        console.log('❌ Customer role detected, access denied');
        return false; // This will redirect to login page
      }
      
      console.log('✅ Access granted');
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
