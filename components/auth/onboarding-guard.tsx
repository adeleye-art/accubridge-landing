"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { loadOnboardingProgress } from "@/lib/onboarding";

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
    const progress = loadOnboardingProgress();

    if (progress?.onboarding_complete) {
      setAllowed(true);
    } else {
      router.replace(`/onboarding?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  if (!allowed) return null;

  return <>{children}</>;
}
