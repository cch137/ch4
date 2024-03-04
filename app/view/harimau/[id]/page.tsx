"use client"

import { appTitle } from "@/constants/app";
import { Image } from "@nextui-org/image";
import { useParams } from "next/navigation";

export default function HarimauView() {
  const params = useParams();
  const url = atob((Array.isArray(params.id) ? params.id[0] : params.id).replace(/-/g, '+').replace(/_/g, '/'));
  const title = appTitle(url.split('?')[0].split('/').at(-1) || url);

  return (<div className="w-full flex-center">
    <title>{title}</title>
    <div className="max-w-full">
      <Image
        alt={url}
        src={url}
        className="rounded-none w-full select-none pointer-events-none"
        draggable="false"
      />
    </div>
  </div>)
}
