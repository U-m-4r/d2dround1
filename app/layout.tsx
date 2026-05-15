import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Decode2Deploy — Developer Investigation Challenge',
  description:
    'A cinematic developer ARG — investigate hidden trails, decode clues, and deploy your skills. By MPC.',
  keywords: ['hackathon', 'developer challenge', 'ARG', 'puzzle', 'investigation', 'MPC'],
  openGraph: {
    title: 'Decode2Deploy',
    description: 'Investigate. Decode. Deploy.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-bg antialiased">
        {children}
      </body>
    </html>
  )
}
