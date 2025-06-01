import { auth } from "@/lib/firebase";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const user = await auth.currentUser;
  const isAuthRoute = request.nextUrl.pathname.startsWith("/dashboard");

  if (isAuthRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
