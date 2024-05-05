import "./optimize.css";
import "./globals.css";

import type { Metadata } from "next";
import { cookies } from "next/headers";

import { appTitle } from "@/constants/app";
import { sansFontClassname, css } from "@/constants/font";
import { TOKEN_COOKIE_NAME } from "@/constants/cookies";
import { AppDataManagerProvider } from "@/hooks/useAppDataManager";
import Token from "@/server/auth/tokenizer";
import { v as version } from "@/server/version";

export const metadata: Metadata = {
  title: appTitle(),
  description: "A humble yet intricate corner of the internet.",
  referrer: "no-referrer",
  // openGraph: {
  //   title: `${appName}`,
  //   description: 'A website that integrates many useful tools.',
  // },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if((location.origin==='https://ch4.cch137.link'||location.origin==='https://x.cch137.link')&&location.pathname!=='/view/redirect')location=`/view/redirect?to=${decodeURIComponent(location.pathname+location.search)}`",
          }}
          suppressHydrationWarning
        />
        <script async src="/t3b.js" />
      </head>
      <body className={sansFontClassname} suppressHydrationWarning>
        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: css }}
        />
        <AppDataManagerProvider
          appData={{
            version,
            user: new Token(cookies().get(TOKEN_COOKIE_NAME)?.value).info,
          }}
        >
          {children}
        </AppDataManagerProvider>
      </body>
    </html>
  );
}
