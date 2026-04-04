"use client";

import React from "react";
import { ClientSidebar } from "./client-sidebar";
import { SidebarProvider } from "./sidebar-provider";
import { ToastProvider } from "@/components/shared/toast";
import { OnboardingGuard } from "@/components/auth/onboarding-guard";
import { CurrencyProvider } from "@/lib/currency-context";
import { type ClientCountry } from "@/lib/currency";
import { getCookie } from "@/lib/utils";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const country = (getCookie("accubridge_country") ?? "uk") as ClientCountry;

  return (
    <OnboardingGuard>
      <ToastProvider>
        <CurrencyProvider country={country}>
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
        </CurrencyProvider>
      </ToastProvider>
    </OnboardingGuard>
  );
}
