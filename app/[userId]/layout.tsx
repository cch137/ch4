import AppNavbar from '@/app/components/app-navbar'
import type { Metadata } from 'next';
import { appTitle } from '@/constants/app';

export const metadata: Metadata = {
  title: appTitle('User'),
  description: 'A user',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (<>
    <AppNavbar />
    {children}
  </>)
}
