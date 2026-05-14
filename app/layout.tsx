import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'F12X × MAGICFIT | Client Dashboard',
  description: 'Premium influencer marketing dashboard for F12X × MAGICFIT campaigns.',
  generator: 'next',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-neutral-950 selection:bg-lime-400/30 selection:text-lime-400">
      <body className="font-sans antialiased bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(132,204,22,0.1),rgba(255,255,255,0))] text-neutral-50 min-h-screen">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
