import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const FALLBACK_SUPABASE_URL = "https://wckgvkfgxedyuysdibsw.supabase.co";
const FALLBACK_SUPABASE_KEY = "sb_publishable_a5EYf9js-rdRpjeLlJVvzg_AEKHMVr8";

function isUnsafeApiMethod(method: string) {
  return method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
}

function passesSameOriginCheck(request: NextRequest) {
  if (!isUnsafeApiMethod(request.method)) return true;

  // Webhook authentication is signature-based and is handled separately below.
  if (request.nextUrl.pathname === "/api/billing/webhook") return true;

  // Browser requests normally include Fetch Metadata. Reject explicit cross-site
  // requests before they reach authenticated mutation handlers.
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;

  // If a browser supplies Origin, require it to match this deployment origin.
  // Requests without Origin remain possible for trusted server-to-server clients.
  const origin = request.headers.get("origin");
  if (!origin) return true;

  return origin === request.nextUrl.origin;
}

function applySecurityHeaders(response: NextResponse, request: NextRequest) {
  // Defense-in-depth headers. Authorization is still enforced by each API route.
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  // Never let authenticated API responses be stored by shared/intermediate caches.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicWebhook = pathname === "/api/billing/webhook";
  const isPublicAIStatus = pathname === "/api/ai-status" || pathname === "/api/ai-status-public";
  const protectedPath = !isPublicWebhook && !isPublicAIStatus && (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/platforms") ||
    (pathname.startsWith("/api/") && pathname !== "/api/health")
  );

  // These endpoints perform their own authorization/signature checks and must not
  // invoke Supabase auth middleware. Keeping them completely public also avoids
  // edge-runtime failures when auth configuration is unavailable.
  if (isPublicWebhook || isPublicAIStatus || pathname === "/api/health") {
    return applySecurityHeaders(NextResponse.next(), request);
  }

  if (pathname.startsWith("/api/") && !passesSameOriginCheck(request)) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 }),
      request
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (protectedPath) {
      if (pathname.startsWith("/api/")) {
        return applySecurityHeaders(new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }), request);
      }
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return applySecurityHeaders(NextResponse.redirect(url), request);
    }
    return applySecurityHeaders(NextResponse.next(), request);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (protectedPath && !user) {
    if (pathname.startsWith("/api/")) {
      return applySecurityHeaders(new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }), request);
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return applySecurityHeaders(NextResponse.redirect(url), request);
  }

  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return applySecurityHeaders(NextResponse.redirect(url), request);
  }

  return applySecurityHeaders(response, request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/history/:path*", "/images/:path*", "/settings/:path*", "/platforms/:path*", "/api/:path*", "/login"],
};
