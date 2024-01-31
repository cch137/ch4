import type { Metadata } from 'next';
import { appTitle } from '@/constants/app';
import { AIASST_DESC } from '@/constants/asst';

export const metadata: Metadata = {
  title: appTitle('Assistant'),
  description: AIASST_DESC,
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
