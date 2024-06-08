"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { Kbd } from "@nextui-org/kbd";
import {
  MdRestartAlt,
  MdSkipNext,
  MdSkipPrevious,
  MdStop,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import random from "@cch137/utils/random";

import { appTitle } from "@/constants/app";
import { swipe } from "@/hooks/useAppDataManager";
import {
  useWKGroup,
  useWKCard,
  WKCardProvider,
  type WKCardInfo,
} from "../../provider";
import { WAKAWAKA_GROUP } from "../../constants";
import CardContent from "../CardContent";

function Card({
  show = false,
  next: _next,
  prev,
}: {
  show: boolean;
  next: () => void;
  prev?: () => void;
}) {
  const {
    cardId,
    cardName,
    cardType,
    cardContent,
    isLoadingCardContent,
    cards,
    editCard,
  } = useWKCard();
  const [isSeen, setIsSeen] = useState(false);
  const [addedExpire, setAddedExpire] = useState<boolean>();
  const [expCursor, setExpCursor] = useState(3);

  const addExpire = useCallback(
    (ms: number) =>
      editCard(cardId, { expire: new Date(Date.now() + ms).toISOString() }),
    [cardId, editCard]
  );

  const next = useCallback(() => {
    if (!addedExpire) {
      setAddedExpire(true);
      switch (expCursor) {
        case 0: {
          addExpire(3 * 3600000);
          break;
        }
        case 1: {
          addExpire(1 * 3600000);
          break;
        }
        case 2: {
          addExpire(0);
          break;
        }
        case 3: {
          addExpire(24 * 3600000);
          break;
        }
        case 4: {
          addExpire(72 * 3600000);
          break;
        }
        case 5: {
          addExpire(168 * 3600000);
          break;
        }
        case 6: {
          addExpire(336 * 3600000);
          break;
        }
      }
    }
    _next();
  }, [addedExpire, expCursor, setAddedExpire, addExpire, _next]);

  useEffect(() => {
    if (!show) return;
    const card = cards.find((i) => i._id === cardId)!;
    const isAllowToPlay = card.enabled && new Date(card.expire) < new Date();
    if (show && !isAllowToPlay && addedExpire === void 0) _next();
  }, [show, addedExpire, cardId, cards, _next]);

  useEffect(() => {
    if (!show) return;
    const onSwipeUp = () => {
      if (isSeen) setIsSeen(false);
      else if (prev) prev();
    };
    const onSwipeDown = () => {
      if (isSeen) next();
      else setIsSeen(true);
    };
    const onSwipeLeft = () => {
      if (isSeen && !addedExpire) setExpCursor((v) => Math.max(0, v - 1));
      else if (addedExpire) setAddedExpire(false);
    };
    const onSwipeRight = () => {
      if (isSeen && !addedExpire) setExpCursor((v) => Math.min(6, v + 1));
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown": {
          onSwipeDown();
          break;
        }
        case "ArrowUp": {
          onSwipeUp();
          break;
        }
        case "ArrowLeft": {
          onSwipeLeft();
          break;
        }
        case "ArrowRight": {
          onSwipeRight();
          break;
        }
      }
    };
    swipe.on("up", onSwipeUp);
    swipe.on("down", onSwipeDown);
    swipe.on("left", onSwipeLeft);
    swipe.on("right", onSwipeRight);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      swipe.off("up", onSwipeUp);
      swipe.off("down", onSwipeDown);
      swipe.off("left", onSwipeLeft);
      swipe.off("right", onSwipeRight);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [show, isSeen, addedExpire, setAddedExpire, setIsSeen, prev, next]);

  if (!show) return null;
  if (isLoadingCardContent)
    return (
      <div className="flex-center py-8">
        <Spinner color="current" />
      </div>
    );
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{cardName}</h1>
      <div className={isSeen ? "" : "hidden"}>
        <CardContent
          _id={cardId}
          type={cardType}
          content={cardContent}
          isLoading={isLoadingCardContent}
        />
      </div>
      <div className="flex flex-col gap-2 pt-4">
        <div className="w-full flex flex-wrap gap-2">
          <Button
            variant="flat"
            onPress={prev}
            className={isSeen || !prev ? "hidden" : ""}
            startContent={<MdSkipPrevious className="text-lg" />}
            endContent={<Kbd keys={["up"]}></Kbd>}
          >
            Back
          </Button>
          <Button
            variant="flat"
            onPress={() => setIsSeen(true)}
            className={isSeen ? "hidden" : ""}
            startContent={<MdVisibility className="text-lg" />}
            endContent={<Kbd keys={["down"]}></Kbd>}
          >
            Show
          </Button>
          <Button
            variant="flat"
            onPress={() => setIsSeen(false)}
            className={isSeen ? "" : "hidden"}
            startContent={<MdVisibilityOff className="text-lg" />}
            endContent={<Kbd keys={["up"]}></Kbd>}
          >
            Hide
          </Button>
          <Button
            variant="flat"
            onPress={next}
            className={isSeen ? "" : "hidden"}
            startContent={<MdSkipNext className="text-lg" />}
            endContent={<Kbd keys={["down"]}></Kbd>}
          >
            Next
          </Button>
          <Button
            variant="flat"
            onPress={() => setAddedExpire(false)}
            className={addedExpire ? "" : "hidden"}
            startContent={<MdRestartAlt className="text-lg" />}
            endContent={<Kbd keys={["left"]}></Kbd>}
          >
            Reset expire
          </Button>
        </div>
        <div
          className={`${
            isSeen && !addedExpire ? "" : "hidden"
          } flex flex-wrap gap-2`}
        >
          <Button
            variant={expCursor === 0 ? "shadow" : "flat"}
            className="min-w-16 w-16 text-warning-500"
            onPress={() => addExpire(3 * 3600000)}
          >
            3H
          </Button>
          <Button
            variant={expCursor === 1 ? "shadow" : "flat"}
            className="min-w-16 w-16 text-warning-500"
            onPress={() => addExpire(1 * 3600000)}
          >
            1H
          </Button>
          <Button
            variant={expCursor === 2 ? "shadow" : "flat"}
            color="danger"
            className="min-w-16 w-16"
            onPress={() => addExpire(0)}
          >
            X
          </Button>
          <Button
            variant={expCursor === 3 ? "shadow" : "flat"}
            className="min-w-16 w-16 text-default-500"
            onPress={() => addExpire(24 * 3600000)}
          >
            1D
          </Button>
          <Button
            variant={expCursor === 4 ? "shadow" : "flat"}
            className="min-w-16 w-16 text-default-500"
            onPress={() => addExpire(72 * 3600000)}
          >
            3D
          </Button>
          <Button
            variant={expCursor === 5 ? "shadow" : "flat"}
            className="min-w-16 w-16 text-success-500"
            onPress={() => addExpire(168 * 3600000)}
          >
            7D
          </Button>
          <Button
            variant={expCursor === 6 ? "shadow" : "flat"}
            className="min-w-16 w-16 text-success-500"
            onPress={() => addExpire(336 * 3600000)}
          >
            14D
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PlayCardGroup() {
  const { groupId, groupName, cards, isLoadingGroup } = useWKGroup();
  const [cursor, setCursor] = useState(1);
  const [needLoad, setNeedLoad] = useState(false);
  const [enabledCards, setEnabledCards] = useState<WKCardInfo[]>([]);
  const isEnd = cursor >= enabledCards.length;

  useEffect(() => {
    if (!isEnd || isLoadingGroup) return;
    setEnabledCards([]);
    setNeedLoad(true);
  }, [isEnd, isLoadingGroup, setEnabledCards, setNeedLoad]);
  useEffect(() => {
    if (!needLoad || isLoadingGroup) return;
    setNeedLoad(false);
    const now = new Date();
    const enableds = cards.filter((i) => i.enabled && new Date(i.expire) < now);
    const shuffleds = random.shuffle(enableds);
    if (shuffleds.length) {
      setCursor(0);
      setEnabledCards(shuffleds);
    }
  }, [needLoad, isLoadingGroup, setCursor, setEnabledCards, cards]);

  const prev = useCallback(
    () => setCursor((i) => Math.max(0, i - 1)),
    [setCursor]
  );
  const next = useCallback(() => setCursor((i) => i + 1), [setCursor]);

  if (isLoadingGroup && !enabledCards.length)
    return (
      <div className="flex-center py-8">
        <Spinner color="current" />
      </div>
    );

  if (isEnd && !isLoadingGroup)
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
      <title>{appTitle(groupName)}</title>
      <div className="flex">
        <Button
          variant="light"
          startContent={<MdStop className="text-lg" />}
          as={Link}
          href={WAKAWAKA_GROUP(groupId)}
          className="text-default-300 hover:text-current"
        >
          Stop
        </Button>
        <div className="flex-1" />
      </div>
      <div className="max-w-xl py-8 m-auto">
        {enabledCards.slice(0, cursor + 10).map((card, i) => (
          <WKCardProvider id={card._id} key={i}>
            <Card
              show={i === cursor}
              prev={i === 0 ? void 0 : prev}
              next={next}
            />
          </WKCardProvider>
        ))}
      </div>
    </div>
  );
}
