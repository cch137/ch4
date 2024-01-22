import type { Metadata } from 'next'
import { appName } from '@/constants/app'


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
      <body>
        {children}
      </body>
    </html>
  )
}
