import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/shared/Navigation";
import { AppProvider } from "@/contexts/AppContext";

export const metadata: Metadata = {
  title: "TOEIC Master AI - AI駆動型TOEIC学習プラットフォーム",
  description: "AI問題生成、詳細解説、スコア予測で800点以上を目指す学習アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AppProvider>
          <Navigation />
          <main className="container" style={{ paddingTop: '5rem', paddingBottom: '2rem' }}>
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
