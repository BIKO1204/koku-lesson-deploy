// app/layout.tsx
import './globals.css';

export const metadata = {
  title: '国語授業案アプリ',
  manifest: '/manifest.json',
};

// Next.js 15系推奨の themeColor 設定
export function generateViewport() {
  return {
    themeColor: '#ffffff',
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/icon-192x192.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
