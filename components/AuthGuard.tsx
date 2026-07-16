"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("JWT") : null;
    const isAuthPage = pathname === "/login" || pathname === "/signup";
    const isPublicRoute =
      pathname.startsWith("/qr") || pathname.startsWith("/h");

    if (!token && !isAuthPage && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (token && isAuthPage) {
      router.replace("/");
      return;
    }

    const timeoutId = window.setTimeout(() => setIsReady(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, [pathname, router]);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
