import type { Metadata } from "next";
import { appTitle } from "@/constants/app";
import MainLayout from "../../components/MainLayout";
import { AiChatProvider } from "./useAiChat";

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
      <AiChatProvider>{children}</AiChatProvider>
    </MainLayout>
  );
}
