import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Elk AI - AI-Powered Desktop Assistant',
  description: 'Real-time AI assistance for interviews, meetings, and presentations with screen analysis and web research.',
  keywords: ['AI assistant', 'desktop app', 'interview help', 'meeting assistant', 'productivity'],
  authors: [{ name: 'Elk AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}