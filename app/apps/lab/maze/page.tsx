"use client"

import "./maze.css";

import { Button } from "@nextui-org/button";
import random, { Random } from "@cch137/utils/random";
import { useRef, useState } from "react";
import useInit from "@/hooks/useInit";
import { IoKeypadOutline, IoRefreshOutline } from "react-icons/io5";

export default function Maze() {
  const [seed, _seed] = useState(0);
  const SIZE = 35;
  const rd = useRef(new Random(0));

  const inputSeed = () => {
    const seed = (prompt('Seed:')||'').trim();
    if (!seed) return;
    setSeed(Number(seed));
  }

  const setSeed = (seed: number = random.randInt(0, 2147483647)) => {
    _seed(seed);
    rd.current = new Random(seed);
    return seed;
  }

  const getCell = (x: number, y: number) => {
    return document.getElementById(`maze-${x}-${y}`);
  }

  const inited = useInit(() => {
    setSeed();
  });

  return (inited.current ? <div className="flex justify-start items-start">
    <div className="flex-center flex-col p-8 gap-4 m-auto">
      <div className="flex-center max-w-sm w-full gap-2 text-lg text-default-600">
        <span>seed:</span>
        <span>{seed}</span>
        <span className="flex-1" />
        <Button isIconOnly size="sm" className="h-8" variant="bordered" onClick={inputSeed}>
          <IoKeypadOutline className="text-lg" />
        </Button>
        <Button isIconOnly size="sm" className="h-8" variant="bordered" onClick={() => setSeed()}>
          <IoRefreshOutline className="text-lg" />
        </Button>
      </div>
      <div className="flex">
        {Array.from({ length: SIZE }, (_, i) => i).map((x) => (
          <div className="maze-col" key={x}>{
            Array.from({ length: SIZE }, (_, i) => i).map((y) => {
              const isWallTilte = x % 2 === 0 || y % 2 === 0;
              const isWall = isWallTilte ? rd.current.random() < 0.5 : false;
              return <div
                key={y}
                className={[
                  "maze-cell outline-1 outline outline-default-300",
                  isWall ? "wall" : '',
                ].join(' ')}
                id={`maze-${x}-${y}`}
              />
            })
          }</div>)
        )}
      </div>
    </div>
  </div> : null)
}
