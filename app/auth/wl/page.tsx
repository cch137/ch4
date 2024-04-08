'use client'

import FullpageSpinner from "@/app/components/fullpage-spiner";
import useTTX from "@/hooks/useTTX";

export default function AuthUnblock() {
  const { ttxRecord } = useTTX();
  return <FullpageSpinner redirectTo={`/`} callback={async () => prompt('What is your lucky number') === 'cch137' ? ttxRecord('wl') : null} />
}
