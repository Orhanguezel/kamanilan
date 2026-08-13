import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COMMERCE_ENABLED, isCommerceRoute } from "@/config/features";

const PROTECTED_ROUTES = ["/hesabim", "/ilanlarim", "/mesajlar", "/bildirimler", "/ilan-ver"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!COMMERCE_ENABLED && isCommerceRoute(pathname)) {
    return NextResponse.redirect(new URL("/ilanlar", request.url));
  }

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      const loginUrl = new URL("/giris", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon|public|apple|assets|images).*)"],
};
