import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AIエージェント - インテリジェント検索対応チャット',
  description: 'AIエージェントとのチャット機能を提供するアプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  )
}