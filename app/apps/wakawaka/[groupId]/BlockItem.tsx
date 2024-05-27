import {
  useEffect,
  useState,
  type ClassAttributes,
  type HTMLAttributes,
} from "react";
import type { WKBlock } from "../provider";
import type { ExtraProps } from "react-markdown";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Image } from "@nextui-org/react";

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

export default function BlockItem({ item }: { item: WKBlock }): JSX.Element {
  if (item.type === "text")
    return (
      <div className="bg-default-50 rounded-md p-4">
        <p className="whitespace-break-spaces">{item.content}</p>
      </div>
    );
  if (item.type === "md")
    return (
      <div className="bg-default-50 rounded-md p-4 react-markdown">
        <Markdown components={{ a: Anchor }} remarkPlugins={[remarkGfm]}>
          {item.content}
        </Markdown>
      </div>
    );
  if (item.type === "image") return <BlockImage meta={item.content} />;
  return <code className="text-danger-300">block render error</code>;
}
