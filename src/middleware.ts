export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/admin/:path*", "/settings/:path*", "/login", "/signup"],
};
