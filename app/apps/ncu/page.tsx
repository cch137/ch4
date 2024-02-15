"use client"

import { Button } from "@nextui-org/button";
import Link from "next/link";

export default function NCU() {
  return (<div className="flex-center flex-col p-16 gap-4">
    <Button as={Link} color="secondary" variant="shadow" href="/apps/ncu/harimau">Harimau</Button>
    <Button as={Link} color="secondary" variant="shadow" href="/apps/ncu/laundry">Laundry</Button>
  </div>)
}
