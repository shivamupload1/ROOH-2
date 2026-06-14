import type { ReactNode } from "react";
import type { AdminSession } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

type ProtectedAdminLayoutProps = {
  children: ReactNode;
  session: AdminSession;
};

export function ProtectedAdminLayout({ children, session }: ProtectedAdminLayoutProps) {
  return (
    <div className="min-h-screen bg-ivory lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader session={session} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
