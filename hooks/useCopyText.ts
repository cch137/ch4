import copyToClipboard from "@cch137/utils/webpage/copy-to-clipboard";
import { useRef, useState } from "react";

export default function useCopyText(
  text: string,
  options: { copiedTimeout?: number } = {}
) {
  const { copiedTimeout = 3000 } = options;
  const timeout = useRef<NodeJS.Timeout>();
  const [copied, setCopied] = useState(false);
  function copyText() {
    try {
      if (typeof text !== "string") throw new Error("Text is empty");
      copyToClipboard(text);
      setCopied(true);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), copiedTimeout);
    } catch {}
  }
  return [copied, copyText] as [boolean, () => void];
}
