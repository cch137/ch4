import type { Metadata } from "next";
import { appTitle } from "@/constants/app";

export const metadata: Metadata = {
  title: appTitle("Apps"),
  description: "Applications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
