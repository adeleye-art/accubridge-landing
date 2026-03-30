"use client";

import { ClientSidebar } from "./client-sidebar";
import { SidebarProvider } from "./sidebar-provider";
import { ToastProvider } from "@/components/shared/toast";
import { OnboardingGuard } from "@/components/auth/onboarding-guard";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingGuard>
      <ToastProvider>
        <SidebarProvider>
          <div
            className="flex flex-col lg:flex-row min-h-screen w-full"
            style={{ background: "linear-gradient(135deg, #0A2463 0%, #0D0D0D 100%)" }}
          >
            <ClientSidebar />
            <main className="flex-1 min-w-0 overflow-auto">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </ToastProvider>
    </OnboardingGuard>
  );
}
