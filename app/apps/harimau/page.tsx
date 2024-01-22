"use client"

import { BOOKBASE_URL, BOOKLIST_URL, QUESTIONBASE_URL, QUERY_URL_PARAM, CHAPTERS_URL_PARAM, LOCK_URL_PARAM } from "@/constants/apps/harimau";
import { Select, SelectItem } from "@nextui-org/select";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Button } from "@nextui-org/button";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { Link as UiLink } from "@nextui-org/link";
import { Spinner } from "@nextui-org/spinner";
import toolUrlParams from "@/app/tools/toolUrlParams";

interface Book {
  name: string
  url: string
  isbn: string
  filename: string
}

interface RawQuestion {
  isbn_c_p: string
  link: string
}

interface Question extends RawQuestion {
  isbn: string
  chapter: string
  problem: string
  ydiskId: string
}

export default function Harimau() {
  const color = 'secondary';
  const [questionsIsLoading, setQuestionsIsLoading] = useState(false);
  const [selectedBooknames, setSelectedBooknames] = useState<string[]>([]);
  const [booklist, setBooklist] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [lock, setLock] = useState(false);

  const getSelectedBook = useCallback(() => booklist.find((book) => selectedBooknames[0] === book.name) || null, [booklist, selectedBooknames]);

  const inited = useRef(false);
  const autoSelectedChapters = useRef<string[]>([]);
  const hasBookSelected = selectedBooknames.length !== 0;

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    (async () => {
      const booklist: string[] = await (await fetch(BOOKLIST_URL)).json();
      const books: Book[] = booklist.map(b => ({
        name: b.replace(/[\d]{8,}.json$/i, ''),
        url: BOOKBASE_URL + b,
        isbn: (b.match(/(\d+)\.json$/) || [])[1],
        filename: b,
      }));
      setBooklist(books);
      const urlParams = toolUrlParams(location);
      const autoloadQuery = urlParams.get(QUERY_URL_PARAM);
      const autoloadChapters = urlParams.get(CHAPTERS_URL_PARAM);
      setLock(urlParams.has(LOCK_URL_PARAM));
      if (autoloadQuery === null) return;
      const autoloadBookname = books.find(book => book.filename.includes(autoloadQuery))?.name;
      if (autoloadBookname === undefined) return;
      selectBook(autoloadBookname);
      if (autoloadChapters) autoSelectedChapters.current = autoloadChapters.split(',').map(c => c.trim());
    })();
  }, []);

  useEffect(() => {
    const book = getSelectedBook();
    const urlParams = toolUrlParams(location);
    if (book === null) {
      setSelectedChapters([]);
      setQuestions([]);
      setChapters([]);
      return;
    }
    const { url, isbn } = book;
    urlParams.set(QUERY_URL_PARAM, isbn);
    urlParams.delete(CHAPTERS_URL_PARAM);
    urlParams.replace();
    (async () => {
      setQuestionsIsLoading(true);
      const chapters: string[] = [];
      setQuestions((await (await fetch(url)).json() as RawQuestion[]).map((q) => {
        const { isbn_c_p, link } = q;
        const ydiskId = link.split('/').at(-1) || '';
        const [isbn, chapter, problem] = q.isbn_c_p.split('_');
        if (!chapters.includes(chapter)) chapters.push(chapter);
        return { isbn, chapter, problem, isbn_c_p, ydiskId, link: `${QUESTIONBASE_URL}${chapter}_${problem}?id=${ydiskId}&b=${isbn}` };
      }));
      setSelectedChapters([]);
      setChapters(chapters);
      setQuestionsIsLoading(false);
      if (autoSelectedChapters.current.length) {
        setSelectedChapters(autoSelectedChapters.current);
        autoSelectedChapters.current = [];
      }
    })();
  }, [selectedBooknames, getSelectedBook]);

  useEffect(() => {
    if (!inited.current || !hasBookSelected) return;
    const urlParams = toolUrlParams(location);
    if (selectedChapters.length === 0) urlParams.delete(CHAPTERS_URL_PARAM);
    else urlParams.set(CHAPTERS_URL_PARAM, selectedChapters.sort().join(','));
    urlParams.replace();
  }, [selectedChapters, hasBookSelected]);

  useEffect(() => {
    if (!inited.current || !hasBookSelected) return;
    const urlParams = toolUrlParams(location);
    if (lock) urlParams.set(LOCK_URL_PARAM, '1');
    else urlParams.delete(LOCK_URL_PARAM);
    urlParams.replace();
  }, [lock, hasBookSelected]);

  const selectBook = (bookname?: string) => {
    if (inited.current && bookname === '') return;
    if (!bookname) {
      const urlParams = toolUrlParams(location);
      urlParams.delete(QUERY_URL_PARAM);
      urlParams.delete(CHAPTERS_URL_PARAM);
      urlParams.delete(LOCK_URL_PARAM);
      urlParams.replace();
      setLock(false);
      setSelectedBooknames([]);
      return;
    };
    setSelectedBooknames([bookname]);
  }

  return <div className="flex-center flex-col w-full">
    <div className="max-w-2xl w-full py-8 px-4">
      <div className="text-center text-tiny text-default-400 pb-4 select-none">
        {`Belum try belum tau, sekali try hari hari mau. That's why harimau.`}
      </div>
      <div className="flex-center w-full">
        <div className="flex-1 h-16">
          <div className="relative">
            <div className="absolute w-full top-0 left-0">
              <div className="flex-center gap-2">
                <Select
                  isDisabled={(booklist.length === 0 || lock) && hasBookSelected}
                  label="Book"
                  placeholder="Please select a book"
                  className="BookSelect"
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => selectBook(e.target.value)}
                  selectedKeys={selectedBooknames}
                  variant="underlined"
                  color={color}
                  size="lg"
                >
                  {booklist.map((book) => (
                    <SelectItem color={color} variant="light" key={book.name} value={book.name}>
                      {book.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-center">
          {hasBookSelected && !lock ? <Button variant="light" isIconOnly onClick={() => selectBook()}>
            <IoCloseOutline style={({scale:1.5})} />
          </Button> : null}
        </div>
      </div>
      <div className="flex flex-col gap-8 py-8 pb-16">
        {questionsIsLoading
          ? (<div className="flex-center p-32">
              <Spinner size="lg" color={color} />
            </div>)
          : (<>
              {hasBookSelected ? <div className="flex-center flex gap-3">
                <Button onClick={() => setSelectedChapters([...chapters])} color={color} variant="light" isDisabled={chapters.length === selectedChapters.length || lock}>Expand All</Button>
                <Button onClick={() => setSelectedChapters([])} color={color} variant="light" isDisabled={selectedChapters.length === 0 || lock}>Collapse All</Button>
                <Button onClick={() => setLock(!lock)} color={color} variant={lock ? 'flat' : 'light'}>{lock ? 'Unlock' : 'Lock'}</Button>
              </div> : null}
              <div>
                <Accordion
                  selectionMode="multiple"
                  isCompact
                  key={selectedBooknames[0]}
                  motionProps={{
                    variants: {
                      enter: {
                        y: 0,
                        opacity: 1,
                        height: "auto",
                        transition: {
                          height: {
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            duration: 1,
                          },
                          opacity: {
                            easings: "ease",
                            duration: 1,
                          },
                        },
                      },
                      exit: {
                        y: -10,
                        opacity: .33,
                        height: 0,
                        transition: {
                          height: {
                            easings: "ease",
                            duration: 0.25,
                          },
                          opacity: {
                            easings: "ease",
                            duration: 0.3,
                          },
                        },
                      },
                    },
                  }}
                  selectedKeys={selectedChapters}
                  onSelectionChange={(keys) => lock ? null : setSelectedChapters(keys === 'all' ? [...chapters] : [...keys].map(k => k.toString()))}
                >
                  {chapters.map((chap) => (
                    <AccordionItem
                      key={chap}
                      aria-label={chap}
                      title={chap}
                      isDisabled={lock && !selectedChapters.includes(chap)}
                    >
                      <div className="flex flex-wrap gap-2 pb-8">
                        {questions.filter(q => q.chapter === chap)
                          .map(q => (
                            <UiLink
                              href={q.link}
                              underline="hover"
                              color={color}
                              size="md"
                              key={q.link}
                              draggable={true}
                              isExternal
                              style={({outline: 'none'})}
                            >
                              {q.problem}
                            </UiLink>
                          ))}
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </>)
        }
      </div>
    </div>
  </div>
}
