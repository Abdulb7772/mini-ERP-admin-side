"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const useAuth = (roles: string[] = []) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user && roles.length && !roles.includes(session.user.role)) {
      router.push("/protected/dashboard");
    }
  }, [session, status, router, roles]);

  return { 
    role: session?.user?.role || null,
    user: session?.user || null,
    status 
  };
};

