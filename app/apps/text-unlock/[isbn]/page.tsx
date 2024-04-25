"use client";

import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Skeleton } from "@nextui-org/skeleton";
import { Spacer } from "@nextui-org/spacer";
import {
  MdUnfoldLess,
  MdUnfoldMore,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";

import {
  getQueryJSONUrl,
  TEXTUNLOCK_PATHNAME,
  getProblemLinks,
} from "@/constants/apps/text-unlock";
import useInit from "@/hooks/useInit";
import { appTitle } from "@/constants/app";
import { Image } from "@nextui-org/image";
import { IoMdClose } from "react-icons/io";
import Collapsible from "@/app/components/Collapsible";

type Problem = {
  isbn_c_p: string;
  link: string;
};

function ChapterSection({
  chapter,
  problems,
  isCached,
  openPreview,
  isOpen,
  open,
  close,
}: {
  chapter: string;
  problems: Problem[];
  isCached: boolean;
  openPreview: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}) {
  const [_renderSection, setRenderSection] = useState(false);
  const renderSection = isOpen || _renderSection;
  const sortedProblems = problems
    .map(({ isbn_c_p, link }) => ({
      isbn_c_p,
      p: isbn_c_p.split("_").at(-1)!,
      link,
    }))
    .map((item) => {
      const numeric = Number(
        item.p
          .split("")
          .filter((i) => "1234567890".includes(i))
          .join("")
      );
      const alphabetic = item.p
        .split("")
        .filter((i) => !"1234567890".includes(i))
        .join("");
      return { item, numeric, alphabetic };
    })
    .sort((a, b) => a.numeric - b.numeric)
    // .sort((a, b) => {
    //   if (a.alphabetic > b.alphabetic) return 1;
    //   if (a.alphabetic < b.alphabetic) return -1;
    //   return 0;
    // })
    .map(({ item: { p, isbn_c_p, link } }) => ({ p, isbn_c_p, link }));
  const closeRenderSection = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (isOpen) {
      setRenderSection(true);
      clearTimeout(closeRenderSection.current);
    } else {
      closeRenderSection.current = setTimeout(
        () => setRenderSection(false),
        1000
      );
    }
  }, [isOpen, setRenderSection]);
  return (
    <Collapsible isOpen={isOpen} open={open} close={close} summary={chapter}>
      <div
        className={`flex flex-wrap gap-2 pt-1 pb-4 transition ${
          isOpen ? "" : "opacity-0"
        }`}
      >
        {!renderSection
          ? null
          : sortedProblems.map(({ isbn_c_p, p, link }, i) => {
              const { view, preview } = getProblemLinks(
                isbn_c_p,
                encodeURIComponent(link),
                isCached
              );
              return openPreview ? (
                <Link
                  key={i}
                  href={view}
                  target="_blank"
                  className="relative select-none text-sm text-default-500 border-transparent transition"
                  prefetch={false}
                >
                  <Image
                    width={160}
                    alt={p}
                    src={preview}
                    style={{
                      height: 120,
                      objectPosition: "top",
                      objectFit: "cover",
                    }}
                    className="pointer-events-none select-none"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                  />
                  <div className="absolute bottom-0 left-0 py-1 z-10 w-full text-sm flex-center text-default-600 bg-opacity-75 bg-black">
                    <span>{p}</span>
                  </div>
                </Link>
              ) : (
                <Link
                  key={i}
                  href={view}
                  target="_blank"
                  className="text-sm text-default-500 border-b-2 border-solid border-transparent hover:border-current transition"
                  prefetch={false}
                >
                  {p}
                </Link>
              );
            })}
      </div>
    </Collapsible>
  );
}

function ActionButton({
  onClick,
  isDisabled = false,
  children,
}: {
  onClick?: () => void;
  isDisabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex-center size-8 rounded-lg hover:bg-default-100 bg-transparent transition cursor-pointer ${
        isDisabled ? "opacity-50 pointer-events-none" : ""
      }`}
      onClick={isDisabled ? void 0 : onClick}
    >
      {children}
    </div>
  );
}

export default function TextUnlockBook() {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const _isbn: string = Array.isArray(params.isbn)
    ? params.isbn[0]
    : params.isbn;
  const [bookname, setBookname] = useState("");
  const [isbn, setIsbn] = useState("");
  const [isCached, setIsCached] = useState(false);
  const [_openPreview, setOpenPreview] = useState(false);
  const openPreview = _openPreview && isCached;
  const [chapters, setChapters] = useState<string[]>([]);
  const [problems, setProblems] = useState<{ [chapter: string]: Problem[] }>(
    {}
  );
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [searchParamsLoaded, setSearchParamsLoaded] = useState(false);
  const [chaptersLoaded, setChaptersLoaded] = useState(false);
  const [error, setError] = useState(false);

  useInit(() => {
    const controller = new AbortController();
    fetch(getQueryJSONUrl(`books/${_isbn}/book`), { signal: controller.signal })
      .then(async (res) => {
        const { isbn, name, chapters, cached } = await res.json();
        setIsbn(isbn || "Unknown");
        setBookname(name || "Unknown");
        setChapters(
          ((chapters || []) as string[]).sort((a, b) => Number(a) - Number(b))
        );
        setIsCached(Boolean(cached));
      })
      .catch(() => {
        controller.abort();
        setError(true);
        setIsbn("Unknown");
        setBookname("Unknown");
      });
    fetch(getQueryJSONUrl(`books/${_isbn}/problems`), {
      signal: controller.signal,
    })
      .then(async (res) => {
        setProblems((await res.json()) || {});
      })
      .catch(() => {
        controller.abort();
        setError(true);
      })
      .finally(() => {
        setChaptersLoaded(true);
      });
  }, [
    bookname,
    setIsbn,
    setBookname,
    setChapters,
    setProblems,
    setIsCached,
    setError,
    setChaptersLoaded,
  ]);

  const chaptersParamName = "c";
  const openPreviewParamName = "p";

  const createQueryString = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedChapters.length)
      params.set(chaptersParamName, selectedChapters.join("_"));
    else params.delete(chaptersParamName);
    if (openPreview) params.set(openPreviewParamName, "1");
    else params.delete(openPreviewParamName);
    return params.toString();
  }, [searchParams, selectedChapters, openPreview]);

  useEffect(() => {
    const query = createQueryString();
    history.replaceState(
      history.state,
      "",
      query ? `${pathname}?${query}` : pathname
    );
  }, [pathname, createQueryString]);

  useEffect(() => {
    if (searchParamsLoaded) return;
    const chapters = (searchParams.get(chaptersParamName) || "").split("_");
    const openPreview = searchParams.has(openPreviewParamName);
    if (chapters.length === 0) return;
    setSearchParamsLoaded(true);
    setSelectedChapters(chapters.filter((i) => i));
    setOpenPreview(openPreview);
  }, [
    searchParams,
    searchParamsLoaded,
    setSearchParamsLoaded,
    setSelectedChapters,
    setOpenPreview,
  ]);

  return (
    <div
      className={`m-auto transition ${chaptersLoaded ? "" : "opacity-50"} ${
        openPreview ? "w-full" : "max-w-screen-md"
      }`}
    >
      {!error ? null : (
        <div className="pb-4 text-danger-400">Oops! Something went wrong.</div>
      )}
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="text-sm text-default-300">
            {isbn ? (
              `ISBN: ${isbn}`
            ) : (
              <Skeleton className="h-4 mb-1 w-32 rounded" />
            )}
          </div>
          <h1 className="text-xl text-default-600 pb-1">
            {bookname ? (
              <>
                <title>{appTitle(`${bookname}`)}</title>
                {bookname}
              </>
            ) : (
              <Skeleton className="h-8 w-full rounded" />
            )}
          </h1>
        </div>
        <Link href={TEXTUNLOCK_PATHNAME} className="mt-2 h-max rounded-lg">
          <ActionButton>
            <IoMdClose className="text-default-400 text-xl" />
          </ActionButton>
        </Link>
      </div>
      {chaptersLoaded || chapters.length ? (
        <div className="flex gap-2">
          <ActionButton
            onClick={() => setSelectedChapters(chapters)}
            isDisabled={selectedChapters.length === chapters.length}
          >
            <MdUnfoldMore className="text-xl" />
          </ActionButton>
          <ActionButton
            onClick={() => setSelectedChapters([])}
            isDisabled={selectedChapters.length === 0}
          >
            <MdUnfoldLess className="text-xl" />
          </ActionButton>
          {!isCached ? null : (
            <ActionButton onClick={() => setOpenPreview((i) => !i)}>
              {openPreview ? (
                <MdVisibility className="text-xl" />
              ) : (
                <MdVisibilityOff className="text-xl" />
              )}
            </ActionButton>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 pt-8">
          {new Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded" />
          ))}
        </div>
      )}
      <Spacer y={4} />
      {chapters.map((c, i) => (
        <ChapterSection
          key={i}
          chapter={c}
          problems={problems[c] || []}
          isCached={isCached}
          openPreview={openPreview}
          isOpen={selectedChapters.includes(c)}
          open={() => setSelectedChapters((l) => [...l, c].sort())}
          close={() => setSelectedChapters((l) => l.filter((i) => i !== c))}
        />
      ))}
      <Spacer y={8} />
    </div>
  );
}
