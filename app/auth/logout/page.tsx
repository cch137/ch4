"use client"

import FullpageSpinner from "@/app/components/fullpage-spiner";
import { userInfoStore } from "@/hooks/useUserInfo";

export default function Logout() {
  return (
    <FullpageSpinner
      redirectTo="/"
      label="logging out..."
      callback={async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch {} finally {
          await userInfoStore.update();
        }
      }}
      delay={1500}
    />
  )
}
