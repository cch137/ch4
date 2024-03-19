"use client"

import { useEffect, useState } from "react";
import "./game1.css";
import { Button } from "@nextui-org/button";
import random from "@cch137/utils/random";

class CellMap extends Array<Array<Cell>> {}

class Cell {
  x: number;
  y: number;
  map: CellMap;
  isHole: boolean = false;
  isTile = false;

  constructor(map: CellMap, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.map = map;
  }

  get frontReachable() {
    const { x, y } = this;
    const top = (this.map[x]||[])[y-1];
    const topRight = (this.map[x+1]||[])[y-1];
    const right = (this.map[x+1]||[])[y];
    const cells = [top, topRight, right];
    return cells.filter(i => i);
  }

  get frontReachableTiles() {
    return this.frontReachable.filter(i => i.isTile);
  }

  get backReachable() {
    const { x, y } = this;
    const bottom = (this.map[x]||[])[y+1];
    const bottomLeft = (this.map[x-1]||[])[y+1];
    const left = (this.map[x-1]||[])[y];
    const cells = [bottom, bottomLeft, left];
    return cells.filter(i => i);
  }

  get backReachableRandomEat() {
    const cells: any[] = this.backReachable;
    if (random.random() < 0.5) {
      const r = random.random();
      if (r < 0.1) cells[0] = undefined;
      else if (r < 0.3) cells[1] = undefined;
      else cells[2] = undefined;
    } 
    return cells.filter(i => i) as Cell[];
  }

  get backReachableTiles() {
    return this.backReachable.filter(i => i.isTile);
  }
}

const createCellMap = (cols: number, rows: number) => {
  const map = new CellMap();
  for (let x = 0; x < cols; x++) {
    const col: Cell[] = [];
    for (let y = 0; y < rows; y++) col.push(new Cell(map, x, y));
    map.push(col);
  }
  const endPoint = map[cols - 1][0];
  const startPoint = map[0][rows - 1];
  const materials = new Set([endPoint]);

  while (materials.size) {
    [...materials].map(c => {
      const { backReachableRandomEat } = c;
      c.isTile = true;
      materials.delete(c);
      for (const reach of backReachableRandomEat) {
        materials.add(reach);
      }
    });
  }

  for (let y = 0; y < rows - 1; y++) map[0][y].isTile = false;

  return map;
}

function CellEl({cell}: {cell: Cell}) {
  const { x, y, isTile } = cell;
  return <div
    title={`${x}, ${y}`}
    className={[
      "cell",
      isTile ? 'outline outline-1 outline-default-300 bg-default-50' : '',
    ].join(' ')}
  />
}

const COLS = 16;
const ROWS = 8;

export default function MazeLab() {
  const [map, setMap] = useState<CellMap>();

  useEffect(() => {
    setMap(createCellMap(COLS, ROWS));
  }, []);

  return <>
    <div>
      <Button onClick={() => setMap(createCellMap(COLS, ROWS))}>Generate</Button>
    </div>
    <div className="flex p-8">
      {map ? map.map((col, x) => {
        return <div key={x}>
          {col.map((cell, y) => <CellEl key={y} cell={cell} />)}
        </div>
      }) : null}
    </div>
  </>
}
