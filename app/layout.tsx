import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "최준용 | Security Infrastructure Engineer",
  description: "탐지부터 대응까지 보안 운영 흐름을 설계하는 최준용의 포트폴리오입니다.",
  openGraph: {
    title: "최준용 | Security Infrastructure Engineer",
    description: "공격을 탐지하고, 운영이 멈추지 않게.",
    url: siteUrl,
    siteName: "JUNYONG CHOI",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "최준용 | Security Infrastructure Engineer",
    description: "공격을 탐지하고, 운영이 멈추지 않게.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}