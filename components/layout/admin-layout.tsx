"use client";

import { AdminSidebar } from "./admin-sidebar";
import { ToastProvider } from "@/components/shared/toast";
import { PermissionProvider } from "@/lib/auth/permission-context";
import { CurrencyProvider } from "@/lib/currency-context";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionProvider user={{ role: "admin" }}>
      <CurrencyProvider country="both">
        <ToastProvider>
          <div
            className="flex flex-col lg:flex-row min-h-screen w-full"
            style={{ background: "linear-gradient(135deg, #0A2463 0%, #0D0D0D 100%)" }}
          >
            <AdminSidebar />
            <main className="flex-1 min-w-0 overflow-auto">
              {children}
            </main>
          </div>
        </ToastProvider>
      </CurrencyProvider>
    </PermissionProvider>
  );
}
