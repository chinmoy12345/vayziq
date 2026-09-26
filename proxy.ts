import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicAdminPaths = new Set(["/admin/login"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicAdminPaths.has(pathname)) return NextResponse.next();

  if (!request.cookies.has("access_token")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
