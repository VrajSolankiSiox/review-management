import type { Metadata } from "next";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Leave a Review",
  description: "Share your experience and help others",
};

export default function ReviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="m-0 min-h-screen bg-slate-50">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
