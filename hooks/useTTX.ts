import { useEffect, useState } from "react";

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

  useEffect(() => {
    const unblock = () => (setShow(true), setBlock(false));
    const block = () => (setShow(false), setBlock(true));
    TTXRecordEvent.record("view2");
    window.addEventListener("TTX-welcome", unblock);
    window.addEventListener("TTX-block", block);
    return () => {
      window.removeEventListener("TTX-welcome", unblock);
      window.removeEventListener("TTX-block", block);
    };
  }, [setShow, setBlock]);

  return {
    ttxBlock,
    ttxShow,
    ttxRecord: TTXRecordEvent.record,
  };
}
