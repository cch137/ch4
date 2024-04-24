"use client";

import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { createRef, useCallback, useEffect, useState } from "react";

import { Skeleton } from "@nextui-org/skeleton";
import { Spacer } from "@nextui-org/spacer";
import { Button } from "@nextui-org/button";
import {
  MdChevronLeft,
  MdKeyboardArrowDown,
  MdUnfoldLess,
  MdUnfoldMore,
} from "react-icons/md";

import {
  getQueryJSONUrl,
  STEPBYSTEP_PATHNAME,
  viewProblemPathname,
} from "@/constants/apps/text-unlock";
import useInit from "@/hooks/useInit";
import { appTitle } from "@/constants/app";

interface Problem {
  isbn_c_p: string;
  link: string;
}

const toNumber = (s: string) =>
  Number(
    s
      .split("")
      .filter((i) => "1234567890".includes(i))
      .join("")
  );

function ChapterSection({
  chapter,
  problems,
  isOpen,
  open,
  close,
}: {
  chapter: string;
  problems: Problem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
}) {
  const sectionRef = createRef<HTMLDivElement>();
  const [sectionHeight, setSectionHeight] = useState(0);
  useEffect(() => {
    setSectionHeight(sectionRef.current?.clientHeight || 0);
  }, [sectionRef, setSectionHeight]);
  return (
    <div className="border-b-1 border-solid border-default-200">
      <div>
        <div
          className="flex-center h-9 w-full text-medium cursor-pointer"
          onClick={isOpen ? close : open}
        >
          <div className="flex-1">{chapter}</div>
          <MdKeyboardArrowDown
            className={`${isOpen ? "" : "rotate-90"} transition`}
          />
        </div>
      </div>
      <div
        className={`transition-all ease-in-out overflow-hidden ${
          isOpen ? "" : "!h-0 opacity-0"
        }`}
        style={{ height: sectionHeight }}
      >
        <div className="flex flex-wrap gap-2 pt-1 pb-2" ref={sectionRef}>
          {problems
            .map(({ isbn_c_p, link }, i) => {
              const [_isbn, _c, p] = isbn_c_p.split("_");
              return { isbn_c_p, p, link };
            })
            .sort((a, b) => toNumber(a.p) - toNumber(b.p))
            .map(({ isbn_c_p, p, link }, i) => (
              <Link
                key={i}
                href={viewProblemPathname(isbn_c_p, encodeURIComponent(link))}
                target="_blank"
                className="text-sm text-default-500"
              >
                {p}
              </Link>
            ))}
        </div>
      </div>
      <Spacer y={isOpen ? 4 : 0} className="transition-height" />
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
  const [isbn, seIsbn] = useState("");
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
        const { isbn, name, chapters } = await res.json();
        seIsbn(isbn || "Unknown");
        setBookname(name || "Unknown");
        setChapters(
          ((chapters || []) as string[]).sort((a, b) => Number(a) - Number(b))
        );
      })
      .catch(() => {
        controller.abort();
        setError(true);
        seIsbn("Unknown");
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
    seIsbn,
    setBookname,
    setChapters,
    setProblems,
    setError,
    setChaptersLoaded,
  ]);

  const createQueryString = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedChapters.length) params.set("c", selectedChapters.join("_"));
    else params.delete("c");
    return params.toString();
  }, [searchParams, selectedChapters]);

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
    const chapters = (searchParams.get("c") || "").split("_");
    if (chapters.length === 0) return;
    setSearchParamsLoaded(true);
    setSelectedChapters(chapters.filter((i) => i));
  }, [
    searchParams,
    searchParamsLoaded,
    setSearchParamsLoaded,
    setSelectedChapters,
  ]);

  return (
    <div
      className={`m-auto max-w-screen-md transition ${
        chaptersLoaded ? "" : "opacity-50"
      }`}
    >
      <Button
        variant="light"
        size="sm"
        as={Link}
        href={STEPBYSTEP_PATHNAME}
        className="text-default-300 h-7 pl-2 -translate-y-2"
        startContent={<MdChevronLeft className="text-xl -mr-1" />}
      >
        Back
      </Button>
      {!error ? null : (
        <div className="pb-4 text-danger-400">Oops! Something went wrong.</div>
      )}
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
      {chaptersLoaded || chapters.length ? (
        <div className="flex gap-2">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onClick={() => setSelectedChapters(chapters)}
            isDisabled={selectedChapters.length === chapters.length}
          >
            <MdUnfoldMore className="text-xl" />
          </Button>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onClick={() => setSelectedChapters([])}
            isDisabled={selectedChapters.length === 0}
          >
            <MdUnfoldLess className="text-xl" />
          </Button>
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
          isOpen={selectedChapters.includes(c)}
          open={() => setSelectedChapters((l) => [...l, c].sort())}
          close={() => setSelectedChapters((l) => l.filter((i) => i !== c))}
        />
      ))}
      <Spacer y={8} />
    </div>
  );
}
