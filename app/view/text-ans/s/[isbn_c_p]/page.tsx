"use client";

import NotFound from "@/app/not-found";
import { appTitle } from "@/constants/app";
import { getStaticLink } from "@/constants/apps/text-unlock";
import useTTX from "@/hooks/useTTX";
import useUserInfo from "@/hooks/useUserInfo";
import { Image } from "@nextui-org/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const secure = false;

export default function TextUnlockView() {
  const params = useParams();
  const isbn_c_p = Array.isArray(params.isbn_c_p)
    ? params.isbn_c_p[0]
    : params.isbn_c_p;
  const [isbn, chapter, problem] = isbn_c_p.split("_");
  const title = isbn_c_p ? `${chapter}_${problem}_${isbn}` : "Unknown";
  const link = getStaticLink(isbn_c_p);
  const url = link || "";
  const { auth } = useUserInfo();
  const { ttxBlock, ttxShow, ttxError, ttxRecord } = useTTX();
  const isMember = auth > 3;
  const [isFocus, setIsFocus] = useState<boolean>();
  const [isPressing, setIsPressing] = useState(false);
  const [_isPressing, _setIsPressing] = useState(false);
  const blur = (!isFocus || isPressing) && !isMember;
  const notPressingTimeout = useRef<NodeJS.Timeout>();

  const initTextUnlockView = useCallback(() => {
    ttxRecord("text-ans-view", { link });
    ttxRecord("known-text-ans");
  }, [link, ttxRecord]);
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

  if (secure) {
    if (!isMember && !ttxError) {
      if (ttxBlock) return <NotFound />;
      if (!ttxShow) return <></>;
    }
  }

  return (
    <div
      className="w-full flex-center"
      onContextMenu={isMember ? void 0 : (e) => e.preventDefault()}
      onDoubleClick={isMember ? void 0 : (e) => e.preventDefault()}
    >
      <title>{appTitle(title)}</title>
      <div className={`max-w-full ${isMember ? "" : "pointer-events-none"}`}>
        <Image
          alt={title}
          src={url}
          className={`rounded-none w-full select-none ${
            isMember ? "" : "pointer-events-none"
          } ${!secure ? "" : blur ? "blur" : ""}`}
          classNames={{ wrapper: isMember ? "" : "pointer-events-none" }}
          draggable="false"
          style={{ width: 960 }}
        />
      </div>
      {!secure ? null : typeof isFocus !== "undefined" && blur ? (
        <div className="fixed top-0 m-auto h-screen z-50 flex-center select-none">
          <div className="text-default-300 text-2xl font-bold flex-center">
            {_isPressing
              ? "keyup to focus"
              : isPressing
              ? "please wait"
              : "click to focus"}
          </div>
        </div>
      ) : null}
    </div>
  );
}
