"use client";

import { createContext, useState, useContext, useEffect, useRef } from "react";

import {
  getQueryJSONUrl,
  Problem,
  sortChapterProblems,
} from "@/constants/apps/text-unlock";
import { useParams } from "next/navigation";

const problemsContext = createContext({
  problems: [] as {
    p: string;
    isbn_c_p: string;
    link: string;
  }[],
  isReady: false,
});

export function ProblemsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const isbn_c_p = Array.isArray(params.isbn_c_p)
    ? params.isbn_c_p[0]
    : params.isbn_c_p;
  const [problems, setProblems] = useState<
    {
      p: string;
      isbn_c_p: string;
      link: string;
    }[]
  >([]);
  const [isbn, chapter, problem] = isbn_c_p.split("_");

  const [isReady, setIsReady] = useState(false);
  const _isbn = useRef("");
  const _ctrl = useRef<AbortController>();
  useEffect(() => {
    if (isbn) {
      if (isbn !== _isbn.current) {
        _isbn.current = isbn;
        if (_ctrl.current) _ctrl.current.abort();
        const ac = new AbortController();
        _ctrl.current = ac;
        setIsReady(false);
        setProblems([]);
        fetch(getQueryJSONUrl(`books/${isbn}/problems`), {
          signal: ac.signal,
        }).then(async (res) => {
          try {
            const res = await fetch(getQueryJSONUrl(`books/${isbn}/problems`), {
              signal: ac.signal,
            });
            const data = ((await res.json()) || {}) as {
              [chapter: string]: Problem[];
            };
            const chapters = Object.keys(data).sort(
              (a, b) => Number(a) - Number(b)
            );
            const problems = chapters
              .map((c) => sortChapterProblems(data[c]))
              .flat();
            setProblems(problems);
          } finally {
            setIsReady(true);
          }
        });
      }
    }
  }, [setProblems, setIsReady, isbn, _isbn]);

  return (
    <problemsContext.Provider
      value={{
        isReady,
        problems,
      }}
    >
      {children}
    </problemsContext.Provider>
  );
}

export function useTextAnsPromblems() {
  return useContext(problemsContext);
}
