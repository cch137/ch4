import "./optimize.css";
import "./globals.css";

import type { Metadata } from "next";
import { cookies } from "next/headers";

import { appTitle } from "@/constants/app";
import { sansFont, css } from "@/constants/font";
import type { AppData } from "@/constants/types";
import { TOKEN_COOKIE_NAME } from "@/constants/cookies";
import { AppDataManagerProvider } from "@/hooks/useAppDataManager";
import Token from "@/server/auth/tokenizer";

export const metadata: Metadata = {
  title: appTitle(),
  description: "A humble yet intricate corner of the internet.",
  referrer: "no-referrer",
  // openGraph: {
  //   title: `${appName}`,
  //   description: 'A website that integrates many useful tools.',
  // },
};

function initAppData(): AppData {
  const token = new Token(cookies().get(TOKEN_COOKIE_NAME)?.value);
  return { user: token.info };
}

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
      <body className={sansFont.className} suppressHydrationWarning>
        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: css }}
        />
        <AppDataManagerProvider appData={initAppData()}>
          {children}
        </AppDataManagerProvider>
      </body>
    </html>
  );
}
