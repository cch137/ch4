"use client";

import FullpageSpinner from "@/app/components/fullpage-spiner";
import { useUserInfo } from "@/hooks/useUserInfo";

export default function SignOut() {
  const user = useUserInfo();
  return (
    <FullpageSpinner
      redirectTo="/"
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
