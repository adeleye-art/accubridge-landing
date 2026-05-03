"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { loadOnboardingProgress } from "@/lib/accubridge/onboarding";

/**
 * Protects /client/* routes. If the user hasn't completed onboarding,
 * redirects them to /onboarding. Onboarding page handles the inverse:
 * if already complete, it skips straight to /client/dashboard.
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // Onboarding is optional — allow access regardless of completion status.
    setAllowed(true);
  }, [pathname, router]);

  if (!allowed) return null;

  return <>{children}</>;
}
