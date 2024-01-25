"use client"

import FullpageSpinner from "@/app/components/fullpage-spiner";
import { userInfoStore } from "@/hooks/useUserInfo";

export default function SignOut() {
  return (
    <FullpageSpinner
      redirectTo="/"
      label="Signing out..."
      callback={async () => {
        try {
          await fetch('/api/auth/signout', { method: 'POST' });
        } catch {} finally {
          await userInfoStore.update();
        }
      }}
      delay={1000}
    />
  )
}
