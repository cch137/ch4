"use client";

import {
  useIsBot,
  useBotDetect,
  useUserAgent,
  useMouse,
  useIsFocus,
} from "@/hooks/useAppDataManager";
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
      <button
        id="count1"
        className="border-1"
        onClick={() => setCount((v) => v + 1)}
      >
        count: {count}
      </button>
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
      <button
        id="count2"
        className="border-1"
        onClick={() => setCount((v) => v + 1)}
      >
        count: {count}
      </button>
    </>
  );
}
