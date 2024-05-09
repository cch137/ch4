"use client";

import {
  useIsBot,
  useBotDetect,
  useUserAgent,
  useMouse,
  useIsFocus,
} from "@/hooks/useAppDataManager";
import { Button } from "@nextui-org/button";
import { useState } from "react";

const json = (o: any) => JSON.stringify(o, void 0, 4);

export default function AntiBot() {
  const [count, setCount] = useState(0);
  const ua = useUserAgent();
  const isFocus = useIsFocus();
  const isBot = useIsBot();
  const botDetect = useBotDetect();
  const mouse = useMouse();
  return (
    <>
      <Button id="count1" onClick={() => setCount((v) => v + 1)} size="sm">
        count: {count}
      </Button>
      <pre>{`mouse: ${json(mouse)}`}</pre>
      <pre className="text-wrap">{`isBot: ${isBot}`}</pre>
      <pre className="text-wrap">{`isFocus: ${isFocus}`}</pre>
      <pre className="text-wrap">{`botDetect (${count}): ${json(
        botDetect
      )}`}</pre>
      <details>
        <summary>ua</summary>
        <pre className="text-wrap">{`ua: ${json(ua)}`}</pre>
      </details>
      <Button id="count2" onClick={() => setCount((v) => v + 1)} size="sm">
        count: {count}
      </Button>
    </>
  );
}
