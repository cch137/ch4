"use client";

import NotFound from "@/app/not-found";
import { appTitle } from "@/constants/app";
import useInit from "@/hooks/useInit";
import useTTXSecure from "@/hooks/useTTXSecure";
import { Image } from "@nextui-org/react";
import { useParams } from "next/navigation";
import { useState } from "react";

const secure = false;

const parseLink = async (id: string) => {
  try {
    const metadataUrl = `https://cloud-api.yandex.net/v1/disk/public/resources?public_key=${decodeURIComponent(
      id
    )}`;
    const { url } = (await (await fetch(metadataUrl)).json()).sizes.find(
      (s: any) => s.name === "ORIGINAL"
    );
    if (!url) throw new Error("Not Found");
    return url;
  } catch {}
  return null;
};

export default function TextUnlockView() {
  const params = useParams();
  const yadiskLink = Array.isArray(params.yadiskLink)
    ? params.yadiskLink[0]
    : params.yadiskLink;
  const isbn_c_p = Array.isArray(params.isbn_c_p)
    ? params.isbn_c_p[0]
    : params.isbn_c_p;
  const [isbn, chapter, problem] = isbn_c_p.split("_");
  const [link, setLink] = useState<string | null>();
  const title = isbn_c_p ? `${chapter}_${problem}_${isbn}` : "Unknown";
  const url = link || "";
  const {
    ttxShow,
    ttxError,
    ttxBlock,
    ttxHasPass,
    ttxIsBlur,
    ttxIsBlurPending,
    ttxIsPressing,
    ttxIsPressingPending,
  } = useTTXSecure(link ? { textAnsViewLink: link } : void 0);

  useInit(() => {
    parseLink(yadiskLink).then(setLink);
  }, [yadiskLink, setLink]);

  if (secure) {
    if (!ttxHasPass && !ttxError) {
      if (ttxBlock) return <NotFound />;
      if (!ttxShow) return <></>;
    }
  } else {
    if (ttxBlock) return <NotFound />;
  }

  const isLoading = link === undefined;

  return (
    <div
      className="w-full flex-center"
      onContextMenu={ttxHasPass ? void 0 : (e) => e.preventDefault()}
      onDoubleClick={ttxHasPass ? void 0 : (e) => e.preventDefault()}
    >
      <title>{appTitle(title)}</title>
      <div className={`max-w-full ${ttxHasPass ? "" : "pointer-events-none"}`}>
        {isLoading ? (
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-default-300 select-none">
            loading...
          </div>
        ) : (
          <Image
            alt={title}
            src={url}
            className={`rounded-none w-full select-none ${
              ttxHasPass ? "" : "pointer-events-none"
            } ${!secure ? "" : ttxIsBlur ? "blur" : ""}`}
            classNames={{ wrapper: ttxHasPass ? "" : "pointer-events-none" }}
            draggable="false"
            style={{ width: 960 }}
          />
        )}
      </div>
      {!secure ? null : ttxIsBlurPending && ttxIsBlur ? (
        <div className="fixed top-0 m-auto h-screen z-50 flex-center select-none">
          <div className="text-default-300 text-2xl font-bold flex-center">
            {ttxIsPressing
              ? "keyup to focus"
              : ttxIsPressingPending
              ? "please wait"
              : "click to focus"}
          </div>
        </div>
      ) : null}
    </div>
  );
}
