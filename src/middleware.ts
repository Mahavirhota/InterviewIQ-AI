import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  
  // Define protected paths
  const isProtectedRoute = 
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/generator") ||
    nextUrl.pathname.startsWith("/practice") ||
    nextUrl.pathname.startsWith("/analytics");

  // Redirect to login if accessing protected route without being authenticated
  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  // Redirect to dashboard if accessing login while already authenticated
  if (nextUrl.pathname === "/login" && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }
});

// Configure matchers to run middleware on all pages, excluding static files and API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
