"use client"

import "./maze.css";

import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import random, { Random } from "@cch137/utils/random";
import { useCallback, useEffect, useState } from "react";
import useInit from "@/hooks/useInit";
import { IoAddOutline, IoKeypadOutline, IoPlay, IoRefreshOutline, IoRemoveOutline, IoTrashBinOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { Switch } from "@nextui-org/react";

class Maze {
  readonly seed: number;
  readonly size: number;
  readonly map: readonly (readonly MazeTile[])[];
  readonly startTile: MazeTile;
  readonly endTile: MazeTile; 

  constructor(seed: number = 0, size: number) {
    this.seed = seed;
    this.size = size;
    const rd = new Random(seed);

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
    const wallMap = new Map<MazeTile, MazeTileGroup>();

    const connectNodes = (
      node1: MazeTile,
      node2: MazeTile,
      isWall: boolean,
      group?: MazeTileGroup,
    ) => {
      const {x: x1, y: y1} = node1;
      const {x: x2, y: y2} = node2;
      const middle = x1 === x2
        ? map[x1][(y1 + y2) / 2]
        : y1 === y2
          ? map[(x1 + x2) / 2][y1]
          : null;
      if (!middle) return;
      node1.isWall = isWall;
      node2.isWall = isWall;
      middle.isWall = isWall;
      if (group) {
        group.add(node1);
        group.add(node2);
        group.add(middle);
        wallMap.set(node1, group);
        wallMap.set(node2, group);
        wallMap.set(middle, group);
      }
    }

    const groupMazeTile = (
      tile: MazeTile
    ) => {
      const visited = new Set<MazeTile>();
      const group = new MazeTileGroup([tile]);
      while (group.size !== visited.size) {
        const _group = [...group];
        for (const tile of _group) {
          if (visited.has(tile)) continue;
          const { isWall } = tile;
          tile.neighbours.filter(t => t.isWall === isWall)
            .forEach(t => group.add(t));
          visited.add(tile);
        }
      }
      return group;
    }

    // Generate the main structure
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
        connectNodes(selected, lastAddedTile, true, wall);
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
        const pairs: [MazeTile, MazeTile][] = [];
        wall.forEach(tile => {
          tile.siblingWallNodes.forEach(t => {
            if (wallMap.get(t) !== wall) pairs.push([tile, t]);
          });
        });
        if (pairs.length === 0) continue;
        const [t1, t2] = rd.choice(pairs);
        connectNodes(t1, t2, true, wall);
        (wallMap.get(t2) as MazeTileGroup).merge(wall);
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
    }, []).sort((a, b) => b.size - a.size);
    while (paths.length > 1) {
      paths.forEach((path, i) => {
        const pairs: [MazeTile, MazeTile][] = [];
        path.forEach(tile => {
          tile.siblingPathNodes.forEach(t => {
            if (!path.has(t)) pairs.push([tile, t]);
          });
        });
        if (pairs.length === 0) return;
        const [t1, t2] = rd.choice(pairs);
        for (const g of paths) {
          if (!g.has(t2)) continue;
          connectNodes(t1, t2, false);
          g.merge(path);
          paths.splice(i, 1);
          break;
        }
      });
    }

    // Set start and end
    this.startTile = map[0][1];
    this.startTile.isWall = false;
    if (size % 2 === 0) {
      map[size - 2][size - 3].isWall = false;
      this.endTile = map[size - 1][size - 3];
    } else {
      this.endTile = map[size - 1][size - 2];
    }
    this.endTile.isWall = false;
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

  isWall: boolean = false;

  constructor(maze: Maze, x: number, y: number) {
    this.maze = maze;
    this.x = x;
    this.y = y;
  }

  get isWallNode() {
    return this.x % 2 === 0 && this.y % 2 === 0;
  }

  get isPathNode() {
    return this.x % 2 !== 0 && this.y % 2 !== 0;
  }

  get neighbours() {
    const neighbours: MazeTile[] = [];
    const { x, y, maze: {map, size} } = this;
    if (x - 1 >= 0) neighbours.push(map[x - 1][y]);
    if (y - 1 >= 0) neighbours.push(map[x][y - 1]);
    if (x + 1 < size) neighbours.push(map[x + 1][y]);
    if (y + 1 < size) neighbours.push(map[x][y + 1]);
    return neighbours;
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

class MazeWalker {
  maze: Maze;
  branches: MazeBranch[] = [];
  locked = false;

  constructor(maze: Maze) {
    this.maze = maze;
    this.branches = [new MazeBranch(this, [maze.startTile])];
  }

  getTileStatus() {
    const status = new Map<MazeTile,number>();
    const targetLength = Math.max(...this.branches.map(b => b.walked.length));
    this.branches.forEach(b => {
      b.getTileStatus(targetLength).forEach((v, t) => {
        const s = status.get(t);
        if (s === undefined || v > s) status.set(t, v);
      });
    });
    const isSuccess = this.branches.find(b => b.success);
    if (isSuccess) status.forEach((s, t) => s <= 1 ? status.set(t, -1) : null);
    if (Math.max(...status.values()) > 1) this.locked = true;
    return status;
  }

  forward() {
    if (this.locked) return;
    this.branches = this.branches.map(b => b.forward()).flat()
      .reduce((p: MazeBranch[], branche) => {
        if (!p.find(b => b.isEqual(branche))) p.push(branche);
        return p;
      }, []);
  }
}

class MazeBranch {
  readonly walker: MazeWalker; 
  readonly walked: MazeTile[] = [];
  dead = false;
  success = false;
  
  constructor(walker: MazeWalker, tiles: MazeTile[] = []) {
    this.walker = walker;
    this.walked = tiles;
  }

  copy(...tiles: MazeTile[]) {
    return new MazeBranch(this.walker, [...this.walked, ...tiles]);
  }

  isEqual(other: MazeBranch): boolean {
    const { walked } = this;
    return other.walked.every((t, i) => walked[i] === t);
  }

  forward() {
    if (this.dead) return [this];
    const { walked } = this;
    const nexts = walked.at(-1)!.neighbours.filter(t => !t.isWall && !walked.includes(t));
    const { length } = nexts;
    if (length === 0) return [this];
    if (length > 1) return nexts.map(n => this.copy(n));
    this.walked.push(nexts[0]);
    return [this];
  }

  getTileStatus(targetLength: number) {
    const { walked } = this;
    const status = new Map<MazeTile,number>();
    if (this.dead) {
      walked.forEach(t => status.set(t, -1));
      return status;
    }
    const headTile = walked.at(-1)!;
    const isSuccessEnd = headTile === this.walker.maze.endTile;
    if (isSuccessEnd) {
      this.success = true;
      walked.forEach(t => status.set(t, 2));
      return status;
    }
    const isDeadEnd = walked.length !== targetLength
      || this.walker.branches.find(b => b !== this && (b.walked.includes(headTile) && headTile !== b.walked.at(-1)));
    if (isDeadEnd) {
      this.dead = true;
      walked.forEach(t => status.set(t, -1));
      return status;
    }
    let i = walked.length - 1;
    status.set(walked[i], 1);
    let s = 80;
    for (; s > 50; s -= 3) {
      const tile = walked[--i];
      if (!tile) return status;
      status.set(tile, s / 100);
    }
    while (true) {
      const tile = walked[--i];
      if (!tile) return status;
      status.set(tile, s / 100);
    }
  }
}

function Tile({tile, showMark, status, clearMarkSymbol}: {tile: MazeTile, showMark: boolean, status?: number, clearMarkSymbol: symbol}) {
  const [marked, setMarked] = useState(false);
  const { isWall } = tile;

  useEffect(() => {
    if (tile || clearMarkSymbol) setMarked(false);
  }, [tile, clearMarkSymbol]);

  return <div
    className={[
      "relative maze-tile",
      isWall ? "wall" : "path cursor-pointer",
    ].join(' ').replace(/\s+/g, ' ')}
    onMouseOver={isWall ? void 0 : (e) => {
      if (e.buttons === 1) setMarked(true);
      else if (e.buttons === 2) setMarked(false);
    }}
    onClick={isWall ? void 0 : (e) => {e.preventDefault(); setMarked(true)}}
    onContextMenu={isWall ? void 0 : (e) => {e.preventDefault(); setMarked(false)}}
    draggable={false}
  >
    {status === undefined ? null :
      <div
        className={[
          "absolute w-full h-full top-0 pointer-events-none",
          status === -1 ? "bg-danger-100" : status === 2 ? "bg-success-600" : "bg-warning-600",
          `stat-${status}`,
        ].join(' ')}
        style={{opacity: Math.max(0.5, status)}}
      />}
    {!(marked && showMark) ? null :
      <div className="absolute w-full h-full top-0 bg-secondary-600 pointer-events-none opacity-50" />}
  </div>
}

export default function MazeLab() {
  const router = useRouter();
  const [isLoading, _isLoading] = useState(true);
  const [seed, _seed] = useState(0);
  const [size, _size] = useState(0);
  const [maze, _maze] = useState<Maze>();
  const [mazeWalker, _mazeWalker] = useState<MazeWalker>();
  const [status, _status] = useState<Map<MazeTile,number>>(new Map());

  const [clearMarkSymbol, _clearMarkSymbol] = useState(Symbol());
  const [showMark, setShowMark] = useState(true);
  const clearMark = () => _clearMarkSymbol(Symbol());

  const createMazeWalker = useCallback((maze: Maze) => {
    const walker = new MazeWalker(maze);
    walker.locked = true;
    _mazeWalker(walker);
    _status(walker.getTileStatus());
    return walker;
  }, [_mazeWalker, _status]);

  const generateMaze = useCallback((_seed: number = seed, _size: number = size) => {
    return new Promise<Maze>((resolve, reject) => {
      try {
        _isLoading(true);
        clearMark();
        setTimeout(() => {
          console.time('maze');
          const maze = new Maze(_seed, _size);
          _maze(maze);
          createMazeWalker(maze);
          console.timeEnd('maze');
          _isLoading(false);
          resolve(maze);
        }, 0);
      } catch (e) {
        reject(e);
      }
    });
  }, [seed, size, _isLoading, _maze, createMazeWalker]);

  const walkerGoForward = useCallback(() => {
    if (mazeWalker) {
      mazeWalker.forward();
      const status = mazeWalker.getTileStatus();
      _status(status);
    }
  }, [mazeWalker, _status]);

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
    return seed;
  }, [_seed, generateMaze, size]);

  const setSize = useCallback((size: number = 63, generate = true) => {
    _size(size = Math.max(5, size));
    if (generate) generateMaze(seed, size);
    return size;
  }, [_size, generateMaze, seed]);

  const inited = useInit(() => {
    const params = new URLSearchParams(location.href.split('?').at(-1)).entries();
    let _seed = setSeed(void 0, false);
    let _size = setSize(void 0, false);
    for (const [key, value] of params) {
      if (key === 'size') _size = setSize(Number(value) || size, false);
      else if (key === 'seed') _seed = setSeed(Number(value) || seed, false);
    }
    router.replace(location.pathname);
    generateMaze(_seed, _size);
  });

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const runWalker = () => {
      timeout = setTimeout(runWalker, 10);
      walkerGoForward();
    }
    runWalker();
    return () => clearTimeout(timeout);
  }, [walkerGoForward]);

  return (inited.current ? <div className="flex justify-start items-start">
    <div className="flex-center flex-col p-8 gap-4 m-auto">
      <div className="flex-center flex-col w-full gap-2 text-default-600">
        <div className="flex-center max-w-sm w-full gap-2 text-lg">
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
        <div className="flex-center max-w-sm w-full gap-2 text-lg">
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
        <div className="flex-center max-w-sm w-full gap-2 text-lg">
          <span>walker:</span>
          <span className="flex-1" />
          <Button isIconOnly size="sm" className="h-8" variant="bordered" onClick={() => {if (maze) {const w = createMazeWalker(maze); w.locked = false}}}>
            <IoPlay className="text-lg" />
          </Button>
        </div>
      </div>
      <div className={`flex text-stone-600 transition ${isLoading ? 'opacity-75' : ''}`} onContextMenu={(e) => e.preventDefault()} draggable={false}>
        {!maze ? null : maze.map.map((c, x) => (
          <div className="maze-col" key={x} onContextMenu={(e) => e.preventDefault()} draggable={false}>
            {c.map((tile, y) => <Tile tile={tile} showMark={showMark} clearMarkSymbol={clearMarkSymbol} key={y} status={status ? status.get(tile) : void 0} />)}
          </div>
        ))}
      </div>
      <div className="flex-center flex-col w-full gap-2 text-default-600">
        <div className="flex-center max-w-sm w-full gap-2 text-lg">
          <span>show mark:</span>
          <span className="flex-1" />
          <Switch size="sm" isSelected={showMark} onValueChange={setShowMark} />
          <Button isIconOnly size="sm" className="h-8" variant="bordered" onClick={clearMark}>
            <IoTrashBinOutline className="text-lg" />
          </Button>
        </div>
      </div>
    </div>
  </div> : <div className="flex-center py-48">
    <Spinner size="lg" color="white" style={{scale: 1.5}} />
  </div>)
}
