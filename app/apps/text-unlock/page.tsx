"use client";

import {
  getQueryJSONUrl,
  textUnlockBookPathname,
} from "@/constants/apps/text-unlock";
import { Button } from "@nextui-org/button";
import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [cachedBookIsbnList, setCachedBookIsbnList] = useState<string[]>([]);
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
    if (cachedBookIsbnList.length === 0) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", getQueryJSONUrl("cached-books"), false);
      xhr.send();
      const res = JSON.parse(xhr.responseText);
      setCachedBookIsbnList(res);
    }
  }, [cachedBookIsbnList, setCachedBookIsbnList]);

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
        // .slice(0, 100)
        .map(({ item }) => item)
    );
  }, [books, searchValue, setFilteredBooks]);

  return (
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col w-full max-w-screen-md py-8 max-sm:py-2 px-8 max-md:px-6 max-sm:px-4"
      style={{ height: "calc(100dvh - 3rem)" }}
    >
      <Input
        variant="bordered"
        classNames={{ input: "text-medium" }}
        value={searchValue}
        placeholder="Textbook"
        onValueChange={setSearchValue}
        // autoFocus
      />
      <Spacer y={4} />
      <div className="flex-1 overflow-auto border-2 border-solid border-default-200 rounded-lg">
        {(filteredBooks.length === 0
          ? books.filter(({ isbn }) => cachedBookIsbnList.includes(isbn))
          : filteredBooks
        ).map((b, i) => (
          <Button
            key={i}
            as={Link}
            className="flex h-9 w-full text-start justify-start rounded-none text-default-600 truncate"
            variant="light"
            href={textUnlockBookPathname(b.isbn)}
            title={b.name}
            prefetch={false}
          >
            {b.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
