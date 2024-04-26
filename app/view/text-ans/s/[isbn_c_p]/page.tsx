"use client";

import NotFound from "@/app/not-found";
import { appTitle } from "@/constants/app";
import { getStaticLink } from "@/constants/apps/text-unlock";
import useTTXSecure from "@/hooks/useTTXSecure";
import { Image } from "@nextui-org/image";
import { useParams } from "next/navigation";

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
  const {
    ttxShow,
    ttxError,
    ttxBlock,
    ttxHasPass,
    ttxIsBlur,
    ttxIsBlurPending,
    ttxIsPressing,
    ttxIsPressingPending,
  } = useTTXSecure({ textAnsViewLink: link });

  if (secure) {
    if (!ttxHasPass && !ttxError) {
      if (ttxBlock) return <NotFound />;
      if (!ttxShow) return <></>;
    }
  } else {
    if (ttxBlock) return <NotFound />;
  }

  return (
    <div
      className="w-full flex-center"
      onContextMenu={ttxHasPass ? void 0 : (e) => e.preventDefault()}
      onDoubleClick={ttxHasPass ? void 0 : (e) => e.preventDefault()}
    >
      <title>{appTitle(title)}</title>
      <div className={`max-w-full ${ttxHasPass ? "" : "pointer-events-none"}`}>
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
