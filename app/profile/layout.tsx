import type { Metadata } from "next";
import { appTitle } from "@/constants/app";
import MainLayout from "../components/MainLayout";

export const metadata: Metadata = {
  title: appTitle("Profile"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
