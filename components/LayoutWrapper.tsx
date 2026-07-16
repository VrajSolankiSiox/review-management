"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicRoute =
    pathname.startsWith("/h") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-row">
      <Sidebar />
      <div className="w-64"></div>
      <div className=" w-full">{children}</div>
    </div>
  );
}
