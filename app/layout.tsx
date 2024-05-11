import "./optimize.css";
import "./globals.css";

import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import uaParser from "ua-parser-js";

import { appTitle } from "@/constants/app";
import { sansFontClassname, css } from "@/constants/font";
import { TOKEN_COOKIE_NAME } from "@/constants/cookies";
import { AppDataManagerProvider } from "@/hooks/useAppDataManager";
import Token from "@/server/auth/tokenizer";
import { v as version } from "@/server/version";
import { packDataWithHash } from "@cch137/utils/shuttle";

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
  const ua = headers().get("User-Agent") || "";
  return (
    <html lang="en" className="dark">
      <head>
        <script async src="/t3b.js" />
      </head>
      <body className={sansFontClassname} suppressHydrationWarning>
        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: css }}
        />
        <AppDataManagerProvider
          appData={packDataWithHash(
            {
              version,
              user: new Token(cookies().get(TOKEN_COOKIE_NAME)?.value).info,
              isHeadless: /headless/.test(ua),
              ua: new uaParser(ua).getResult(),
              isDev: process.env.NODE_ENV === "development",
            },
            256,
            137
          ).toBase64()}
        >
          {children}
        </AppDataManagerProvider>
      </body>
    </html>
  );
}
