"use client";

// This file is kept for backwards compatibility but is no longer used.
// The root ReduxProvider in app/layout.tsx covers all routes.
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
