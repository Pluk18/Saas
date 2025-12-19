import type { Metadata } from 'next'
import { Sarabun, Kanit } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-sarabun',
  display: 'swap',
})

const kanit = Kanit({
  weight: ['400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-kanit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ระบบจัดการร้านทองคำ | Gold Jewelry POS',
  description: 'ระบบ POS และการจัดการสำหรับร้านจำหน่ายทองคำ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={`${sarabun.variable} ${kanit.variable}`}>
      <body className="font-sans bg-neutral-50 text-neutral-900 antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1c1917',
              fontFamily: 'var(--font-sarabun)',
            },
            success: {
              iconTheme: {
                primary: '#b8884f',
                secondary: '#fff',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}

