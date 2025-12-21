import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isLaunchMode = process.env.NEXT_PUBLIC_LAUNCH_MODE === "true";
  const pathname = request.nextUrl.pathname;

  // halaman yang BOLEH diakses saat launch
  const allowedPaths = ["/coming-soon"];

  if (isLaunchMode && !allowedPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
