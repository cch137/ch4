import type { Metadata } from "next";
import { appTitle } from "@/constants/app";
import { AICHAT_DESC } from "@/constants/chat";
import MainLayout from "../../../components/MainLayout";

export const metadata: Metadata = {
  title: appTitle("Chat"),
  description: AICHAT_DESC,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout overflowYHidden>{children}</MainLayout>;
}
