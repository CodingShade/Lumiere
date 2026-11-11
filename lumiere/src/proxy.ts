import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function redirectWithSession(response: NextResponse, url: URL) {
  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const { response, user, role } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const protectedRoute = pathname.startsWith("/dashboard")
    || pathname.startsWith("/agendamentos")
    || pathname.startsWith("/admin")
    || pathname.startsWith("/fotografo");

  if (protectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return redirectWithSession(response, loginUrl);
  }
  if (user && (pathname === "/login" || pathname === "/cadastro")) {
    return redirectWithSession(response, new URL("/dashboard", request.url));
  }
  if (pathname.startsWith("/admin") && role !== "admin") {
    return redirectWithSession(response, new URL("/dashboard", request.url));
  }
  if (pathname.startsWith("/fotografo") && role !== "fotografo" && role !== "admin") {
    return redirectWithSession(response, new URL("/dashboard", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
