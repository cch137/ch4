"use client"

import './oracle.css'

import { Button } from "@nextui-org/button"
import { Spacer } from "@nextui-org/spacer"
import { Spinner } from "@nextui-org/spinner"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { IoChevronBackOutline, IoCloseOutline } from "react-icons/io5"

type ImageSource = {
  svg: string
  name: string
}

type InferSource  = string[]

const apiOrigin = 'https://api.cch137.link';
// const apiOrigin = 'http://localhost:5000';
const cache = new Map<string, ImageSource[]>();

function CharRow({char, removeChar}: {char: string, removeChar: () => void}) {
  const [sources, setSources] = useState<ImageSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const res: ImageSource[] = cache.get(char) || await (await fetch(`${apiOrigin}/ccamc-images`, {
          method: 'POST',
          body: `q=${char}`
        })).json();
        setSources(res);
        cache.set(char, res);
      } catch {}
      setIsLoading(false);
    })();
  }, [setSources, char]);
  return <div className="p-4 border-1 border-solid border-default-300 rounded-xl">
    <div className="flex">
      <h3 className="text-2xl font-extrabold flex-1">{char}</h3>
      <Button size="sm" isIconOnly variant="bordered" className="text-2xl" onClick={removeChar}>
        <IoCloseOutline />
      </Button>
    </div>
    <Spacer y={4} />
    {isLoading ? <Spinner /> : <div className="flex flex-wrap">
      {sources.map(({svg, name}, i) => <div
        key={i}
        className="oracle-svg-wrapper"
        title={name}
        dangerouslySetInnerHTML={{ __html: svg }}
      />)}
    </div>}
  </div>
}

export default function Oracle() {
  const [chars, setChars] = useState<string[]>([]);

  const addChars = (_chars: string[]) => {
    const newChars: string[] = [];
    _chars.forEach((i) => {
        if (!chars.includes(i) && !newChars.includes(i)) newChars.push(i);
      });
    if (newChars.length) setChars(_ => [...newChars, ..._]);
  }

  const [isAddingInfer, setIsAddingInfer] = useState(false);
  const getInfer = useCallback(async (q: string | null) => {
    if (!q) return [];
    setIsAddingInfer(true);
    try {
      const infer: InferSource = await (await fetch(`${apiOrigin}/ccamc-infer`, {
        method: 'POST',
        body: `q=${q}`
      })).json();
      return infer;
    } catch {
      alert('建議字獲取失敗');
    } finally {
      setIsAddingInfer(false);
    }
    return [];
  }, [setIsAddingInfer]);

  const removeChars = () => setChars([]);
  
  return <div className="px-4 py-8 max-w-screen-lg m-auto">
    <div className="flex gap-4">
      <Button isIconOnly variant="flat" className="text-2xl" as={Link} href="/apps/ncu">
        <IoChevronBackOutline />
      </Button>
      <Button onClick={() => addChars((prompt('新增文字:')||'').split(''))}>
        新增文字
      </Button>
      <Button onClick={() => getInfer(prompt('關鍵字:')).then(infer => addChars(infer))} isLoading={isAddingInfer}>
        新增建議
      </Button>
      <div className="flex-1" />
      <Button onClick={removeChars} variant="flat" color="danger">
        清除全部
      </Button>
    </div>
    <div className="flex flex-col gap-4 py-4">
      {chars.map((char, i) => <CharRow char={char} removeChar={() => setChars(_ => _.filter(v => v !== char))} key={i} />)}
    </div>
  </div>
}
