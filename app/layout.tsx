import './optimize.css'
import './globals.css'

import type { Metadata } from 'next';
import { appTitle } from '@/constants/app';
import { sansFont, serifFont } from '@/constants/font';

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
      <body className={sansFont.className} suppressHydrationWarning>
        <style suppressHydrationWarning dangerouslySetInnerHTML={{__html: `.${sansFont.className}{font-family:${sansFont.style.fontFamily}}.${serifFont.className}{font-family:${serifFont.style.fontFamily}}`}} />
        {children}
      </body>
    </html>
  )
}
