"use client";

import NotFound from "@/app/not-found";
import { appTitle } from "@/constants/app";
import useTTX from "@/hooks/useTTX";
import useUserInfo from "@/hooks/useUserInfo";
import { unpackDataWithHash } from "@cch137/utils/shuttle";
import { Image } from "@nextui-org/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const parseLink = (id: string) => {
  try {
    return unpackDataWithHash(
      id.replace(/-/g, "+").replace(/_/g, "/"),
      "MD5",
      112
    );
  } catch {
    return null;
  }
};

export default function TextUnlockView() {
  const params = useParams();
  const link = parseLink(Array.isArray(params.id) ? params.id[0] : params.id);
  const isLink = typeof link === "string";
  const { auth } = useUserInfo();
  const { ttxBlock, ttxShow, ttxRecord } = useTTX();
  const isMember = auth > 3;
  const title = isLink ? link.split("?")[0] : "Unknown";
  const url = `https://api.cch137.link/ls/i/${link}`;
  const [isFocus, setIsFocus] = useState<boolean>();
  const [isPressing, setIsPressing] = useState(false);
  const [_isPressing, _setIsPressing] = useState(false);
  const blur = (!isFocus || isPressing) && !isMember;
  const notPressingTimeout = useRef<NodeJS.Timeout>();

  const initTextUnlockView = () => {
    if (!isLink) return;
    ttxRecord("text-ans-view", { link });
    ttxRecord("known-text-ans");
  };
  const detectIsFocus = () => {
    if (!isFocus) {
      setIsPressing(false);
      _setIsPressing(false);
    }
    const _isFocus = document.hasFocus();
    setIsFocus(_isFocus);
  };
  const setIsPressingT = () => {
    clearTimeout(notPressingTimeout.current);
    _setIsPressing(true);
    setIsPressing(true);
  };
  const setIsPressingF = () => {
    _setIsPressing(false);
    setIsPressing(true);
    clearTimeout(notPressingTimeout.current);
    notPressingTimeout.current = setTimeout(() => {
      setIsPressing(false);
    }, 1000);
  };

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

  if (ttxBlock || !isLink) return <NotFound />;

  return (
    <div
      className="w-full flex-center"
      onContextMenu={isMember ? void 0 : (e) => e.preventDefault()}
      onDoubleClick={isMember ? void 0 : (e) => e.preventDefault()}
    >
      <title>{appTitle(title)}</title>
      <div className={`max-w-full ${isMember ? "" : "pointer-events-none"}`}>
        {ttxShow ? (
          <Image
            alt={url}
            src={url}
            className={`rounded-none w-full select-none ${
              isMember ? "" : "pointer-events-none"
            } ${blur ? "blur" : ""}`}
            classNames={{ wrapper: isMember ? "" : "pointer-events-none" }}
            draggable="false"
            style={{ width: 960 }}
          />
        ) : null}
      </div>
      {typeof isFocus !== "undefined" && blur ? (
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
