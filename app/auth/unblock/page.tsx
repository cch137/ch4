'use client'

import FullpageSpinner from "@/app/components/fullpage-spiner";
import useTTX from "@/hooks/useTTX";

export default function AuthUnblock() {
  const { ttxRecord } = useTTX();
  return <FullpageSpinner redirectTo={`/`} callback={async () => ttxRecord('unblock')} />
}
