"use client";

import { swipe } from "@/hooks/useAppDataManager";
import { Button } from "@nextui-org/button";
import { useCallback, useEffect, useState } from "react";
import { IoCheckmark, IoStop } from "react-icons/io5";
import Link from "next/link";
import { useWK, useWKPage, WKBlock, type WKCard } from "../../provider";
import { API_OP_CARDS_PATH, WAKAWAKA_GROUP } from "../../constants";
import random from "@cch137/utils/random";
import { Spacer, Spinner } from "@nextui-org/react";
import BlockItem from "../BlockItem";

const blockMap = new WeakMap<WKCard, WKBlock[]>();
const shuffleActivatedCards = (cards: WKCard[]) => {
  const now = new Date();
  return random.shuffle(
    cards.filter((i) => i.enabled && new Date(i.expire) < now)
  );
};

export default function PlayCardGroup() {
  const { sid, headers } = useWK();
  const {
    id: groupId,
    cards: srcCards,
    updateCards: updateSrcCards,
    setCards: setSrcCards,
    isLoadingCards,
  } = useWKPage();

  const [cards, setCards] = useState(shuffleActivatedCards(srcCards));
  const [blockLoadings, setBlockLoadings] = useState<symbol[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const isLoadingBlocks = blockLoadings.length !== 0;
  const [started, setStarted] = useState(Date.now());

  const [seenCard, setSeenCard] = useState<WKCard>();
  const card = cards[0] as WKCard | undefined;
  const blocks = card ? blockMap.get(card) || [] : [];
  const isSeen = seenCard === card;
  const seeCard = useCallback(() => setSeenCard(card), [setSeenCard, card]);

  useEffect(() => {
    if (!isLoadingCards) setIsUpdating(false);
  }, [isLoadingCards, setIsUpdating]);

  useEffect(() => {
    for (let i = 0; i < length; i++) {
      const card = cards[i];
      if (blockMap.has(card)) continue;
      blockMap.set(card, []);
      const symbol = Symbol();
      setBlockLoadings((s) => [...s, symbol]);
      fetch(API_OP_CARDS_PATH(groupId, card._id), {
        method: "GET",
        headers,
      })
        .then(async (res) => {
          const blocks = (await res.json()) as WKBlock[];
          blockMap.set(card, blocks);
        })
        .catch(() => {
          blockMap.delete(card);
        })
        .finally(() => {
          setBlockLoadings((s) => s.filter((i) => i !== symbol));
        });
    }
  }, [groupId, headers, cards, setBlockLoadings]);

  useEffect(() => {
    if (!cards.length && !isLoadingCards && !isUpdating) {
      const l = shuffleActivatedCards(srcCards);
      if (!l.length) return;
      setCards(l);
      setSeenCard(void 0);
      setStarted(Date.now());
    }
  }, [
    cards,
    srcCards,
    isLoadingCards,
    isUpdating,
    setSeenCard,
    setStarted,
    setCards,
  ]);

  const addExpire = useCallback(
    (ms: number) => {
      const _id = card?._id;
      setCards(cards.slice(1));
      if (_id && ms) {
        const expire = new Date(started + ms);
        setSrcCards((l) =>
          l
            ? l.map((i) =>
                i._id === _id ? { ...i, expire: expire.toISOString() } : i
              )
            : []
        );
        setIsUpdating(true);
        fetch(API_OP_CARDS_PATH(groupId, _id), {
          method: "PUT",
          body: JSON.stringify({ expire }),
          headers,
        }).finally(updateSrcCards);
      }
    },
    [
      headers,
      setCards,
      setSrcCards,
      card,
      cards,
      groupId,
      started,
      updateSrcCards,
      setIsUpdating,
    ]
  );

  useEffect(() => {
    const onSwipeLeft = () => {
      // left
    };
    const onSwipeRight = () => {
      if (!isSeen) seeCard();
    };
    swipe.on("left", onSwipeLeft);
    swipe.on("right", onSwipeRight);
    return () => {
      swipe.off("left", onSwipeLeft);
      swipe.off("right", onSwipeRight);
    };
  }, [isSeen, seeCard]);

  if (!sid)
    return (
      <div className="flex-center py-8">
        <Spinner color="current" />
      </div>
    );

  if (!card)
    return (
      <div className="max-w-screen-md m-auto">
        <div className="flex-center flex-col gap-4 pt-32">
          <div>No cards need to be reviewed.</div>
          <Button as={Link} href={WAKAWAKA_GROUP(groupId)}>
            Back
          </Button>
        </div>
      </div>
    );

  return (
    <div className="max-w-screen-md m-auto">
      <div className="flex">
        <Button
          variant="light"
          startContent={<IoStop className="text-lg" />}
          as={Link}
          href={WAKAWAKA_GROUP(groupId)}
          className="text-default-300 hover:text-current"
        >
          Stop
        </Button>
        <div className="flex-1" />
        {isLoadingBlocks ? <Spinner color="current" size="sm" /> : null}
      </div>
      <div>
        <Spacer y={4} />
        <div className="flex-center flex-wrap gap-2">
          {isSeen ? (
            <>
              <Button
                variant="flat"
                color="danger"
                className="min-w-16 w-16"
                onPress={() => addExpire(0)}
              >
                X
              </Button>
              <Button
                variant="flat"
                color="warning"
                className="min-w-16 w-16"
                onPress={() => addExpire(1 * 3600000)}
              >
                1H
              </Button>
              <Button
                variant="flat"
                color="warning"
                className="min-w-16 w-16"
                onPress={() => addExpire(3 * 3600000)}
              >
                3H
              </Button>
              <Button
                variant="flat"
                color="primary"
                className="min-w-16 w-16"
                onPress={() => addExpire(24 * 3600000)}
              >
                1D
              </Button>
              <Button
                variant="flat"
                color="primary"
                className="min-w-16 w-16"
                onPress={() => addExpire(72 * 3600000)}
              >
                3D
              </Button>
              <Button
                variant="flat"
                color="success"
                className="min-w-16 w-16"
                onPress={() => addExpire(168 * 3600000)}
              >
                7D
              </Button>
              <Button
                variant="flat"
                color="success"
                className="min-w-16 w-16"
                onPress={() => addExpire(336 * 3600000)}
              >
                14D
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="flat"
                color="default"
                isIconOnly
                onPress={seeCard}
              >
                <IoCheckmark className="text-lg" />
              </Button>
            </>
          )}
        </div>
        <div className="max-w-xl py-8 m-auto">
          <h1 className="text-2xl font-bold">{card?.name || ""}</h1>
          <Spacer y={4} />
          {isSeen ? (
            <div className="flex flex-col gap-2">
              {blocks.map((i, k) => (
                <BlockItem item={i} key={k} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
