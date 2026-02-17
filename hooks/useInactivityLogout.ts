"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useInactivityLogout = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const resetTimer = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      // Auto logout
      signOut({ callbackUrl: "/login?session=expired" });
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // Log out when user navigates to the public products page
    if (pathname === "/products") {
      signOut({ callbackUrl: "/login" });
      return;
    }

    // Events to track user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Initialize timer
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Handle beforeunload (when user closes tab/window or navigates away)
    const handleBeforeUnload = () => {
      // Log out when user leaves the website
      signOut({ redirect: false });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname]);
};
