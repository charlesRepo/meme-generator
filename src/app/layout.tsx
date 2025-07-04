import type { Metadata } from 'next'
import { Inter, Fira_Code } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const firacode = Fira_Code({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Meme Generator',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={firacode.className}>{children}</body>
    </html>
  )
}
