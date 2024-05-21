"use client";

import NotFound from "@/app/not-found";
import { appTitle } from "@/constants/app";
import { getProblemLinks, getStaticLink } from "@/constants/apps/text-unlock";
import { useTTXSecure } from "@/hooks/useTTX";
import { Button } from "@nextui-org/button";
import { Image } from "@nextui-org/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { useTextAnsPromblems } from "../problems";
import { swipe } from "@/hooks/useAppDataManager";

const secure = false;

const parseLink = (id: string) => {
  try {
    const metadataUrl = `https://cloud-api.yandex.net/v1/disk/public/resources?public_key=${decodeURIComponent(
      id
    )}`;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", metadataUrl, false);
    xhr.send();
    return JSON.parse(xhr.responseText).sizes.find(
      (s: any) => s?.name === "ORIGINAL"
    ).url;
  } catch {}
  return null;
};

function ViewBlocker({
  message = "",
  show = false,
}: {
  message?: string;
  show?: boolean;
}) {
  return show ? (
    <div className="fixed top-0 m-auto h-screen z-50 flex-center select-none">
      <div className="text-default-300 text-2xl font-bold flex-center">
        {message}
      </div>
    </div>
  ) : null;
}

export default function TextAnsView() {
  const params = useParams();
  const isbn_c_p = Array.isArray(params.isbn_c_p)
    ? params.isbn_c_p[0]
    : params.isbn_c_p;
  const yadiskLink = Array.isArray(params.yadiskLink)
    ? params.yadiskLink[0]
    : params.yadiskLink;
  const [src, setSrc] = useState<string | null | undefined>(
    yadiskLink ? void 0 : getStaticLink(isbn_c_p)
  );

  const _yadiskLink = useRef("");
  useEffect(() => {
    if (!yadiskLink) return setSrc(getStaticLink(isbn_c_p));
    if (yadiskLink !== _yadiskLink.current) {
      _yadiskLink.current = yadiskLink;
      setSrc(parseLink(yadiskLink));
    }
  }, [setSrc, yadiskLink, _yadiskLink, isbn_c_p]);

  const [isbn, chapter, problem] = isbn_c_p.split("_");
  const title = isbn_c_p ? `${chapter}_${problem}_${isbn}` : "Unknown";
  const {
    ttxShow,
    ttxError,
    ttxBlock,
    ttxHasPass,
    ttxIsBlur,
    ttxIsBlurPending,
    ttxIsPressing,
    ttxIsPressingPending,
  } = useTTXSecure(src ? { textAnsViewLink: src } : void 0);
  const isBlockingView = secure && ttxIsBlurPending && ttxIsBlur;
  const allowCopy = ttxHasPass;
  const isBlur = secure && ttxIsBlur;
  const isLoading = src === undefined;
  const message = ttxIsPressing
    ? "keyup to focus"
    : ttxIsPressingPending
    ? "please wait"
    : "click to focus";

  const problems = useTextAnsPromblems();
  const index = problems.findIndex(({ isbn_c_p: _ }) => _ === isbn_c_p);
  const indexError = index === -1;
  const prevIndex = indexError ? null : index > 0 ? index - 1 : index;
  const nextIndex = indexError
    ? null
    : index < problems.length - 1
    ? index + 1
    : index;
  const prevProb = indexError ? null : problems[prevIndex!];
  const nextProb = indexError ? null : problems[nextIndex!];
  const prevProbHref = indexError
    ? null
    : getProblemLinks(
        prevProb!.isbn_c_p,
        encodeURIComponent(prevProb!.link || ""),
        !Boolean(yadiskLink)
      ).view;
  const nextProbHref = indexError
    ? null
    : getProblemLinks(
        nextProb!.isbn_c_p,
        encodeURIComponent(nextProb!.link || ""),
        !Boolean(yadiskLink)
      ).view;

  const router = useRouter();

  useEffect(() => {
    document.title = title;
  }, [title]);

  const goToIsbnCP = useCallback(
    (value?: string) => {
      if (!value) return;
      const prob = problems.find(({ isbn_c_p: _ }) => _ === value);
      if (!prob) return;
      router.push(
        getProblemLinks(
          prob.isbn_c_p,
          encodeURIComponent(prob.link || ""),
          !Boolean(yadiskLink)
        ).view
      );
    },
    [yadiskLink, router, problems]
  );

  useEffect(() => {
    const prev = () => goToIsbnCP(prevProb?.isbn_c_p);
    const next = () => goToIsbnCP(nextProb?.isbn_c_p);
    swipe.on("left", prev);
    swipe.on("right", next);
    return () => {
      swipe.off("left", prev);
      swipe.off("right", next);
    };
  }, [goToIsbnCP, prevProb, nextProb]);

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
      className="w-full h-dvh flex flex-col items-center overflow-y-scroll"
      onContextMenu={allowCopy ? void 0 : (e) => e.preventDefault()}
      onDoubleClick={allowCopy ? void 0 : (e) => e.preventDefault()}
    >
      <title>{appTitle(title)}</title>
      <div className="max-w-full" style={{ width: 960 }}>
        <div className="flex bg-default-50 sticky top-0 z-50">
          <Button
            isIconOnly
            className="rounded-none text-xl"
            variant="light"
            isDisabled={indexError || index === prevIndex}
            as={Link}
            href={prevProbHref || ""}
          >
            <IoArrowBack />
          </Button>
          <div className="flex-1 flex-center text-default-600 select-none">
            {indexError ? null : (
              <select
                className="focus:outline-none"
                onInput={(e) =>
                  goToIsbnCP((e.target as HTMLSelectElement).value)
                }
                value={isbn_c_p}
              >
                {problems.map((k, i) => (
                  <option key={i} value={k.isbn_c_p}>
                    {k.isbn_c_p.split("_").slice(1).join("_")}
                  </option>
                ))}
              </select>
            )}
          </div>
          <Button
            isIconOnly
            className="rounded-none text-xl"
            variant="light"
            isDisabled={indexError || index === nextIndex}
            as={Link}
            href={nextProbHref || ""}
          >
            <IoArrowForward />
          </Button>
        </div>
        {isLoading ? (
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-default-300 select-none">
            loading...
          </div>
        ) : !src ? (
          <NotFound />
        ) : (
          <Image
            alt={title}
            src={src}
            className={`rounded-none w-full select-none ${
              allowCopy ? "" : "pointer-events-none"
            } ${isBlur ? "blur" : ""}`}
            classNames={{ wrapper: allowCopy ? "" : "pointer-events-none" }}
            draggable="false"
            style={{ width: 960 }}
          />
        )}
      </div>
      <ViewBlocker show={isBlockingView} message={message} />
    </div>
  );
}
