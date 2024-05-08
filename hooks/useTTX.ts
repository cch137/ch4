import { useCallback, useEffect, useState, useRef } from "react";
import { useIsBot, useUserInfo } from "./useAppDataManager";

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
  const [ttxError, setError] = useState(false);
  const _ttxExecBlock = useCallback(
    (report: boolean) => {
      setShow(false);
      setBlock(true);
      setError(false);
      if (report) TTXRecordEvent.record("block");
    },
    [setShow, setBlock, setError]
  );
  const ttxExecBlock = useCallback(() => _ttxExecBlock(false), [_ttxExecBlock]);
  const ttxExecBlockR = useCallback(() => _ttxExecBlock(true), [_ttxExecBlock]);
  const ttxExecUnblock = useCallback(() => {
    setShow(true);
    setBlock(false);
    setError(false);
  }, [setShow, setBlock, setError]);
  const ttxOnError = useCallback(() => {
    setError(true);
  }, [setError]);
  const isHeadless = useIsBot();

  useEffect(() => {
    TTXRecordEvent.record("view2");
    if (isHeadless) ttxExecBlockR();
    window.addEventListener("TTX-welcome", ttxExecUnblock);
    window.addEventListener("TTX-block", ttxExecBlock);
    window.addEventListener("TTX-error", ttxOnError);
    window.addEventListener("TTX-from-line", ttxExecBlockR);
    window.addEventListener("TTX-from-ipad", ttxExecBlockR);
    return () => {
      window.removeEventListener("TTX-welcome", ttxExecUnblock);
      window.removeEventListener("TTX-block", ttxExecBlock);
      window.removeEventListener("TTX-error", ttxOnError);
      window.removeEventListener("TTX-from-line", ttxExecBlockR);
      window.removeEventListener("TTX-from-ipad", ttxExecBlockR);
    };
  }, [setShow, setBlock]);

  return {
    ttxBlock,
    ttxShow,
    ttxError,
    ttxExecUnblock,
    ttxExecBlock,
    ttxRecord: TTXRecordEvent.record,
  };
}

const neverBlock = true;

export function useTTXSecure({
  textAnsViewLink,
}: {
  textAnsViewLink?: string;
} = {}) {
  const { auth } = useUserInfo();
  const { ttxBlock, ttxShow, ttxError, ttxRecord } = useTTX();
  const isMember = auth > 3;
  const [isFocus, setIsFocus] = useState<boolean>();
  const [isPressing, setIsPressing] = useState(false);
  const [_isPressing, _setIsPressing] = useState(false);
  const notPressingTimeout = useRef<NodeJS.Timeout>();

  const initTextUnlockView = useCallback(() => {
    if (textAnsViewLink) {
      ttxRecord("text-ans-view", { link: textAnsViewLink });
      ttxRecord("known-text-ans");
    }
  }, [textAnsViewLink, ttxRecord]);

  const detectIsFocus = useCallback(() => {
    if (!isFocus) {
      setIsPressing(false);
      _setIsPressing(false);
    }
    const _isFocus = document.hasFocus();
    setIsFocus(_isFocus);
  }, [isFocus, _setIsPressing, setIsPressing, setIsFocus]);

  const setIsPressingT = useCallback(() => {
    clearTimeout(notPressingTimeout.current);
    _setIsPressing(true);
    setIsPressing(true);
  }, [_setIsPressing, setIsPressing, notPressingTimeout]);

  const setIsPressingF = useCallback(() => {
    _setIsPressing(false);
    setIsPressing(true);
    clearTimeout(notPressingTimeout.current);
    notPressingTimeout.current = setTimeout(() => {
      setIsPressing(false);
    }, 1000);
  }, [_setIsPressing, setIsPressing, notPressingTimeout]);

  useEffect(() => {
    if (typeof isFocus === "undefined") detectIsFocus();
    window.addEventListener("TTX-view", initTextUnlockView);
    window.addEventListener("focus", detectIsFocus);
    window.addEventListener("blur", detectIsFocus);
    window.addEventListener("keydown", setIsPressingT);
    window.addEventListener("keyup", setIsPressingF);
    return () => {
      window.removeEventListener("TTX-view", initTextUnlockView);
      window.removeEventListener("focus", detectIsFocus);
      window.removeEventListener("blur", detectIsFocus);
      window.removeEventListener("keydown", setIsPressingT);
      window.removeEventListener("keyup", setIsPressingF);
    };
  }, [
    isFocus,
    initTextUnlockView,
    detectIsFocus,
    setIsPressingT,
    setIsPressingF,
  ]);

  const ttxIsPressing = _isPressing;
  const ttxIsPressingPending = isPressing;
  const ttxHasPass = isMember;
  const ttxIsBlur = (!isFocus || isPressing) && !isMember;
  const ttxIsBlurPending = typeof isFocus === "undefined";

  return {
    ttxBlock: neverBlock ? false : ttxBlock,
    ttxShow,
    ttxError,
    ttxHasPass,
    ttxIsBlur,
    ttxIsBlurPending,
    ttxIsPressing,
    ttxIsPressingPending,
  };
}
