import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection is handled client-side by OnboardingGuard.
 * This proxy is a placeholder for server-side checks once a real
 * auth backend (e.g. NextAuth, Supabase) is wired up.
 *
 * Flow:
 *   login / signup → /onboarding
 *   /onboarding → if complete (localStorage), redirect to /client/dashboard
 *   /client/*   → OnboardingGuard redirects to /onboarding if not complete
 */
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
