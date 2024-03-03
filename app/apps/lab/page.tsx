"use client"

import { Button } from "@nextui-org/button";
import Link from "next/link";

export default function Lab() {
  return (<div className="flex-center flex-col p-16 gap-4 max-w-xs m-auto">
    <Button
      as={Link}
      size="lg"
      color="secondary"
      variant="ghost"
      className="w-full"
      href="/apps/lab/maze"
    >
      Maze
    </Button>
    <Button
      as={Link}
      size="lg"
      color="secondary"
      variant="ghost"
      className="w-full"
      href="/apps/ncu"
    >
      NCU
    </Button>
  </div>)
}
