import { useCallback, useEffect, useState } from "react";

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
  const ttxExecUnblock = useCallback(
    () => (setShow(true), setBlock(false)),
    [setShow, setBlock]
  );
  const ttxExecBlock = useCallback(
    () => (setShow(false), setBlock(true)),
    [setShow, setBlock]
  );

  useEffect(() => {
    TTXRecordEvent.record("view2");
    window.addEventListener("TTX-welcome", ttxExecUnblock);
    window.addEventListener("TTX-block", ttxExecBlock);
    window.addEventListener("TTX-from-line", ttxExecBlock);
    window.addEventListener("TTX-from-ipad", ttxExecBlock);
    return () => {
      window.removeEventListener("TTX-welcome", ttxExecUnblock);
      window.removeEventListener("TTX-block", ttxExecBlock);
      window.addEventListener("TTX-from-line", ttxExecBlock);
      window.addEventListener("TTX-from-ipad", ttxExecBlock);
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
