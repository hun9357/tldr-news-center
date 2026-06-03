import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TLDR Daily Intelligence",
  description: "매일 도착하는 TLDR 뉴스레터를 한국어 인텔리전스 브리핑으로 정리한 개인 아카이브",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
