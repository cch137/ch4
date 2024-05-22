import type { Metadata } from "next";
import { appTitle } from "@/constants/app";
import { AICHAT_DESC, AICHAT_PATH } from "@/constants/chat";
import MainLayout from "../../../components/MainLayout";
import MemberOnly from "@/components/MemberOnly";

export const metadata: Metadata = {
  title: appTitle("Chat"),
  description: AICHAT_DESC,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout overflowYHidden>
      <MemberOnly
        nextPath={AICHAT_PATH}
        title="AI Chat"
        descriptions={[
          "A simple AI chat app by @cch137.",
          "Offers various models for free.",
          "This is for everyone.",
        ]}
      >
        {children}
      </MemberOnly>
    </MainLayout>
  );
}
