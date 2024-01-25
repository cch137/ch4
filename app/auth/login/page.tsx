'use client'

import FullpageSpinner from "@/app/components/fullpage-spiner";

export default function AuthRedirect() {
  return <FullpageSpinner redirectTo={`/auth/signin`} />
}
