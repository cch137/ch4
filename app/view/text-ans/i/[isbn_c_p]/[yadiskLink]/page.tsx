"use client";

import useInit from "@/hooks/useInit";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const isLink = typeof link === "string";
  const title = isbn_c_p ? `${chapter}_${problem}_${isbn}` : "Unknown";
  const url = link || "";

  useInit(() => {
    parseLink(yadiskLink).then(setLink);
  }, [setLink, params]);

  useEffect(() => {
    if (isLink) location.href = link;
  }, [isLink, url]);

  return (
    <>
      <title>{title}</title>
      <div className="flex-center h-dvh text-default-300 select-none">
        {isLink || link === undefined ? "loading..." : "resource not found"}
      </div>
    </>
  );
}
