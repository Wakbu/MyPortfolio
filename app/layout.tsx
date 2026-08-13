import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "최준용 | Security Infrastructure Engineer",
  description: "보안 인프라의 설계, 공격 검증, 관제와 대응 과정을 기록한 최준용의 포트폴리오입니다.",
  openGraph: {
    title: "최준용 | Security Infrastructure Engineer",
    description: "보안 인프라를 설계하고 검증합니다.",
    url: siteUrl,
    siteName: "JUNYONG CHOI",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "최준용 | Security Infrastructure Engineer",
    description: "보안 인프라를 설계하고 검증합니다.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
