import { NextRequest, NextResponse } from "next/server";

// Password gate (HTTP Basic Auth).
// Configure via Vercel env vars SITE_USER / SITE_PASS.
// If unset, falls back to defaults below (MUST change in production).
function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="TLDR Daily Digest", charset="UTF-8"' },
  });
}

export function middleware(req: NextRequest) {
  // .trim() guards against stray whitespace / newlines pasted into the
  // Vercel env var UI, which is a common cause of "correct password rejected".
  const USER = (process.env.SITE_USER || "admin").trim();
  const PASS = (process.env.SITE_PASS || "change-me").trim();

  const auth = req.headers.get("authorization");
  if (!auth) return unauthorized();

  const [scheme, encoded] = auth.split(" ");
  if (scheme !== "Basic" || !encoded) return unauthorized();

  // Decode base64 using Edge-runtime-safe web APIs (atob + TextDecoder)
  // instead of Node's Buffer, which is not reliably available on the Edge.
  let decoded: string;
  try {
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    decoded = new TextDecoder().decode(bytes);
  } catch {
    return unauthorized();
  }

  const idx = decoded.indexOf(":");
  if (idx === -1) return unauthorized();
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);

  if (user === USER && pass === PASS) {
    return NextResponse.next();
  }

  return unauthorized();
}

// Apply to all pages except static assets.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
