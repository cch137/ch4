import type { Metadata } from "next";
import { appTitle } from "@/constants/app";
import { WKGroupProvider } from "../provider";

export const metadata: Metadata = {
  title: appTitle("Wakawaka"),
  description: "Study tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WKGroupProvider>{children}</WKGroupProvider>;
}
