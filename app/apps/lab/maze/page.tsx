"use client"

import "./maze.css";

import { Button } from "@nextui-org/button";
import random, { Random } from "@cch137/utils/random";
import { RefObject, createRef, useRef, useState } from "react";
import useInit from "@/hooks/useInit";

const SIZE = 35;
class Maze {
  readonly seed: number;
  readonly rd: Random;
  readonly size: number;
  readonly columns: MazeCell[][];
  readonly cells: Set<MazeCell>;
  readonly wallNodes: Set<MazeCell>;

  constructor(seed: number = 0, size: number = SIZE) {
    this.seed = seed;
    const rd = new Random(seed);
    this.rd = rd;
    this.size = size;
    this.columns = Array.from({length: size}, (_, x) =>
      Array.from({length: size}, (_, y) => new MazeCell(this, x, y)));
    this.cells = new Set(this.columns.flat());
    this.wallNodes = new Set([...this.cells].filter(({x, y}) => x % 2 === 0 && y % 2 === 0));

    while (true) {
      const wallNodes = [...this.wallNodes].filter(c => !c.isWall);
      if (wallNodes.length === 0) break;
      const nodes = [rd.choice(wallNodes)];
      nodes[0].isWall = true;
      while (true) {
        const lastNode = nodes.at(-1)!;
        const siblings = lastNode.siblingWallNodes.filter(s => !s.isWall);
        if (siblings.length === 0) break;
        const selected = rd.choice(siblings);
        nodes.push(selected);
        this.connectNodes(lastNode, selected);
        if (rd.random() < 1/16) break;
      }
    }
  }

  connectNodes(node1: MazeCell, node2: MazeCell) {
    const {x: x1, y: y1} = node1;
    const {x: x2, y: y2} = node2;
    node1.isWall = true;
    node2.isWall = true;
    if (x1 === x2) this.columns[x1][(y1 + y2) / 2].isWall = true;
    if (y1 === y2) this.columns[(x1 + x2) / 2][y1].isWall = true;
  }
}

class MazeCell {
  readonly maze: Maze;
  readonly x: number;
  readonly y: number;
  ref: RefObject<HTMLDivElement>;

  isWall = false;

  constructor(maze: Maze, x: number, y: number) {
    this.maze = maze;
    this.x = x;
    this.y = y;
    this.ref = createRef<HTMLDivElement>();
  }

  get isWallNode() {
    return this.x % 2 === 0 && this.y % 2 === 0;
  }

  get siblingWallNodes() {
    if (!this.isWallNode) return [];
    const nodes: MazeCell[] = [];
    const {x, y, maze} = this;
    if (x + 2 < maze.size) nodes.push(maze.columns[x + 2][y]);
    if (y + 2 < maze.size) nodes.push(maze.columns[x][y + 2]);
    if (x - 2 >= 0) nodes.push(maze.columns[x - 2][y]);
    if (y - 2 >= 0) nodes.push(maze.columns[x][y - 2]);
    return nodes;
  }
}

import { IoKeypadOutline, IoRefreshOutline } from "react-icons/io5";

export default function MazeLab() {
  const [seed, _seed] = useState(0);
  const rd = useRef(new Random(0));
  const [maze, _maze] = useState(new Maze(0));

  const inputSeed = () => {
    const seed = (prompt('Seed:')||'').trim();
    if (!seed) return;
    setSeed(Number(seed));
  }

  const setSeed = (seed: number = random.randInt(0, 2147483647)) => {
    _seed(seed);
    rd.current = new Random(seed);
    _maze(new Maze(seed));
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
        {maze.columns.map((c, x) => (<div className="maze-col" key={x}>
          {c.map((cell, y) => (
            <div
              key={y}
              className={[
                "maze-cell outline-1 outline outline-default-300",
                cell.isWall ? "wall" : '',
              ].join(' ')}
              id={`maze-${x}-${y}`}
              ref={cell.ref}
              onClick={() => console.log(cell)}
            />
          ))}
        </div>))}
      </div>
    </div>
  </div> : null)
}
