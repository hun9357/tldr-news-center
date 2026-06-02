import type { Metadata } from "next";
import Link from "next/link";
import { getAllDates } from "@/lib/digest";
import "./globals.css";

export const metadata: Metadata = {
  title: "TLDR 데일리 다이제스트",
  description: "매일 도착하는 TLDR 뉴스레터를 한눈에 보는 개인 요약 사이트",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const latestDate = getAllDates()[0];

  return (
    <html lang="ko">
      <body>
        <nav className="nav-shell" aria-label="주요 탐색">
          <div className="nav-inner">
            <Link href="/" className="brand" aria-label="TLDR Daily 홈">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M5 7h14M5 12h10M5 17h7" />
                </svg>
              </span>
              <span>TLDR <b>Daily</b></span>
            </Link>
            <div className="nav-links">
              <Link href="/">아카이브</Link>
              {latestDate && <Link href={`/${latestDate}`}>최신 브리핑</Link>}
            </div>
          </div>
        </nav>
        <main className="app-shell">{children}</main>
      </body>
    </html>
  );
}
