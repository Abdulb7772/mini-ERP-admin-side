import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const isOnProtected = nextUrl.pathname.startsWith("/protected");
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const isOnRegister = nextUrl.pathname.startsWith("/register");
      const isOnProducts = nextUrl.pathname === "/products";

      // Allow access to protected routes only for authenticated users
      if (isOnProtected) {
        if (!isLoggedIn) return false; // Redirect unauthenticated users to login page
        
        // Block customers from accessing protected routes
        if (userRole === "customer") {
          return false; // This will redirect to login page, handle redirect in login page
        }
        
        return true;
      }
      
      // Allow access to login/register pages and other public pages
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
