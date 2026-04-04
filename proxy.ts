import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const role = request.cookies.get("accubridge_role")?.value;
  const { pathname } = request.nextUrl;

  if (!role) return NextResponse.next();

  const isAdmin = role === "admin";
  const isStaff = role === "staff";

  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL(isStaff ? "/staff/dashboard" : "/client/dashboard", request.url));
  }
  if (pathname.startsWith("/staff") && !isStaff) {
    return NextResponse.redirect(new URL(isAdmin ? "/admin/dashboard" : "/client/dashboard", request.url));
  }
  if (pathname.startsWith("/client") && (isAdmin || isStaff)) {
    return NextResponse.redirect(new URL(isAdmin ? "/admin/dashboard" : "/staff/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
