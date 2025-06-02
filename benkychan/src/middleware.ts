import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "./lib/firebase-admin";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get("__session")?.value;

  // Rutas públicas
  const publicPaths = ["/login", "/register", "/forgot-password"];

  // Rutas protegidas
  const protectedPaths = ["/dashboard", "/profile", "/settings"];

  // Permitir rutas públicas
  if (publicPaths.some((p) => path.startsWith(p))) {
    if (
      sessionCookie &&
      (path.startsWith("/login") || path.startsWith("/register"))
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Proteger rutas
  if (protectedPaths.some((p) => path.startsWith(p))) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      await adminAuth.verifySessionCookie(sessionCookie);
      return NextResponse.next();
    } catch (error) {
      console.error("Error verifying session:", error);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("__session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
