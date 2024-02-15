import type { Metadata } from 'next';
import { appTitle } from '@/constants/app';

export const metadata: Metadata = {
  title: appTitle('Images to PDF'),
  description: 'Images to PDF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (<>
    {children}
  </>)
}
