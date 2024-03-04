"use client"

import { Button } from "@nextui-org/button";
import { Image } from "@nextui-org/image";
import { useParams, useRouter } from "next/navigation";
import { IoChevronBack } from "react-icons/io5";

export default function HarimauView() {
  const params = useParams();
  const router = useRouter();
  const url = atob((Array.isArray(params.id) ? params.id[0] : params.id).replace(/-/g, '+').replace(/_/g, '/'));

  return (<div className="max-w-screen-sm m-auto my-8">
    <div className="flex pb-4">
      <Button className="text-lg" variant="flat" isIconOnly onClick={() => router.back()}>
        <IoChevronBack />
      </Button>
    </div>
    <Image
      alt={url}
      src={url}
      className="rounded-none select-none pointer-events-none"
      draggable="false"
    />
  </div>)
}
