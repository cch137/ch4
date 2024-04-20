import type { Metadata } from "next";
import { appName } from "@/constants/app";
import MainLayout from "../components/MainLayout";

export const metadata: Metadata = {
  description: "Welcome to " + appName,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
