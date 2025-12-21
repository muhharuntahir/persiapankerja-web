import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isLaunchMode = process.env.NEXT_PUBLIC_LAUNCH_MODE === "true";
  const pathname = request.nextUrl.pathname;

  // hanya intercept homepage
  if (isLaunchMode && pathname === "/") {
    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  return NextResponse.next();
}
