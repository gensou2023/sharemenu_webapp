import type { Metadata } from "next";
import { Playfair_Display, Noto_Sans_JP } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700"],
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const SITE_URL = "https://sharemenu-webapp.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "MenuCraft AI - チャットするだけでプロ品質のメニューを",
    template: "%s | MenuCraft AI",
  },
  description:
    "AIがSNS最適サイズのメニュー画像を自動生成。飲食店オーナーのためのデザインツール。",
  keywords: [
    "メニュー画像",
    "AI画像生成",
    "飲食店",
    "メニューデザイン",
    "SNS画像",
    "MenuCraft",
  ],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "MenuCraft AI - チャットするだけでプロ品質のメニューを",
    description:
      "AIがSNS最適サイズのメニュー画像を自動生成。飲食店オーナーのためのデザインツール。",
    url: SITE_URL,
    siteName: "MenuCraft AI",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MenuCraft AI - AIメニュー画像自動生成",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MenuCraft AI - チャットするだけでプロ品質のメニューを",
    description:
      "AIがSNS最適サイズのメニュー画像を自動生成。飲食店オーナーのためのデザインツール。",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${playfair.variable} ${notoSansJP.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
