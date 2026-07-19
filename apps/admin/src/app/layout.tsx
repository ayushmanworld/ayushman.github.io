import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ayushman Admin',
  description: 'Ayushman Platform Administration',
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen bg-gray-950 font-sans text-gray-100 antialiased">
        {children}
      </body>
    </html>
  )
}
