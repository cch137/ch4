import type { Metadata } from "next";
import { appTitle } from "@/constants/app";
import { AIASST_DESC } from "@/constants/asst";
import MainLayout from "../../../components/MainLayout";

export const metadata: Metadata = {
  title: appTitle("Assistant"),
  description: AIASST_DESC,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
