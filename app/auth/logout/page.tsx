"use client"

import FullpageSpinner from "@/app/components/fullpage-spiner";

export default function Logout() {
  return (
    <FullpageSpinner
      redirectTo="/"
      label="logging out..."
      callback={() => fetch('/api/auth/logout', { method: 'POST' })}
      delay={1500}
    />
  )
}
