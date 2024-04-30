import { useCallback, useEffect, useRef, useState } from "react";
import useIsHeadlessBrowser from "./useIsHeadlessBrowser";
import useUserInfo from "./useUserInfo";
import useTTX from "./useTTX";

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

const neverBlock = true;

export default function useTTXSecure({
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
