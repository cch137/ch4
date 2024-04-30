"use client";

import FullpageSpinner from "@/app/components/FullpageSpinner";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useSearchParams } from "next/navigation";

export default function SignOut() {
  const user = useUserInfo();
  const search = useSearchParams();
  const next = search.get("next");
  return (
    <FullpageSpinner
      redirectTo={next || "/"}
      label="Signing out..."
      callback={async () => {
        try {
          await fetch("/api/auth/signout", { method: "POST" });
        } catch {
        } finally {
          await user.update();
        }
      }}
      delay={1000}
    />
  );
}
