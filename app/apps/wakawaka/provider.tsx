"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { readStream } from "@cch137/utils/stream";

import {
  getApiPath,
  WAKAWAKA_CARD,
  WAKAWAKA_GROUP,
  WAKAWAKA_SESSPATH,
} from "./constants";
import useFetch from "@/hooks/useFetch";

type WKHeaders = Record<string, string>;
type WKApiMethod = "GET" | "POST" | "PUT" | "DELETE";
export type WKImage = { id: string; filename: string };
export type WKContentType = "text" | "md";
export type WKGroup = {
  _id: string;
  name: string;
  expire: string;
  enabled: boolean;
};
export type WKCardInfo = {
  _id: string;
  name: string;
  expire: string;
  enabled: boolean;
};
export type WKCardContent = {
  type: WKContentType;
  content: string;
  images: string[];
};
export type WKCardDetailed = WKCardInfo & WKCardContent;

type WKBaseContext = {
  // group list
  groups: WKGroup[];
  isLoadingGroupList: boolean;
  updateGroups: () => void;
  // SID
  sid: string;
  isLoadingSid: boolean;
  updateSid: () => void;
  headers: WKHeaders;
  // groups operations
  operatingGroupIds: string[];
  createGroup: (name: string) => Promise<Response>;
  editGroup: (_id: string, item: Partial<WKGroup>) => Promise<Response>;
  deleteGroup: (_id: string) => Promise<Response>;
  // api
  buildAPIReq: (
    method: WKApiMethod,
    item?: any,
    ...urlParts: string[]
  ) => Promise<Response>;
};

type WKGroupContext = WKBaseContext & {
  // group
  groupId: string;
  groupName: string;
  cards: WKCardInfo[];
  isLoadingGroup: boolean;
  updateGroup: () => void;
  // current group operations
  editCurrentGroup: (item: Partial<WKGroup>) => Promise<Response>;
  deleteCurrentGroup: () => Promise<Response>;
  // cards operations
  operatingCardIds: string[];
  createCard: (name: string) => Promise<any>;
  editCard: (
    _id: string,
    item: Partial<WKCardDetailed>,
    updateGroup?: boolean
  ) => Promise<Response>;
  deleteCard: (_id: string, updateGroup?: boolean) => Promise<Response>;
  activateCards: () => Promise<Response>;
  enableCards: () => Promise<Response>;
  disableCards: () => Promise<Response>;
};

type WKCardContext = WKGroupContext & {
  cardId: string;
  cardName: string;
  cardType: WKContentType;
  cardContent: string;
  cardImages: string[];
  cardNotFound: boolean;
  isLoadingCardContent: boolean;
  isLoadingCard: boolean;
  updateCard: () => void;
  // current card operations
  editCurrentCard: (item: Partial<WKCardDetailed>) => Promise<Response>;
  deleteCurrentCard: () => Promise<any>;
  isUploading: boolean;
  uploadImages: (files?: FileList | null) => Promise<Response | null>;
};

const wkBaseContext = createContext<WKBaseContext>(undefined!);
const wkGroupContext = createContext<WKGroupContext>(undefined!);
const wkCardContext = createContext<WKCardContext>(undefined!);

const EMPTY_CARD = {
  type: "text" as WKContentType,
  content: "",
  images: [] as string[],
};

export function WKBaseProvider({ children }: { children: React.ReactNode }) {
  // authentication
  const {
    data: sid,
    refresh: updateSid,
    isPending: isLoadingSid,
    error: sidError,
  } = useFetch(
    WAKAWAKA_SESSPATH,
    { method: "POST" },
    { type: "text", fetched: false }
  );
  const headers = useMemo(() => ({ Authorization: sid }), [sid]);

  // group list
  const {
    data: groups = [],
    refresh: updateGroups,
    isPending: isLoadingGroups,
    error,
  } = useFetch(
    getApiPath(),
    { method: "GET", headers },
    { type: "json", fetched: true, data: [] as WKGroup[] }
  );

  // operators
  const [isCreating, setIsCreating] = useState(false);
  const [operatingIds, setOperatingIds] = useState<symbol[]>([]);
  const buildAPIReq = useCallback(
    async (
      method: "GET" | "POST" | "PUT" | "DELETE",
      item?: any,
      ...urlParts: string[]
    ) => {
      return await fetch(getApiPath(...urlParts), {
        method,
        headers,
        body: JSON.stringify(item),
      });
    },
    [headers]
  );
  const createGroup = useCallback(
    async (name: string) => {
      setIsCreating(true);
      return await buildAPIReq("POST", { name })
        .finally(updateGroups)
        .finally(() => setIsCreating(false));
    },
    [buildAPIReq, updateGroups, setIsCreating]
  );
  const editGroup = useCallback(
    async (_id: string, item: Partial<WKGroup>) => {
      const sym = Symbol(_id);
      setOperatingIds((l) => [...l, sym]);
      return await buildAPIReq("PUT", item, _id)
        .finally(updateGroups)
        .finally(() => setOperatingIds((l) => l.filter((i) => i !== sym)));
    },
    [buildAPIReq, updateGroups, setOperatingIds]
  );
  const deleteGroup = useCallback(
    async (_id: string) => {
      const sym = Symbol(_id);
      setOperatingIds((l) => [...l, sym]);
      return await buildAPIReq("DELETE", void 0, _id)
        .finally(updateGroups)
        .finally(() => setOperatingIds((l) => l.filter((i) => i !== sym)));
    },
    [buildAPIReq, updateGroups, setOperatingIds]
  );

  // effects
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
  const [isFetched, setIsFetched] = useState(false);
  useEffect(() => {
    if (isLoadingGroups && !isFetched) setIsFetched(true);
  }, [isLoadingGroups, isFetched, setIsFetched]);

  const isLoadingGroupList =
    isLoadingSid || isLoadingGroups || isCreating || !isFetched;

  return (
    <wkBaseContext.Provider
      value={{
        groups,
        updateGroups,
        isLoadingGroupList,
        sid,
        updateSid,
        isLoadingSid,
        headers,
        operatingGroupIds: operatingIds.map((i) => i.description || ""),
        createGroup,
        editGroup,
        deleteGroup,
        buildAPIReq,
      }}
    >
      {children}
    </wkBaseContext.Provider>
  );
}

export function WKGroupProvider({ children }: { children: React.ReactNode }) {
  const wk = useWK();
  const params = useParams();
  const groupId: string = Array.isArray(params.groupId)
    ? params.groupId[0]
    : params.groupId;
  const groupName = wk.groups.find((i) => i._id === groupId)?.name || "Unknown";
  const {
    sid,
    updateSid,
    headers,
    buildAPIReq,
    operatingGroupIds,
    isLoadingGroupList,
    editGroup,
    deleteGroup,
  } = wk;

  // cards
  const {
    data: cards = [],
    refresh: updateGroup,
    isPending: isLoadingCards,
    error,
  } = useFetch(
    getApiPath(groupId),
    { method: "GET", headers },
    { type: "json", fetched: true, data: [] as WKCardDetailed[] }
  );

  // effects
  useEffect(() => {
    if (sid) updateGroup();
  }, [sid, updateGroup]);
  useEffect(() => {
    if (error && !(error instanceof DOMException)) updateSid();
  }, [error, updateSid]);
  const [isFetched, setIsFetched] = useState(false);
  useEffect(() => {
    if (isLoadingCards && !isFetched) setIsFetched(true);
  }, [isLoadingCards, isFetched, setIsFetched]);

  // operations
  const [isCreating, setIsCreating] = useState(false);
  const [operatingIds, setOperatingIds] = useState<symbol[]>([]);
  const router = useRouter();
  const createCard = useCallback(
    async (name: string) => {
      setIsCreating(true);
      return await buildAPIReq("POST", { name }, groupId)
        .then(async (res) =>
          router.push(WAKAWAKA_CARD(groupId, await res.json()))
        )
        .finally(updateGroup)
        .finally(() => setIsCreating(false));
    },
    [buildAPIReq, updateGroup, groupId, setIsCreating, router]
  );
  const editCard = useCallback(
    async (_id: string, item: Partial<WKCardDetailed>, updateList = true) => {
      const sym = Symbol(_id);
      setOperatingIds((l) => [...l, sym]);
      return await buildAPIReq("PUT", item, groupId, _id)
        .finally(() => (updateList ? updateGroup() : null))
        .finally(() => setOperatingIds((l) => l.filter((i) => i !== sym)));
    },
    [buildAPIReq, updateGroup, groupId, setOperatingIds]
  );
  const deleteCard = useCallback(
    async (_id: string, updateList = true) => {
      const sym = Symbol(_id);
      setOperatingIds((l) => [...l, sym]);
      return await buildAPIReq("DELETE", void 0, groupId, _id)
        .finally(() => (updateList ? updateGroup() : null))
        .finally(() => setOperatingIds((l) => l.filter((i) => i !== sym)));
    },
    [buildAPIReq, updateGroup, groupId, setOperatingIds]
  );
  const editCurrentGroup = useCallback(
    (item: Partial<WKGroup>) => editGroup(groupId, item),
    [editGroup, groupId]
  );
  const deleteCurrentGroup = useCallback(
    () => deleteGroup(groupId),
    [deleteGroup, groupId]
  );
  const batchCards = useCallback(
    async (method: WKApiMethod, name: string) => {
      const syms = cards.map((i) => Symbol(i._id));
      setOperatingIds((l) => [...l, ...syms]);
      return await buildAPIReq(method, void 0, groupId, name)
        .finally(updateGroup)
        .finally(() =>
          setOperatingIds((l) => l.filter((i) => !syms.includes(i)))
        );
    },
    [buildAPIReq, updateGroup, setOperatingIds, cards, groupId]
  );
  const activateCards = useCallback(
    () => batchCards("POST", "activate"),
    [batchCards]
  );
  const enableCards = useCallback(
    () => batchCards("POST", "enable"),
    [batchCards]
  );
  const disableCards = useCallback(
    () => batchCards("POST", "disable"),
    [batchCards]
  );

  const isLoadingGroup =
    isLoadingGroupList ||
    isLoadingCards ||
    isCreating ||
    operatingGroupIds.includes(groupId) ||
    !isFetched;

  return (
    <wkGroupContext.Provider
      value={{
        ...wk,
        groupId,
        groupName,
        cards,
        isLoadingGroup,
        operatingCardIds: operatingIds.map((i) => i.description || ""),
        updateGroup,
        createCard,
        editCard,
        deleteCard,
        editCurrentGroup,
        deleteCurrentGroup,
        activateCards,
        enableCards,
        disableCards,
      }}
    >
      {children}
    </wkGroupContext.Provider>
  );
}

export function WKCardProvider({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  const wk = useWKGroup();
  const {
    sid,
    updateSid,
    headers,
    groupId,
    cards,
    operatingCardIds,
    isLoadingGroup,
    buildAPIReq,
    editCard,
    deleteCard,
    updateGroup,
  } = wk;
  const params = useParams();
  const cardId: string =
    id || (Array.isArray(params.cardId) ? params.cardId[0] : params.cardId);
  const cardName = cards.find((i) => i._id === cardId)?.name || "Unknown";
  const router = useRouter();

  const {
    data: cardDetails,
    refresh: updateCard,
    isPending: isLoadingContent,
    error,
  } = useFetch(
    getApiPath(groupId, cardId),
    { method: "GET", headers },
    {
      type: "json",
      fetched: true,
      data: EMPTY_CARD,
    }
  );
  const cardNotFound = "error" in (cardDetails as any);
  const {
    type: cardType,
    content: cardContent,
    images: cardImages,
  } = cardDetails || EMPTY_CARD;

  // effects
  useEffect(() => {
    if (sid) updateCard();
  }, [sid, updateCard]);
  useEffect(() => {
    if (error && !(error instanceof DOMException)) updateSid();
  }, [error, updateSid]);
  const [isFetched, setIsFetched] = useState(false);
  useEffect(() => {
    if (isLoadingContent && !isFetched) setIsFetched(true);
  }, [isLoadingContent, isFetched, setIsFetched]);

  // operations
  const editCurrentCard = useCallback(
    (item: Partial<WKCardDetailed>) =>
      editCard(cardId, item, false).finally(updateCard),
    [editCard, cardId, updateCard]
  );
  const deleteCurrentCard = useCallback(
    () =>
      deleteCard(cardId, false)
        .then(() => router.push(WAKAWAKA_GROUP(groupId)))
        .finally(updateGroup),
    [deleteCard, groupId, cardId, updateGroup, router]
  );
  const [uploadings, setUploadings] = useState<symbol[]>([]);
  const uploadImages = useCallback(
    async (files?: FileList | null) => {
      if (!files || !files.length) return null;
      const uploaded = [...files].map(async (file) => {
        try {
          if (!file.type.startsWith("image/")) {
            // modal.open("File type is not supported.");
            return null;
          }
          const res = await fetch(getApiPath("image"), {
            method: "POST",
            headers: {
              ...headers,
              "Content-Type": "application/uint8array",
              Filename: file.name,
            },
            body: await readStream(file.stream()),
          });
          return (await res.json()) as WKImage;
        } catch {
          return null;
        }
      });
      const symbol = Symbol();
      setUploadings((s) => [...s, symbol]);
      try {
        return await buildAPIReq(
          "POST",
          {
            images: (await Promise.all(uploaded)).filter((i) => i) as WKImage[],
          },
          groupId,
          cardId,
          "images"
        ).finally(updateCard);
      } finally {
        setUploadings((s) => s.filter((i) => i !== symbol));
      }
    },
    [headers, groupId, cardId, buildAPIReq, updateCard, setUploadings]
  );

  const isUploading = uploadings.length !== 0;
  const isLoadingCardContent =
    isLoadingContent || operatingCardIds.includes(cardId) || !isFetched;
  const isLoadingCard = isLoadingGroup || isLoadingCardContent;

  return (
    <wkCardContext.Provider
      value={{
        ...wk,
        cardId,
        cardName,
        cardType,
        cardContent,
        cardImages,
        cardNotFound,
        updateCard,
        isLoadingCard,
        isLoadingCardContent,
        editCurrentCard,
        deleteCurrentCard,
        isUploading,
        uploadImages,
      }}
    >
      {children}
    </wkCardContext.Provider>
  );
}

export function useWK() {
  return useContext(wkBaseContext);
}

export function useWKGroup() {
  return useContext(wkGroupContext);
}

export function useWKCard() {
  return useContext(wkCardContext);
}
