import './optimize.css'
import './globals.css'

import type { Metadata } from 'next';
import { appTitle } from '@/constants/app';
import { font } from '@/constants/font';

export const metadata: Metadata = {
  title: appTitle(),
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
      <body className={font.className} suppressHydrationWarning>
        <style suppressHydrationWarning dangerouslySetInnerHTML={{__html: `.${font.className}{font-family:${font.style.fontFamily};font-style:${font.style.fontStyle};font-weight:300`}} />
        {children}
      </body>
    </html>
  )
}
