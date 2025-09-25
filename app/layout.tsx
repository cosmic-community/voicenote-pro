import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AccessGuard from '@/components/AccessGuard'
import CosmicBadge from '@/components/CosmicBadge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VoiceNote Pro',
  description: 'Intelligent voice-to-text note-taking with AI assistance',
  keywords: ['voice notes', 'transcription', 'AI chat', 'note taking', 'voice to text'],
  authors: [{ name: 'VoiceNote Pro' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG as string

  return (
    <html lang="en">
      <head>
        {/* Console capture script for dashboard debugging */}
        <script src="/dashboard-console-capture.js" />
      </head>
      <body className={inter.className}>
        <AccessGuard>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </AccessGuard>
        {bucketSlug && <CosmicBadge bucketSlug={bucketSlug} />}
      </body>
    </html>
  )
}