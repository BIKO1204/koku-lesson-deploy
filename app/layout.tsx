// app/layout.tsx
import './globals.css';

export const metadata = {
  title: '国語授業案アプリ',
  themeColor: '#ffffff',
  manifest: '/manifest.json',
};

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
