"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Button } from "@nextui-org/button";
import { Spacer } from "@nextui-org/spacer";
import { Spinner } from "@nextui-org/spinner";
import { Switch } from "@nextui-org/switch";
import {
  IoAdd,
  IoCheckmark,
  IoClose,
  IoPencil,
  IoPlay,
  IoSync,
  IoTrashOutline,
} from "react-icons/io5";
import { useRouter } from "next/navigation";
import {
  API_OP_CARDS_PATH,
  WAKAWAKA_APPPATH,
  WAKAWAKA_APPSHORT,
  WAKAWAKA_CARD,
} from "../constants";
import { useWK, useWKPage, type WKCard } from "../provider";
import useModalInput from "@/components/modals/input";
import { appTitle } from "@/constants/app";
import useModalMessage from "@/components/modals/message";
import useModalConfirm from "@/components/modals/confirm";
import formatDate from "@cch137/utils/str/date";

function CardItem({
  gid,
  item,
  del,
  rename,
  enable,
  activate,
}: {
  gid: string;
  item: WKCard;
  del: (_id: string) => void;
  rename: (_id: string, name: string) => void;
  enable: (_id: string, enabled: boolean) => void;
  activate: (_id: string) => void;
}) {
  const modal = useModalMessage();
  const deleteConfirm = useModalConfirm(
    "Delete card",
    "Are you sure you want to delete the card?",
    () => del(item._id)
  );
  const renameInput = useModalInput(
    (s) => {
      if (!s) return modal.open("Card name cannot be empty.");
      rename(item._id, s);
    },
    {
      title: "Rename card",
      label: "Card name",
      defaultValue: item.name,
      textarea: true,
    }
  );
  const expired = new Date(item.expire);
  const activated = item.enabled && Date.now() >= expired.getTime();
  return (
    <>
      {modal.Modal}
      {deleteConfirm.Modal}
      {renameInput.Modal}
      <div className="flex-center bg-default-50 rounded-md hover:brightness-90 transition">
        <Link href={WAKAWAKA_CARD(gid, item._id)} className="flex-1 py-2 pl-4">
          <div>{item.name}</div>
          <div className="flex items-center gap-1 text-default-300 text-xs max-sm:hidden">
            <div
              className={`rounded-full size-2 ${
                activated ? "bg-success-500" : "bg-danger-500"
              }`}
            />
            <div className="text-nowrap text-ellipsis">
              {formatDate(expired)}
            </div>
          </div>
        </Link>
        <div className="flex-center gap-2 px-4">
          <Switch
            size="sm"
            color="success"
            isSelected={item.enabled}
            onValueChange={(v) => enable(item._id, v)}
          />
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => activate(item._id)}
          >
            <IoSync className="text-lg" />
          </Button>
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={renameInput.open}
          >
            <IoPencil className="text-lg" />
          </Button>
          <Button
            isIconOnly
            variant="flat"
            color="danger"
            size="sm"
            onPress={deleteConfirm.open}
          >
            <IoTrashOutline className="text-lg" />
          </Button>
        </div>
      </div>
    </>
  );
}

export default function CardGroup() {
  const { sid } = useWK();
  const {
    id: groupId,
    name: groupName,
    apiPath,
    headers,
    cards,
    updateCards,
    isLoadingCards,
  } = useWKPage();
  const router = useRouter();

  const cardNameInput = useModalInput(
    (name) => {
      fetch(apiPath, {
        method: "POST",
        headers,
        body: JSON.stringify({ name }),
      })
        .then(async (res) =>
          router.push(WAKAWAKA_CARD(groupId, await res.json()))
        )
        .finally(updateCards);
    },
    { title: "Add a card", label: "Card name", textarea: true }
  );

  const activateCardsConfirm = useModalConfirm(
    "Confirm",
    "Confirm to activate all cards?",
    () => {
      fetch(apiPath + "/activate", {
        method: "POST",
        headers,
      }).finally(updateCards);
    }
  );

  const enableCardsConfirm = useModalConfirm(
    "Confirm",
    "Confirm to enable all cards?",
    () => {
      fetch(apiPath + "/enable", {
        method: "POST",
        headers,
      }).finally(updateCards);
    }
  );

  const disableCardsConfirm = useModalConfirm(
    "Confirm",
    "Confirm to disable all cards?",
    () => {
      fetch(apiPath + "/disable", {
        method: "POST",
        headers,
      }).finally(updateCards);
    }
  );

  const deleteCard = useCallback(
    (_id: string) => {
      fetch(API_OP_CARDS_PATH(groupId, _id), {
        method: "DELETE",
        headers,
      }).finally(updateCards);
    },
    [headers, updateCards, groupId]
  );

  const renameCard = useCallback(
    (_id: string, name: string) => {
      fetch(API_OP_CARDS_PATH(groupId, _id), {
        method: "PUT",
        body: JSON.stringify({ name }),
        headers,
      }).finally(updateCards);
    },
    [headers, updateCards, groupId]
  );

  const enableCard = useCallback(
    (_id: string, enabled: boolean) => {
      fetch(API_OP_CARDS_PATH(groupId, _id), {
        method: "PUT",
        body: JSON.stringify({ enabled }),
        headers,
      }).finally(updateCards);
    },
    [headers, updateCards, groupId]
  );

  const activateCard = useCallback(
    (_id: string) => {
      fetch(API_OP_CARDS_PATH(groupId, _id), {
        method: "PUT",
        body: JSON.stringify({ enabled: true, expire: new Date() }),
        headers,
      }).finally(updateCards);
    },
    [groupId, headers, updateCards]
  );

  return (
    <>
      {enableCardsConfirm.Modal}
      {disableCardsConfirm.Modal}
      {activateCardsConfirm.Modal}
      {cardNameInput.Modal}
      <div className="max-w-screen-md m-auto">
        <div className="flex">
          <title>{appTitle(groupName)}</title>
          <h1 className="font-bold text-2xl flex-1">
            <Link
              className="opacity-75 hover:brightness-75 transition"
              href={WAKAWAKA_APPPATH}
            >
              {WAKAWAKA_APPSHORT}
            </Link>
            <span className="opacity-25 px-1">/</span>
            <span>{groupName}</span>
          </h1>
        </div>
        <Spacer y={4} />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="flat"
            size="sm"
            startContent={<IoCheckmark className="text-lg" />}
            onPress={enableCardsConfirm.open}
          >
            Enable
          </Button>
          <Button
            variant="flat"
            size="sm"
            startContent={<IoClose className="text-lg" />}
            onPress={disableCardsConfirm.open}
          >
            Disable
          </Button>
          <Button
            variant="flat"
            size="sm"
            startContent={<IoSync className="text-lg" />}
            onPress={activateCardsConfirm.open}
          >
            Activate
          </Button>
          <Button
            variant="flat"
            size="sm"
            startContent={<IoPlay className="text-lg" />}
            as={Link}
            href={WAKAWAKA_CARD(groupId, "play")}
          >
            Play
          </Button>
          <div className="flex-1" />
          <Button
            variant="flat"
            size="sm"
            startContent={<IoAdd className="text-lg" />}
            onPress={cardNameInput.open}
          >
            Add a card
          </Button>
        </div>
        <Spacer y={4} />
        {cards?.length === 0 ? (
          <div className="opacity-50 select-none flex-center">
            {!sid || isLoadingCards ? <Spinner color="current" /> : "no data"}
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          {cards
            .sort((a, b) => (a.name > b.name ? 1 : -1))
            .map((item, i) => (
              <CardItem
                key={i}
                gid={groupId}
                item={item}
                del={deleteCard}
                rename={renameCard}
                enable={enableCard}
                activate={activateCard}
              />
            ))}
        </div>
      </div>
    </>
  );
}
