import type { Metadata } from "next";
import { appTitle } from "@/constants/app";
import MainLayout from "@/components/MainLayout";
import MemberOnly from "@/components/MemberOnly";
import {
  WAKAWAKA_APPNAME,
  WAKAWAKA_APPPATH,
} from "@/app/apps/wakawaka/constants";
import { WKProvider } from "./provider";

export const metadata: Metadata = {
  title: appTitle("Wakawaka"),
  description: "Study tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <WKProvider>
        <MemberOnly
          title={WAKAWAKA_APPNAME}
          descriptions={"Study tool"}
          nextPath={WAKAWAKA_APPPATH}
        >
          {children}
        </MemberOnly>
      </WKProvider>
    </MainLayout>
  );
}
