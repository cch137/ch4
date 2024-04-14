import { useCallback, useEffect, useState } from "react";
import useIsHeadlessBrowser from "./useIsHeadlessBrowser";

class TTXRecordEvent extends Event {
  data: { type: string; data: Record<string, any> };
  constructor(type = "", data = {}) {
    super("TTX-record");
    this.data = { type, data };
  }
  static record(type = "", data: Record<string, any> = {}) {
    window.dispatchEvent(new TTXRecordEvent(type, data));
  }
}

export default function useTTX() {
  const [ttxShow, setShow] = useState(false);
  const [ttxBlock, setBlock] = useState(false);
  const _ttxExecBlock = useCallback(
    (report: boolean) => {
      setShow(false);
      setBlock(true);
      if (report) TTXRecordEvent.record("block");
    },
    [setShow, setBlock]
  );
  const ttxExecBlock = useCallback(() => _ttxExecBlock(false), [_ttxExecBlock]);
  const ttxExecBlockR = useCallback(() => _ttxExecBlock(true), [_ttxExecBlock]);
  const ttxExecUnblock = useCallback(
    () => (setShow(true), setBlock(false)),
    [setShow, setBlock]
  );
  const isHeadless = useIsHeadlessBrowser();

  useEffect(() => {
    TTXRecordEvent.record("view2");
    if (isHeadless) ttxExecBlockR();
    window.addEventListener("TTX-welcome", ttxExecUnblock);
    window.addEventListener("TTX-block", ttxExecBlock);
    window.addEventListener("TTX-from-line", ttxExecBlockR);
    window.addEventListener("TTX-from-ipad", ttxExecBlockR);
    return () => {
      window.removeEventListener("TTX-welcome", ttxExecUnblock);
      window.removeEventListener("TTX-block", ttxExecBlock);
      window.addEventListener("TTX-from-line", ttxExecBlockR);
      window.addEventListener("TTX-from-ipad", ttxExecBlockR);
    };
  }, [setShow, setBlock]);

  return {
    ttxBlock,
    ttxShow,
    ttxExecUnblock,
    ttxExecBlock,
    ttxRecord: TTXRecordEvent.record,
  };
}
