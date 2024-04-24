"use client";

import NotFound from "@/app/not-found";
import { appTitle } from "@/constants/app";
import useInit from "@/hooks/useInit";
import useTTX from "@/hooks/useTTX";
import useUserInfo from "@/hooks/useUserInfo";
import { Image } from "@nextui-org/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const parseLink = (id: string) => {
  try {
    const xhr = new XMLHttpRequest();
    const metadataUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${decodeURIComponent(
      id
    )}`;
    xhr.open("GET", metadataUrl, false);
    xhr.send();
    const resourceUrl = JSON.parse(xhr.responseText).href;
    if (!resourceUrl) throw new Error("Not Found");
    return resourceUrl;
  } catch {
    return null;
  }
};

export default function TextUnlockView() {
  const params = useParams();
  const [isbn, chapter, problem] = (
    Array.isArray(params.isbn_c_p) ? params.isbn_c_p[0] : params.isbn_c_p
  ).split("_");
  const [link, setLink] = useState<string | null>();
  const isLink = typeof link === "string";
  const { auth } = useUserInfo();
  const { ttxBlock, ttxShow, ttxError, ttxRecord } = useTTX();
  const isMember = auth > 3;
  const title = isLink ? `${chapter}_${problem}_${isbn}` : "Unknown";
  const url = link || "";
  const [isFocus, setIsFocus] = useState<boolean>();
  const [isPressing, setIsPressing] = useState(false);
  const [_isPressing, _setIsPressing] = useState(false);
  const blur = (!isFocus || isPressing) && !isMember;
  const notPressingTimeout = useRef<NodeJS.Timeout>();

  useInit(() => {
    setLink(parseLink(Array.isArray(params.id) ? params.id[0] : params.id));
  }, [setLink, params]);

  const initTextUnlockView = useCallback(() => {
    if (!isLink) return;
    ttxRecord("text-ans-view", { link });
    ttxRecord("known-text-ans");
  }, [isLink, link, ttxRecord]);
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

  if (link === undefined)
    return (
      <div className="flex-center h-dvh text-default-300 select-none">
        loading...
      </div>
    );

  if (!isLink) return <NotFound />;
  if (!isMember && !ttxError) {
    if (ttxBlock) return <NotFound />;
    if (!ttxShow) return <></>;
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
          alt={url}
          src={url}
          className={`rounded-none w-full select-none ${
            isMember ? "" : "pointer-events-none"
          } ${blur ? "blur" : ""}`}
          classNames={{ wrapper: isMember ? "" : "pointer-events-none" }}
          draggable="false"
          style={{ width: 960 }}
        />
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
