import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("userRole")?.value;
  const { pathname } = request.nextUrl;

  console.log(
    "Middleware - Path:",
    pathname,
    "Role:",
    role,
    "Token exists:",
    !!token
  );

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      console.log("No token, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (role !== "admin") {
      console.log("Not admin role, redirecting to login. Current role:", role);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect user routes (optional - if you want to protect /articles)
  if (pathname.startsWith("/articles") && !pathname.startsWith("/admin")) {
    if (!token) {
      console.log("No token for articles, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/articles/:path*"],
};
