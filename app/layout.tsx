import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './optimize.css'
import './globals.css'
import { appName } from '@/constants/app'
import Navbar from './navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: `${appName}`,
  description: 'A website that integrates many useful tools.',
  // openGraph: {
  //   title: `${appName}`,
  //   description: 'A website that integrates many useful tools.',
  // },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
