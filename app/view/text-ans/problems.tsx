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
  const [_problems, setProblems] = useState<{ [chapter: string]: Problem[] }>(
    {}
  );
  const [isbn, chapter, problem] = isbn_c_p.split("_");
  const chapters = Object.keys(_problems).sort((a, b) => Number(a) - Number(b));
  const problems = chapters
    .map((c) => sortChapterProblems(_problems[c]))
    .flat();

  const _isbn = useRef("");
  useEffect(() => {
    if (isbn) {
      if (isbn !== _isbn.current) {
        _isbn.current = isbn;
        fetch(getQueryJSONUrl(`books/${isbn}/problems`)).then(async (res) =>
          setProblems((await res.json()) || {})
        );
      }
    }
  }, [setProblems, isbn, _isbn]);

  return (
    <problemsContext.Provider
      value={{
        problems,
      }}
    >
      {children}
    </problemsContext.Provider>
  );
}

export function useTextAnsPromblems() {
  return useContext(problemsContext).problems;
}
