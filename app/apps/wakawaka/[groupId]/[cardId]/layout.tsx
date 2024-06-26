import type { Metadata } from "next";
import { appTitle } from "@/constants/app";
import { WKCardProvider } from "../../provider";

export const metadata: Metadata = {
  title: appTitle("Wakawaka"),
  description: "Study tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WKCardProvider>{children}</WKCardProvider>;
}
