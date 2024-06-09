"use client";

import "@/styles/react-markdown.css";

import type { ClassAttributes, HTMLAttributes } from "react";
import { useCallback, useEffect, useRef, useState, createRef } from "react";
import { Textarea } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { Select, SelectItem } from "@nextui-org/select";
import { Image } from "@nextui-org/image";
import Markdown, { ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { WKContentType } from "../provider";

function Anchor({
  className,
  children,
  ...props
}: ClassAttributes<HTMLAnchorElement> &
  HTMLAttributes<HTMLAnchorElement> &
  ExtraProps) {
  return (
    <a
      // @ts-ignore
      href={props.href}
      target="_blank"
      className={
        "underline opacity-75 decoration-default-500 hover:opacity-90 transition " +
        className
      }
      {...props}
    >
      {String(children).replace(/\n$/, "")}
    </a>
  );
}

function BlockImage({ meta }: { meta: string }) {
  const [id, setId] = useState("");
  const [filename, setFilename] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => {
    try {
      const { id = "", filename = "" } = JSON.parse(meta);
      setId(id);
      setFilename(filename);
      setError(false);
    } catch {
      setError(true);
    }
  }, [meta, setId, setFilename, setError]);
  try {
    if (error || !id || !filename) throw new Error();
    return (
      <div className="w-full">
        <Image
          src={`https://raw.githubusercontent.com/cch137/api-files/master/i/${id}/${filename}`}
          alt={filename}
          onError={() => setError(true)}
        />
      </div>
    );
  } catch {
    return <code className="text-danger-300">image render error</code>;
  }
}

export default function CardContent({
  _id,
  type,
  content,
  edit,
  isLoading,
  isEditable = false,
}: {
  _id: string;
  type: WKContentType;
  content: string;
  edit?: (
    type?: WKContentType,
    content?: string,
    images?: string[]
  ) => Promise<Response>;
  isLoading?: boolean;
  isEditable?: boolean;
}) {
  const textareaRef = createRef<HTMLTextAreaElement>();
  const [isPreview, setIsPreview] = useState(true);
  const idCache = useRef<string>();
  const [contentCache, setContentCache] = useState(content);
  const [typeCache, setTypeCache] = useState<WKContentType>();
  const editable = isEditable && !isPreview;

  useEffect(() => {
    if (idCache.current !== _id) {
      idCache.current = _id;
      setTypeCache(type);
      setContentCache(content);
      return;
    }
    if (!contentCache) {
      setContentCache(content);
      setIsPreview(Boolean(content));
      if (!content) textareaRef.current?.focus();
    }
    setTypeCache(type);
  }, [
    idCache,
    _id,
    type,
    content,
    typeCache,
    contentCache,
    setTypeCache,
    setContentCache,
    setIsPreview,
    textareaRef,
  ]);

  const startTypingAt = useRef(0);
  const saveTimeout = useRef<NodeJS.Timeout>();
  const saveContent = useCallback(
    (content: string) => {
      setContentCache(content);
      if (!edit) return;
      if (saveTimeout.current === void 0) {
        startTypingAt.current = Date.now();
      }
      if (Date.now() - startTypingAt.current > 1000) {
        edit(void 0, content);
        saveTimeout.current = void 0;
        return;
      }
      clearTimeout(saveTimeout.current);
      const timeout = setTimeout(() => {
        edit(void 0, content).finally(() => {
          if (timeout === saveTimeout.current) {
            saveTimeout.current = void 0;
          }
        });
      }, 500);
      saveTimeout.current = timeout;
    },
    [setContentCache, edit, saveTimeout]
  );

  if (!typeCache || (!contentCache && isLoading))
    return (
      <>
        <div className="opacity-50 select-none flex-center">
          <Spinner color="current" />
        </div>
      </>
    );

  return (
    <div className="flex flex-col w-full gap-4">
      {isEditable ? (
        <div className="flex justify-start items-center gap-2">
          <div className="text-sm">Content Type:</div>
          <Select
            aria-label="Content Type"
            placeholder="Content Type"
            size="sm"
            variant="bordered"
            className="w-32"
            selectedKeys={[typeCache]}
            onChange={(e) => {
              const v = e.target.value as WKContentType;
              setTypeCache((p) => v || p);
              if (v && edit) edit(v);
            }}
          >
            <SelectItem value="text" key="text">
              Text
            </SelectItem>
            <SelectItem value="md" key="md">
              Markdown
            </SelectItem>
          </Select>
        </div>
      ) : null}
      <div className="flex-1 overflow-hidden">
        {editable ? null : typeCache === "text" ? (
          <div
            className="bg-default-50 rounded-xl p-4"
            onClick={
              isEditable
                ? () => {
                    setIsPreview(false);
                    textareaRef.current?.focus();
                  }
                : void 0
            }
          >
            <p className="whitespace-break-spaces break-words">
              {contentCache}
            </p>
          </div>
        ) : typeCache === "md" ? (
          <div
            className="bg-default-50 rounded-xl p-4 react-markdown whitespace-break-spaces break-words"
            onClick={
              isEditable
                ? () => {
                    setIsPreview(false);
                    textareaRef.current?.focus();
                  }
                : void 0
            }
          >
            <Markdown components={{ a: Anchor }} remarkPlugins={[remarkGfm]}>
              {contentCache}
            </Markdown>
          </div>
        ) : typeCache === "image" ? (
          <BlockImage meta={contentCache} />
        ) : (
          <code className="text-danger-300">content render error</code>
        )}
        <div
          className={
            editable ? "" : "h-0 opacity-0 pointer-events-none overflow-hidden"
          }
        >
          <Textarea
            ref={textareaRef}
            value={contentCache}
            classNames={{
              inputWrapper: "bg-opacity-50",
              input: "text-md px-1 py-2",
            }}
            onValueChange={saveContent}
            onBlur={() => setIsPreview(true)}
            minRows={1}
            maxRows={20}
            readOnly={!editable}
          />
        </div>
      </div>
    </div>
  );
}
