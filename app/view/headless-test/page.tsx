"use client";

import { useIsBot, useBotDetect } from "@/hooks/useAppDataManager";
import { Button } from "@nextui-org/button";
import { useEffect, useState } from "react";

export default function HeadlessTest() {
  const [count, setCount] = useState(0);
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
      <Button onClick={() => setCount((v) => v + 1)}>count: {count}</Button>
      <pre>{`botDetect (${count}): ${JSON.stringify(
        botDetect,
        void 0,
        4
      )}`}</pre>
    </>
  );
}
