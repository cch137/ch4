"use client"

import { appTitle } from "@/constants/app";
import useUserInfo from "@/hooks/useUserInfo";
import { unpackDataWithHash } from "@cch137/utils/shuttle";
import { Image } from "@nextui-org/image";
import { useParams } from "next/navigation";

const parseLink = (id: string) => {
  try {
    return unpackDataWithHash(id.replace(/-/g, '+').replace(/_/g, '/'), 'MD5', 112);
  } catch {
    return null;
  }
}

export default function HarimauView() {
  const params = useParams();
  const link = parseLink(Array.isArray(params.id) ? params.id[0] : params.id);
  const { auth } = useUserInfo();
  const isMember = auth > 3;
  if (typeof link !== 'string') return <></>;
  const title = link.split('?')[0];
  const url = `https://api.cch137.link/ls/i/${link}`;

  return (
    <div
      className="w-full flex-center"
      onContextMenu={isMember ? void 0 : (e) => e.preventDefault()}
      onDoubleClick={isMember ? void 0 : (e) => e.preventDefault()}
    >
      <title>{appTitle(title)}</title>
      <div className={`max-w-full ${isMember ? '' : 'pointer-events-none'}`}>
        <Image
          alt={url}
          src={url}
          className={`rounded-none w-full select-none ${isMember ? '' : 'pointer-events-none'}`}
          classNames={{wrapper: isMember ? '' : 'pointer-events-none'}}
          draggable="false"
          style={{width: 870}}
        />
      </div>
    </div>
  )
}
