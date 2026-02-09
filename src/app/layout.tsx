import type { Metadata } from "next";
import { Playfair_Display, Noto_Sans_JP } from "next/font/google";
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

export const metadata: Metadata = {
  title: "MenuCraft AI - チャットするだけでプロ品質のメニューを",
  description:
    "AIがSNS最適サイズのメニュー画像を自動生成。飲食店オーナーのためのデザインツール。",
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
        {children}
      </body>
    </html>
  );
}
