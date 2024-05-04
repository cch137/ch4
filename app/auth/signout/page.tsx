"use client";

import { Redirect } from "@/app/not-found";
import { useUserInfo } from "@/hooks/useAppDataManager";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function _SignOut() {
  const user = useUserInfo();
  const search = useSearchParams();
  const next = search.get("next");
  return (
    <Redirect
      to={next || "/"}
      label="Signing out..."
      callback={async () => {
        try {
          await fetch("/api/auth/signout", { method: "POST" });
        } catch {
        } finally {
          await user.update();
        }
      }}
      sleep={1000}
    />
  );
}

export default function SignOut() {
  return (
    <Suspense>
      <_SignOut />
    </Suspense>
  );
}
