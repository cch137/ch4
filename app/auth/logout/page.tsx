"use client"

import FullpageSpinner from "@/app/components/fullpage-spiner";
import userInfo from "@/stores/user-info";

export default function Logout() {
  return (
    <FullpageSpinner
      redirectTo="/"
      label="logging out..."
      callback={async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch {} finally {
          await userInfo.update();
        }
      }}
      delay={1500}
    />
  )
}
