"use client";

import { useIsBot, useBotDetect } from "@/hooks/useAppDataManager";
import { useEffect, useState } from "react";

export default function HeadlessTest() {
  const [ua, setUA] = useState<string>();
  const isBot = useIsBot();
  const botDetect = useBotDetect();
  useEffect(() => {
    setUA(navigator.userAgent);
  }, [setUA]);
  return (
    <>
      <pre>{`ua: ${ua}`}</pre>
      <pre>{`isBot: ${isBot}`}</pre>
      <pre>{`botDetect: ${JSON.stringify(botDetect, void 0, 4)}`}</pre>
    </>
  );
}
