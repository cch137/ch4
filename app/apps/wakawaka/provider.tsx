"use client";

import { createContext, useContext, useEffect } from "react";
import { useParams } from "next/navigation";

import {
  API_LISTS_PATH,
  API_OP_CARDS_PATH,
  API_OP_GROUPS_PATH,
  WAKAWAKA_SESSPATH,
} from "./constants";
import useFetch from "@/hooks/useFetch";
import { SetState } from "@/constants/types";

type WKHeaders = Record<string, string>;

export type BlockType = "text" | "md" | "image";

export type WKGroup = {
  _id: string;
  name: string;
  expire: string;
  enabled: boolean;
};

export type WKCard = {
  _id: string;
  name: string;
  expire: string;
  enabled: boolean;
};

export type WKBlock = {
  _id: string;
  type: BlockType;
  content: string;
};

const wkContext = createContext({
  groups: [] as WKGroup[],
  updateGroups: () => {},
  isLoadingGroups: true,
  sid: "",
  updateSid: () => {},
  headers: {} as WKHeaders,
});

export function WKProvider({ children }: { children: React.ReactNode }) {
  const {
    data: sid,
    refresh: updateSid,
    error: sidError,
  } = useFetch(
    WAKAWAKA_SESSPATH,
    { method: "POST" },
    { type: "text", fetched: false }
  );
  const headers = { Authorization: sid };

  const {
    data: groups = [],
    refresh: updateGroups = () => {},
    isPending: isLoadingGroups,
    error,
  } = useFetch(
    API_LISTS_PATH,
    { method: "GET", headers },
    { type: "json", fetched: true, data: [] as WKGroup[] }
  );

  useEffect(() => {
    if (sid) updateGroups();
  }, [sid, updateGroups]);

  useEffect(() => {
    if (sidError) location.reload();
  }, [sidError]);

  useEffect(() => {
    if (error && !(error instanceof DOMException)) updateSid();
  }, [error, updateSid]);

  useEffect(() => {
    const itv = setInterval(updateSid, 30 * 60000);
    return () => clearInterval(itv);
  }, [updateSid]);

  return (
    <wkContext.Provider
      value={{
        groups,
        updateGroups,
        isLoadingGroups,
        sid,
        updateSid,
        headers,
      }}
    >
      {children}
    </wkContext.Provider>
  );
}

export function useWK() {
  return useContext(wkContext);
}

const wkPageContext = createContext({
  id: "",
  name: "",
  apiPath: "",
  headers: {} as WKHeaders,
  cards: [] as WKCard[],
  updateCards: () => {},
  setCards: (() => {}) as SetState<WKCard[] | undefined>,
  isLoadingCards: true,
});

export function WKPageProvider({ children }: { children: React.ReactNode }) {
  const { groups, sid, headers, updateSid } = useWK();
  const params = useParams();
  const id: string = Array.isArray(params.groupId)
    ? params.groupId[0]
    : params.groupId;
  const name = groups.find((i) => i._id === id)?.name || "Unknown";
  const apiPath = API_OP_GROUPS_PATH(id);

  const {
    data: cards = [],
    refresh: updateCards = () => {},
    setData: setCards,
    isPending: isLoadingCards,
    error,
  } = useFetch(
    apiPath,
    { method: "GET", headers },
    { type: "json", fetched: true, data: [] as WKCard[] }
  );

  useEffect(() => {
    if (sid) updateCards();
  }, [sid, updateCards]);

  useEffect(() => {
    if (error && !(error instanceof DOMException)) updateSid();
  }, [error, updateSid]);

  return (
    <wkPageContext.Provider
      value={{
        id,
        name,
        apiPath,
        headers,
        cards,
        updateCards,
        setCards,
        isLoadingCards,
      }}
    >
      {children}
    </wkPageContext.Provider>
  );
}

export function useWKPage() {
  return useContext(wkPageContext);
}

const wkCardContext = createContext({
  id: "",
  name: "",
  apiPath: "",
  blocks: [] as WKBlock[],
  updateBlocks: () => {},
  isLoadingBlocks: true,
});

export function WKCardProvider({ children }: { children: React.ReactNode }) {
  const { sid, headers, updateSid } = useWK();
  const { id: groupId, cards } = useWKPage();
  const params = useParams();
  const id: string = Array.isArray(params.cardId)
    ? params.cardId[0]
    : params.cardId;
  const name = cards.find((i) => i._id === id)?.name || "Unknown";
  const apiPath = API_OP_CARDS_PATH(groupId, id);

  const {
    data: blocks = [],
    refresh: updateBlocks = () => {},
    isPending: isLoadingBlocks,
    error,
  } = useFetch(
    apiPath,
    { method: "GET", headers },
    { type: "json", fetched: true, data: [] as WKBlock[] }
  );

  useEffect(() => {
    if (sid) updateBlocks();
  }, [sid, updateBlocks]);

  useEffect(() => {
    if (error && !(error instanceof DOMException)) updateSid();
  }, [error, updateSid]);

  return (
    <wkCardContext.Provider
      value={{
        id,
        name,
        apiPath,
        blocks,
        updateBlocks,
        isLoadingBlocks,
      }}
    >
      {children}
    </wkCardContext.Provider>
  );
}

export function useWKCard() {
  return useContext(wkCardContext);
}
