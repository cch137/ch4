"use client"

import { Button } from "@nextui-org/button";
import Link from "next/link";

export default function NCU() {
  return (<div className="flex-center flex-col p-16 gap-4 max-w-xs m-auto">
    <Button
      as={Link}
      size="lg"
      color="secondary"
      variant="ghost"
      className="w-full"
      href="/apps/lab"
    >
      Lab
    </Button>
    <Button
      as={Link}
      size="lg"
      color="secondary"
      variant="ghost"
      className="w-full"
      href="/apps/ncu/weather"
    >
      Weather
    </Button>
    <Button
      as={Link}
      size="lg"
      color="secondary"
      variant="ghost"
      className="w-full"
      href="/apps/ncu/text-ans"
    >
      TextAns
    </Button>
    <Button
      as={Link}
      size="lg"
      color="secondary"
      variant="ghost"
      className="w-full"
      href="/apps/ncu/oracle"
    >
      甲骨文
    </Button>
    <Button
      as={Link}
      size="lg"
      color="secondary"
      variant="ghost"
      className="w-full"
      href="/apps/ncu/images-to-pdf"
    >
      Images to PDF
    </Button>
    <Button
      as={Link}
      size="lg"
      color="secondary"
      variant="ghost"
      className="w-full"
      href="/apps/ncu/laundry"
    >
      Laundry
    </Button>
  </div>)
}
