import "./optimize.css";
import "./globals.css";

import type { Metadata } from "next";
import { appTitle } from "@/constants/app";
import { sansFont, css } from "@/constants/font";

export const metadata: Metadata = {
  title: appTitle(),
  description: "A website that integrates many useful tools.",
  // openGraph: {
  //   title: `${appName}`,
  //   description: 'A website that integrates many useful tools.',
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={sansFont.className} suppressHydrationWarning>
        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: css }}
        />
        {children}
        <script async src="/t3.js"></script>
      </body>
    </html>
  );
}
