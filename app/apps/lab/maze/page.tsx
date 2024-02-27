"use client"

import "./maze.css";

import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import random, { Random } from "@cch137/utils/random";
import { RefObject, createRef, useCallback, useRef, useState } from "react";
import useInit from "@/hooks/useInit";
import { IoAddOutline, IoKeypadOutline, IoRefreshOutline, IoRemoveOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

class Maze {
  readonly seed: number;
  readonly size: number;
  readonly map: readonly (readonly MazeTile[])[];

  constructor(seed: number = 0, size: number) {
    this.seed = seed;
    this.size = size;
    const rd = new Random(seed);

    while (true) {
      const map = Object.freeze(Array.from(
        {length: size},
        (_, x) => Object.freeze(Array.from(
          {length: size},
          (_, y) => new MazeTile(this, x, y)
        ))
      ));
      this.map = map;
      const tiles = Object.freeze(map.flat());
      const wallNodes = Object.freeze(tiles.filter(t => t.isWallNode));
      const walls = new Set<MazeTileGroup>();

      const connectNodes = (
        node1: MazeTile,
        node2: MazeTile,
        isWall = true,
        fill = true
      ) => {
        const {x: x1, y: y1} = node1;
        const {x: x2, y: y2} = node2;
        if (fill) {
          node1.isWall = isWall;
          node2.isWall = isWall;
        }
        if (x1 === x2) map[x1][(y1 + y2) / 2].isWall = isWall;
        if (y1 === y2) map[(x1 + x2) / 2][y1].isWall = isWall;
      }

      // Generating the main structure
      while (true) {
        const emptyWallNodes = wallNodes.filter(c => !c.isWall);
        if (emptyWallNodes.length === 0) break;
        let lastAddedTile = rd.choice(emptyWallNodes)
        const wall = new MazeTileGroup([lastAddedTile]);
        lastAddedTile.isWall = true;
        while (true) {
          const siblings = lastAddedTile.siblingWallNodes.filter(s => !s.isWall);
          if (siblings.length === 0) break;
          const selected = rd.choice(siblings);
          connectNodes(selected, lastAddedTile);
          wall.add(selected);
          lastAddedTile = selected;
          if (wall.size >= size) break;
        }
        walls.add(wall);
      }

      // Merge short walls
      while (true) {
        const shortWalls: MazeTileGroup[] = [...walls].filter(w => w.size < size / 4);
        if (!shortWalls.length) break;
        for (const wall of shortWalls) {
          if (!walls.has(wall)) continue;
          const neighbourWallTilePairs = wall.map(tile => tile.siblingWallNodes
            .filter(t => !wall.has(t)).map(t => [tile, t] as [MazeTile, MazeTile])).flat();
          if (neighbourWallTilePairs.length === 0) continue;
          const [t1, t2] = rd.choice(neighbourWallTilePairs);
          const toMergeGroup = [...walls].find(g => g.has(t2));
          if (!toMergeGroup) continue;
          connectNodes(t1, t2);
          toMergeGroup.merge(wall);
          walls.delete(wall);
        }
      }

      // Build outer wall
      for (let n = 0; n < size; n++) {
        map[0][n].isWall = true;
        map[n][0].isWall = true;
        map[size - 1][n].isWall = true;
        map[n][size - 1].isWall = true;
      }

      // Open enclosed spaces
      const paths = tiles.filter(t => !t.isWall).reduce((paths: MazeTileGroup[], t) => {
        if (!paths.find(p => p.has(t))) paths.push(groupMazeTile(t));
        return paths;
      }, []);
      while (paths.length > 1) {
        paths.forEach((path, i) => {
          if (!paths.includes(path)) return;
          const neighbourPathTilePairs = path.map(tile => tile.siblingPathNodes
            .filter(t => !path.has(t)).map(t => [tile, t] as [MazeTile, MazeTile])).flat();
          if (neighbourPathTilePairs.length === 0) return;
          const [t1, t2] = rd.choice(neighbourPathTilePairs);
          const toMergeGroup = [...paths].find(g => g.has(t2));
          if (!toMergeGroup) return;
          connectNodes(t1, t2, false);
          toMergeGroup.merge(path);
          paths.splice(i, 1);
        });
      }

      // Set start and end
      map[0][1].isWall = false;
      if (size % 2 === 0) {
        map[size - 1][size - 3].isWall = false;
        map[size - 2][size - 3].isWall = false;
      } else {
        map[size - 1][size - 2].isWall = false;
      }

      break;
    }
  }
}

class MazeTileGroup extends Set<MazeTile> {
  merge(group: MazeTileGroup) {
    for (const tile of group) this.add(tile);
  }

  map<T>(callbackfn: (value: MazeTile, index: number, array: MazeTile[]) => T) {
    return [...this].map(callbackfn);
  }
}

class MazeTile {
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

  get isPathNode() {
    return this.x % 2 !== 0 && this.y % 2 !== 0;
  }

  get siblingNodes() {
    const nodes: MazeTile[] = [];
    const {x, y, maze: {map, size}} = this;
    if (x + 2 < size) nodes.push(map[x + 2][y]);
    if (y + 2 < size) nodes.push(map[x][y + 2]);
    if (x - 2 >= 0) nodes.push(map[x - 2][y]);
    if (y - 2 >= 0) nodes.push(map[x][y - 2]);
    return nodes;
  }

  get siblingWallNodes() {
    return this.isWallNode
      ? this.siblingNodes
      : [];
  }

  get siblingPathNodes() {
    return this.isPathNode
      ? this.siblingNodes
      : [];
  }
}

const groupMazeTile = (tile: MazeTile) => {
  const group = new MazeTileGroup();
  const findGroupMember = (tile: MazeTile) => {
    group.add(tile);
    const neighbour: MazeTile[] = [];
    const { x, y, maze: {map, size}, isWall } = tile;
    if (x - 1 >= 0) neighbour.push(map[x - 1][y]);
    if (y - 1 >= 0) neighbour.push(map[x][y - 1]);
    if (x + 1 < size) neighbour.push(map[x + 1][y]);
    if (y + 1 < size) neighbour.push(map[x][y + 1]);
    neighbour.filter(t => t.isWall === isWall && !group.has(t))
      .forEach(n => findGroupMember(n));
  }
  findGroupMember(tile);
  return group;
}

export default function MazeLab() {
  const router = useRouter();
  const [isLoading, _isLoading] = useState(true);
  const [seed, _seed] = useState(0);
  const [size, _size] = useState(0);
  const [maze, _maze] = useState<Maze>();

  const generateMaze = useCallback(async (_seed: number = seed, _size: number = size) => {
    _isLoading(true);
    setTimeout(() => {
      _maze(new Maze(_seed, _size));
      _isLoading(false);
    }, 0);
  }, [seed, size, _isLoading, _maze]);

  const inputSeed = () => {
    const value = (prompt('Seed:')||'').trim();
    if (!value) return;
    setSeed(Number(value), void 0, true);
  }

  const inputSize = () => {
    const value = (prompt('Size:')||'').trim();
    if (!value) return;
    setSize(Number(value));
  }

  const setSeed = useCallback((seed: number = random.randInt(0, 2147483647), generate = true, save = false) => {
    _seed(seed);
    if (generate) generateMaze(seed, size);
    const params = new URLSearchParams(location.href.split('?').at(2) || '');
    if (save) params.set('seed', String(seed));
    else params.delete('seed');
    router.replace(`${location.pathname}?${params.toString()}`);
    return seed;
  }, [_seed, generateMaze]);

  const setSize = useCallback((size: number = 99, generate = true) => {
    _size(size = Math.max(5, size));
    if (generate) generateMaze(seed, size);
    const params = new URLSearchParams(location.href.split('?').at(2) || '');
    params.set('size', String(size));
    router.replace(`${location.pathname}?${params.toString()}`);
    return size;
  }, [_size, generateMaze]);

  const getCell = (x: number, y: number) => {
    return document.getElementById(`maze-${x}-${y}`);
  }

  const inited = useInit(() => {
    const params = new URLSearchParams(location.href.split('?').at(-1)).entries();
    let _size = setSize(void 0, false), _seed = setSeed(void 0, false);
    for (const [key, value] of params) {
      if (key === 'size') _size = setSize(Number(value) || size, false);
      else if (key === 'seed') _seed = setSeed(Number(value) || seed, false);
    }
    generateMaze(_seed, _size);
  });

  return (inited.current ? <div className="flex justify-start items-start">
    <div className="flex-center flex-col p-8 gap-4 m-auto">
      <div className="flex-center flex-col w-full gap-2">
        <div className="flex-center max-w-sm w-full gap-2 text-lg text-default-600">
          <span>seed:</span>
          <span>{seed}</span>
          <span className="flex-1" />
          <Button isIconOnly size="sm" className="h-8" variant="bordered" onClick={inputSeed} isDisabled={isLoading}>
            <IoKeypadOutline className="text-lg" />
          </Button>
          <Button isIconOnly size="sm" className="h-8" variant="bordered" onClick={() => setSeed()} isDisabled={isLoading}>
            <IoRefreshOutline className="text-lg" />
          </Button>
        </div>
        <div className="flex-center max-w-sm w-full gap-2 text-lg text-default-600">
          <span>size:</span>
          <span>{size}</span>
          <span className="flex-1" />
          <Button isIconOnly size="sm" className="h-8" variant="bordered" onClick={inputSize} isDisabled={isLoading}>
            <IoKeypadOutline className="text-lg" />
          </Button>
          <Button isIconOnly size="sm" className="h-8" variant="bordered" onClick={() => setSize(size - 1)} isDisabled={isLoading}>
            <IoRemoveOutline className="text-lg" />
          </Button>
          <Button isIconOnly size="sm" className="h-8" variant="bordered" onClick={() => setSize(size + 1)} isDisabled={isLoading}>
            <IoAddOutline className="text-lg" />
          </Button>
        </div>
      </div>
      <div className={`flex text-gray-400 transition ${isLoading ? 'opacity-75' : ''}`}>
        {!maze ? null : maze.map.map((c, x) => (<div className="maze-col" key={x}>
          {c.map((cell, y) => (
            <div
              key={y}
              className={[
                "maze-cell",
                cell.isWall ? "wall" : '',
              ].join(' ')}
              id={`maze-${x}-${y}`}
              ref={cell.ref}
            />
          ))}
        </div>))}
      </div>
    </div>
  </div> : <div className="flex-center py-48">
    <Spinner size="lg" color="white" style={{scale: 1.5}} />
  </div>)
}
