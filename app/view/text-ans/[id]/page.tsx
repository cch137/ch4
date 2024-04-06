"use client"

import NotFound from "@/app/not-found";
import { appTitle } from "@/constants/app";
import useTTX from "@/hooks/useTTX";
import useUserInfo from "@/hooks/useUserInfo";
import { unpackDataWithHash } from "@cch137/utils/shuttle";
import { Image } from "@nextui-org/image";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const parseLink = (id: string) => {
  try {
    return unpackDataWithHash(id.replace(/-/g, '+').replace(/_/g, '/'), 'MD5', 112);
  } catch {
    return null;
  }
}

export default function TextAnsView() {
  const params = useParams();
  const link = parseLink(Array.isArray(params.id) ? params.id[0] : params.id);
  const isLink = typeof link === 'string'
  const { auth } = useUserInfo();
  const { ttxBlock, ttxShow, ttxRecord } = useTTX();
  const isMember = auth > 3;
  const title = isLink ? link.split('?')[0] : 'Unknown';
  const url = `https://api.cch137.link/ls/i/${link}`;

  useEffect(() => {
    const recordLink = () => isLink ? ttxRecord('text-ans-view', { link }) : null;
    window.addEventListener('TTX-view', recordLink);
    return () => window.removeEventListener('TTX-view', recordLink);
  }, [link, isLink, ttxRecord]);

  if (ttxBlock || !isLink) return <NotFound />;

  return (
    <div
      className="w-full flex-center"
      onContextMenu={isMember ? void 0 : (e) => e.preventDefault()}
      onDoubleClick={isMember ? void 0 : (e) => e.preventDefault()}
    >
      <title>{appTitle(title)}</title>
      <div className={`max-w-full ${isMember ? '' : 'pointer-events-none'}`}>
        {ttxShow ? <Image
          alt={url}
          src={url}
          className={`rounded-none w-full select-none ${isMember ? '' : 'pointer-events-none'}`}
          classNames={{ wrapper: isMember ? '' : 'pointer-events-none' }}
          draggable="false"
          style={{ width: 960 }}
        /> : null}
      </div>
    </div>
  )
}
