import type { Metadata } from "next";
import { appTitle } from "@/constants/app";
import { ProblemsContextProvider } from "./problems";
import TextAnsView from "./[isbn_c_p]/TextAnsView";

export const metadata: Metadata = {
  title: appTitle("TextUnlock"),
  description: "Textbook answers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProblemsContextProvider>
      <TextAnsView />
    </ProblemsContextProvider>
  );
}
