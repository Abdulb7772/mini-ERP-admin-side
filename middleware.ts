import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isOnLogin = req.nextUrl.pathname.startsWith("/login");
    const isOnVerifyEmail = req.nextUrl.pathname.startsWith("/verify-email");
    const isOnPublic = req.nextUrl.pathname === "/";

    console.log('🔐 [Auth Check]', {
      path: req.nextUrl.pathname,
      isLoggedIn: !!token,
      userRole: token?.role,
      isOnLogin,
      isOnVerifyEmail
    });

    // Allow public routes
    if (isOnLogin || isOnVerifyEmail || isOnPublic) {
      return NextResponse.next();
    }

    // Block customers from accessing admin routes
    if (token?.role === "customer") {
      console.log('❌ Customer role detected, access denied');
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isOnLogin = req.nextUrl.pathname.startsWith("/login");
        const isOnVerifyEmail = req.nextUrl.pathname.startsWith("/verify-email");
        const isOnPublic = req.nextUrl.pathname === "/";

        // Allow public routes
        if (isOnLogin || isOnVerifyEmail || isOnPublic) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
