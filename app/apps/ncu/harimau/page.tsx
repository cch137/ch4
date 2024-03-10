"use client"

import { BOOKBASE_URL, BOOKLIST_URL, QUESTIONBASE_URL, QUERY_URL_PARAM, CHAPTERS_URL_PARAM, LOCK_URL_PARAM, PREVIEW_URL_PARAM, OPEN_AS_INTERNAL_URL_PARAM } from "@/constants/apps/ncu";
import { Select, SelectItem } from "@nextui-org/select";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Button } from "@nextui-org/button";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { IoCloseOutline, IoEye, IoEyeOff, IoLockClosed, IoLockOpen, IoMenuOutline } from "react-icons/io5";
import Link from "next/link";
import { Link as UiLink } from "@nextui-org/link";
import { Spinner } from "@nextui-org/spinner";
import { Image } from "@nextui-org/image";
import toolUrlParams from "@/app/tools/toolUrlParams";
import { MdInsertLink, MdInsertPhoto, MdUnfoldLess, MdUnfoldMore } from "react-icons/md";
import useErrorMessage from "@/hooks/useErrorMessage";
import useInit from "@/hooks/useInit";
import { packDataWithHash } from "@cch137/utils/shuttle";

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
  internalLink: string
  externalLink: string
}

export default function Harimau() {
  const color = 'secondary';
  const [questionsIsLoading, setQuestionsIsLoading] = useState(false);
  const [selectedBooknames, setSelectedBooknames] = useState<string[]>([]);
  const [booklist, setBooklist] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedChapters, _setSelectedChapters] = useState<string[]>([]);
  const [lock, setLock] = useState(false);
  const [preview, setPreview] = useState(false);
  const [openAsInternalLink, setOpenAsInternalLink] = useState(false);
  const [displayUrl, setDisplayUrl] = useState('');

  const getSelectedBook = useCallback(() => booklist.find((book) => selectedBooknames[0] === book.name) || null, [booklist, selectedBooknames]);

  const {
    openErrorMessageBox,
    errorMessageBox,
  } = useErrorMessage();

  const lastSelectedChapters = useRef([...selectedChapters]);
  const setSelectedChapters = useCallback((keys: string[]) => {
    if (keys.length > 3 && preview) {
      openErrorMessageBox(
        lastSelectedChapters.current.length === 0
          ? 'Please disable preview mode to load more sections.'
          : 'Too many images have been loaded, please close some sections.',
        'Warning'
      );
      _setSelectedChapters(lastSelectedChapters.current);
    } else {
      lastSelectedChapters.current = keys;
      _setSelectedChapters(keys);
    }
  }, [_setSelectedChapters, preview, lastSelectedChapters, openErrorMessageBox]);

  const autoSelectedChapters = useRef<string[]>([]);
  const hasBookSelected = selectedBooknames.length !== 0;

  const inited = useInit(() => {
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
      setPreview(urlParams.has(PREVIEW_URL_PARAM));
      setOpenAsInternalLink(urlParams.has(OPEN_AS_INTERNAL_URL_PARAM));
      if (autoloadQuery === null) return;
      const autoloadBookname = books.find(book => book.filename.includes(autoloadQuery))?.name;
      if (autoloadBookname === undefined) return;
      selectBook(autoloadBookname);
      if (autoloadChapters) autoSelectedChapters.current = autoloadChapters.split(',').map(c => c.trim());
    })();
  }, []);

  useEffect(() => {
    const exitOptimazedImage = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDisplayUrl('');
      e.preventDefault();
    }
    document.addEventListener('keyup', exitOptimazedImage);
    return () => {
      document.removeEventListener('keyup', exitOptimazedImage);
    }
  }, [displayUrl, setDisplayUrl]);

  const selectBook = useCallback((bookname?: string) => {
    if (inited.current && bookname === '') return;
    if (!bookname) {
      const urlParams = toolUrlParams(location);
      urlParams.delete(QUERY_URL_PARAM);
      urlParams.delete(CHAPTERS_URL_PARAM);
      urlParams.delete(LOCK_URL_PARAM);
      urlParams.delete(PREVIEW_URL_PARAM);
      urlParams.delete(OPEN_AS_INTERNAL_URL_PARAM);
      urlParams.replace();
      setLock(false);
      setSelectedBooknames([]);
      return;
    };
    setSelectedBooknames([bookname]);
  }, [inited, setLock, setSelectedBooknames]);

  const loadedBook = useRef<Book|null>(null);
  useEffect(() => {
    const book = getSelectedBook();
    const urlParams = toolUrlParams(location);
    if (loadedBook.current === book) return;
    loadedBook.current = book;
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
        const externalLink = `${QUESTIONBASE_URL}${chapter}_${problem}?id=${ydiskId}&b=${isbn}`;
        const internalLink = `/view/harimau/${packDataWithHash(externalLink.split('/').at(-1), 'MD5', 112).toBase64().replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}`;
        return { isbn, chapter, problem, isbn_c_p, ydiskId, link, internalLink, externalLink };
      }));
      setSelectedChapters([]);
      setChapters(chapters);
      setQuestionsIsLoading(false);
      if (autoSelectedChapters.current.length) {
        setSelectedChapters(autoSelectedChapters.current);
        autoSelectedChapters.current = [];
      }
    })();
  }, [getSelectedBook, setSelectedChapters, selectedChapters]);

  useEffect(() => {
    if (!inited.current || !hasBookSelected) return;
    const urlParams = toolUrlParams(location);
    if (selectedChapters.length === 0) urlParams.delete(CHAPTERS_URL_PARAM);
    else urlParams.set(CHAPTERS_URL_PARAM, selectedChapters.sort().join(','));
    urlParams.replace();
  }, [inited, selectedChapters, hasBookSelected]);

  useEffect(() => {
    if (!inited.current || !hasBookSelected) return;
    const urlParams = toolUrlParams(location);
    if (lock) urlParams.set(LOCK_URL_PARAM, '1');
    else urlParams.delete(LOCK_URL_PARAM);
    if (preview) urlParams.set(PREVIEW_URL_PARAM, '1');
    else urlParams.delete(PREVIEW_URL_PARAM);
    if (openAsInternalLink) urlParams.set(OPEN_AS_INTERNAL_URL_PARAM, '1');
    else urlParams.delete(OPEN_AS_INTERNAL_URL_PARAM);
    urlParams.replace();
  }, [inited, lock, preview, openAsInternalLink, hasBookSelected]);

  const preventDefault = (e: any) => e.preventDefault();

  return <>
    {errorMessageBox}
    {displayUrl ? <div style={{height: '100dvh', width: '100dvw'}} className="fixed flex-center top-0 left-0 bg-black bg-opacity-75 backdrop-blur-sm z-50">
      <div className="relative z-50 h-full">
        <Button isIconOnly className="absolute top-4 left-4 text-2xl rounded-full" variant="flat" onClick={() => setDisplayUrl('')}>
          <IoCloseOutline />
        </Button>
      </div>
      <div className="flex-1 h-full" onClick={() => setDisplayUrl('')} onContextMenu={preventDefault} />
      <div className="max-w-full overflow-y-scroll" style={{maxHeight: '100%'}} onClick={preventDefault} onContextMenu={(preventDefault)}>
        <Image
          alt={displayUrl}
          src={displayUrl}
          classNames={{wrapper: 'rounded-none'}}
          className="rounded-none select-none pointer-events-none"
          draggable="false"
          onClick={preventDefault}
          width={870}
        />
      </div>
      <div className="flex-1 h-full" onClick={() => setDisplayUrl('')} onContextMenu={preventDefault} />
    </div> : null}
    <div className="flex-center flex-col w-full">
      <div className={`${preview ? '' : 'max-w-2xl'} w-full py-8 px-4`}>
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
            {lock ? null : hasBookSelected ? (
              <Button variant="light" isIconOnly onClick={() => selectBook()}>
                <IoCloseOutline className="text-2xl text-default-300" />
              </Button>
            ) : (
              <Button variant="light" isIconOnly as={Link} href="/apps/ncu">
                <IoMenuOutline className="text-2xl text-default-300" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-8 py-8 pb-16">
          {questionsIsLoading
            ? (<div className="flex-center p-32">
                <Spinner size="lg" color={color} />
              </div>)
            : (<>
                {hasBookSelected ? <div className="flex-center flex gap-3">
                  <Button onClick={() => setSelectedChapters([...chapters])} color={color} variant="light" isDisabled={chapters.length === selectedChapters.length || lock} isIconOnly className="text-2xl"><MdUnfoldMore /></Button>
                  <Button onClick={() => setSelectedChapters([])} color={color} variant="light" isDisabled={selectedChapters.length === 0 || lock} isIconOnly className="text-2xl"><MdUnfoldLess /></Button>
                  <Button onClick={() => setLock(!lock)} color={color} variant={lock ? 'flat' : 'light'} isIconOnly className="text-lg">{lock ? <IoLockClosed /> : <IoLockOpen />}</Button>
                  <Button onClick={() => (selectedChapters.length > 3) ? setPreview(false) : setPreview(!preview)} color={color} variant="light" isIconOnly className="text-lg">{preview ? <IoEye /> : <IoEyeOff />}</Button>
                  <Button onClick={() => setOpenAsInternalLink(!openAsInternalLink)} color={color} variant="light" isIconOnly className="text-2xl">{openAsInternalLink ? <MdInsertPhoto /> : <MdInsertLink />}</Button>
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
                            .map(({problem, internalLink, externalLink}) => {
                              return preview ? (
                                <Link 
                                  className="relative select-none"
                                  href={internalLink}
                                  target="_blank"
                                  key={internalLink}
                                  onClick={(e) => {if (!openAsInternalLink) return; e.preventDefault(); setDisplayUrl(externalLink)}}
                                >
                                  <Image
                                    width={160}
                                    alt={problem}
                                    src={externalLink}
                                    style={{height: 120, objectPosition: 'top', objectFit: 'cover'}}
                                    className="pointer-events-none select-none"
                                    onContextMenu={preventDefault}
                                    draggable="false"
                                  />
                                  <div className="absolute bottom-0 left-0 py-1 z-10 w-full text-sm flex-center text-secondary-600 bg-opacity-75 bg-black">
                                    <span>{problem}</span>
                                  </div>
                                </Link>
                              ) : (
                                <UiLink
                                  href={internalLink}
                                  underline="hover"
                                  color={color}
                                  size="md"
                                  key={internalLink}
                                  draggable={true}
                                  isExternal
                                  style={({outline: 'none'})}
                                  onClick={(e) => {if (!openAsInternalLink || e.ctrlKey) return; e.preventDefault(); setDisplayUrl(externalLink)}}
                                >
                                  {problem}
                                </UiLink>
                              );
                          })}
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
  </>
}
