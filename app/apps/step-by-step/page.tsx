"use client";

import {
  getQueryJSONUrl,
  stepByStepBookPathname,
  TEXTUNLOCK_PATHNAME,
} from "@/constants/apps/text-unlock";
import { Button } from "@nextui-org/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Link as UiLink } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import Fuse from "fuse.js";
import { Spacer } from "@nextui-org/spacer";

interface Book {
  name: string;
  isbn: string;
}

export default function StepByStep() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (books.length === 0) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", getQueryJSONUrl("books"), false);
      xhr.send();
      const res = JSON.parse(xhr.responseText);
      setBooks(res);
    }
  }, [books, setBooks]);

  useEffect(() => {
    const fuseOptions = {
      // isCaseSensitive: false,
      // includeScore: false,
      // shouldSort: true,
      // includeMatches: false,
      // findAllMatches: false,
      // minMatchCharLength: 1,
      // location: 0,
      // threshold: 0.6,
      distance: 1000,
      // useExtendedSearch: false,
      // ignoreLocation: false,
      // ignoreFieldNorm: false,
      // fieldNormWeight: 1,
      keys: ["isbn", "name"],
    };
    const fuse = new Fuse(books, fuseOptions);
    setFilteredBooks(
      fuse
        .search(searchValue)
        .slice(0, 100)
        .map(({ item }) => item)
    );
  }, [books, searchValue, setFilteredBooks]);

  return (
    <>
      <div>
        <UiLink
          className="text-default-400 text-xs border-b-2 border-solid border-current -translate-y-2"
          as={Link}
          href={TEXTUNLOCK_PATHNAME}
          prefetch={false}
        >
          cached textbooks
        </UiLink>
      </div>
      <Input
        variant="bordered"
        size="sm"
        classNames={{ input: "text-medium" }}
        value={searchValue}
        placeholder="Textbook"
        onValueChange={setSearchValue}
        autoFocus
      />
      <Spacer y={4} />
      <div
        className="overflow-auto border-2 border-solid border-default-200 rounded-lg"
        style={{ height: "75dvh" }}
      >
        {filteredBooks.map((b, i) => (
          <Button
            key={i}
            as={Link}
            className="flex h-9 w-full text-start justify-start rounded-none text-default-600 truncate"
            variant="light"
            href={stepByStepBookPathname(b.isbn)}
            title={b.name}
          >
            {b.name}
          </Button>
        ))}
      </div>
    </>
  );
}
