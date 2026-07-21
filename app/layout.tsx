import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;

  return {
    title: "최준용 | Security Infrastructure Engineer",
    description: "탐지부터 대응까지 보안 운영 흐름을 설계하는 최준용의 포트폴리오입니다.",
    openGraph: {
      title: "최준용 | Security Infrastructure Engineer",
      description: "공격을 탐지하고, 운영이 멈추지 않게.",
      url: baseUrl,
      siteName: "JUNYONG CHOI",
      locale: "ko_KR",
      type: "website",
      images: [{ url: `${baseUrl}/og.png`, width: 1536, height: 1024, alt: "최준용 보안 인프라 포트폴리오" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "최준용 | Security Infrastructure Engineer",
      description: "공격을 탐지하고, 운영이 멈추지 않게.",
      images: [`${baseUrl}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
