import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Chat Agent',
  description: 'インテリジェント検索対応チャット',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
} 