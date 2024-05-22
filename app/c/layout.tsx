import type { Metadata } from "next";
import { appTitle } from "@/constants/app";
import MainLayout from "../../components/MainLayout";
import { AiChatProvider } from "./useAiChat";
import MemberOnly from "@/components/MemberOnly";
import { AICHAT_SHORTPATH } from "@/constants/chat";

export const metadata: Metadata = {
  title: appTitle("Chat"),
  description: "Free AI chatbots for everyone.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout overflowYHidden>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "if(location.origin.startsWith('https://'))location='/apps/ai-chat/'",
        }}
        suppressHydrationWarning
      />
      <AiChatProvider>
        <MemberOnly
          nextPath={AICHAT_SHORTPATH}
          title="AI Chat"
          descriptions={[
            "A simple AI chat app by @cch137.",
            "Offers various models for free.",
            "This is for everyone.",
          ]}
        >
          {children}
        </MemberOnly>
      </AiChatProvider>
    </MainLayout>
  );
}
