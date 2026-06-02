import { NextRequest, NextResponse } from "next/server";

// 비밀번호 게이트 (HTTP Basic Auth)
// Vercel 환경변수 SITE_USER / SITE_PASS 로 설정. 미설정 시 기본값 사용(반드시 변경!).
export function middleware(req: NextRequest) {
  const USER = process.env.SITE_USER || "admin";
  const PASS = process.env.SITE_PASS || "change-me";

  const auth = req.headers.get("authorization");
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString();
      const idx = decoded.indexOf(":");
      const user = decoded.slice(0, idx);
      const pass = decoded.slice(idx + 1);
      if (user === USER && pass === PASS) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("인증이 필요합니다.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="TLDR Daily Digest", charset="UTF-8"' },
  });
}

// 정적 자산 제외, 모든 페이지에 적용
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
