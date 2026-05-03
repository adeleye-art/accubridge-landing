"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface SidebarContextT {
  isExpanded: boolean;
  isMobileOpen: boolean;
  activeItem: string;
  setActiveItem: (item: string) => void;
  toggleExpanded: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextT>({
  isExpanded: true,
  isMobileOpen: false,
  activeItem: "dashboard",
  setActiveItem: () => {},
  toggleExpanded: () => {},
  openMobile: () => {},
  closeMobile: () => {},
});

// Map pathname prefixes → sidebar item id
const PATH_TO_ITEM: [string, string][] = [
  ["/accubridge/client/transactions/reconciliation", "reconciliation"],
  ["/accubridge/client/transactions",                "transactions"],
  ["/accubridge/client/reports",                     "reports"],
  ["/accubridge/client/compliance",                  "compliance"],
  ["/accubridge/client/funding",                     "funding"],
  ["/accubridge/client/ai-ideas",                    "ai-ideas"],
  ["/accubridge/client/registration",                "registration"],
  ["/accubridge/client/settings",                    "settings"],
  ["/accubridge/client/dashboard",                   "dashboard"],
];

function itemFromPath(pathname: string): string {
  for (const [prefix, id] of PATH_TO_ITEM) {
    if (pathname.startsWith(prefix)) return id;
  }
  return "dashboard";
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(() => itemFromPath(pathname));

  // Keep active item in sync when the URL changes (back/forward, direct navigation)
  useEffect(() => {
    setActiveItem(itemFromPath(pathname));
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isExpanded,
        isMobileOpen,
        activeItem,
        setActiveItem,
        toggleExpanded: () => setIsExpanded((s) => !s),
        openMobile: () => setIsMobileOpen(true),
        closeMobile: () => setIsMobileOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
