import type { Metadata } from 'next';
import { appTitle } from '@/constants/app';
import AppNavbar from '../components/app-navbar';

export const metadata: Metadata = {
  title: appTitle('Admin'),
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
