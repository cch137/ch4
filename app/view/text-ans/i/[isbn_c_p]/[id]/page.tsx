"use client";

import useInit from "@/hooks/useInit";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const parseLink = (id: string) => {
  try {
    const xhr = new XMLHttpRequest();
    const metadataUrl = `https://cloud-api.yandex.net/v1/disk/public/resources?public_key=${decodeURIComponent(
      id
    )}`;
    xhr.open("GET", metadataUrl, false);
    xhr.send();
    const res = JSON.parse(xhr.responseText).sizes.find(
      (s: any) => s.name === "ORIGINAL"
    );
    const resourceUrl = res.url;
    if (!resourceUrl) throw new Error("Not Found");
    return resourceUrl;
  } catch {
    return null;
  }
};

export default function TextUnlockView() {
  const params = useParams();
  const isbn_c_p = Array.isArray(params.isbn_c_p)
    ? params.isbn_c_p[0]
    : params.isbn_c_p;
  const [isbn, chapter, problem] = isbn_c_p.split("_");
  const [link, setLink] = useState<string | null>();
  const isLink = typeof link === "string";
  const title = isbn_c_p ? `${chapter}_${problem}_${isbn}` : "Unknown";
  const url = link || "";

  useInit(() => {
    setLink(parseLink(Array.isArray(params.id) ? params.id[0] : params.id));
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
