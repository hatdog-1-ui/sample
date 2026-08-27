"use client";

import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
