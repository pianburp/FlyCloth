import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT remove getUser() if you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Public routes - allow access without authentication
  const publicRoutes = ["/", "/auth/login", "/auth/sign-up", "/auth/error", "/auth/forgot-password", "/auth/sign-up-success", "/auth/update-password"];
  const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith("/auth/confirm"));

  // If no user and trying to access protected route, redirect to login
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If user is authenticated, check role-based access
  if (user) {
    // Fetch user role from database
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();
    
    const userRole = profile?.role || "user";
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];

    // Inject auth user data as header for downstream consumption
    // This makes middleware the single source of truth for auth
    const authUserData = {
      id: user.id,
      email: user.email,
      role: userRole,
      display_name: displayName,
      full_name: profile?.full_name,
    };
    
    // Set the auth header on the request for server components to read
    supabaseResponse.headers.set('x-auth-user', JSON.stringify(authUserData));

    // Admin routes - only accessible to admins
    if (path.startsWith("/admin")) {
      if (userRole !== "admin") {
        return NextResponse.redirect(new URL("/user", request.url));
      }
    }

    // Redirect authenticated users from login/signup to their dashboard
    if (path === "/auth/login" || path === "/auth/sign-up") {
      const redirectUrl = userRole === "admin" ? "/admin" : "/user";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
