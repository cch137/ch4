import type { Metadata } from "next";
import { appTitle } from "@/constants/app";
import { AIASST_DESC, AIASST_DESC_LINES, AIASST_PATH } from "@/constants/asst";
import MainLayout from "../../../components/MainLayout";
import MemberOnly from "@/components/MemberOnly";

export const metadata: Metadata = {
  title: appTitle("Assistant"),
  description: AIASST_DESC,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <MemberOnly
        nextPath={AIASST_PATH}
        title="AI Assistant"
        descriptions={AIASST_DESC_LINES}
      >
        {children}
      </MemberOnly>
    </MainLayout>
  );
}
