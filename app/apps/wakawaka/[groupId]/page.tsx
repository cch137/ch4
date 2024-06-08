"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Button } from "@nextui-org/button";
import { Spacer } from "@nextui-org/spacer";
import { Spinner } from "@nextui-org/spinner";
import { Switch } from "@nextui-org/switch";
import {
  MdAdd,
  MdAutoStories,
  MdDelete,
  MdEdit,
  MdPlaylistAddCheck,
  MdPlaylistRemove,
  MdRestartAlt,
} from "react-icons/md";
import {
  WAKAWAKA_APPPATH,
  WAKAWAKA_APPSHORT,
  WAKAWAKA_CARD,
} from "../constants";
import { useWKGroup, type WKCardInfo } from "../provider";
import useModalInput from "@/components/modals/input";
import { appTitle } from "@/constants/app";
import useModalMessage from "@/components/modals/message";
import useModalConfirm from "@/components/modals/confirm";
import formatDate from "@cch137/utils/str/date";

function CardItem({
  gid,
  item,
  isDisabled = false,
  del,
  rename,
  enable,
  activate,
}: {
  gid: string;
  item: WKCardInfo;
  isDisabled?: boolean;
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
        <Link
          href={WAKAWAKA_CARD(gid, item._id)}
          className="flex-1 py-2 pl-4"
          prefetch={false}
        >
          <div>{item.name}</div>
          <div className="flex items-center gap-1 text-default-300 text-xs max-sm:hidden">
            <div
              className={`rounded-full size-2 ${
                activated ? "bg-success-500" : "bg-danger-500"
              } transition`}
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
            isDisabled={isDisabled}
          />
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => activate(item._id)}
            isDisabled={isDisabled}
          >
            <MdRestartAlt className="text-lg" />
          </Button>
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={renameInput.open}
            isDisabled={isDisabled}
          >
            <MdEdit className="text-lg" />
          </Button>
          <Button
            isIconOnly
            variant="flat"
            color="danger"
            size="sm"
            onPress={deleteConfirm.open}
            isDisabled={isDisabled}
          >
            <MdDelete className="text-lg" />
          </Button>
        </div>
      </div>
    </>
  );
}

export default function CardGroup() {
  const {
    groupId,
    groupName,
    editGroup,
    cards,
    createCard,
    editCard,
    deleteCard,
    isLoadingGroup,
    operatingCardIds,
    activateCards,
    enableCards,
    disableCards,
  } = useWKGroup();

  const cardNameInput = useModalInput((name) => createCard(name), {
    title: "Add a card",
    label: "Card name",
    textarea: true,
  });
  const activateCardsConfirm = useModalConfirm(
    "Confirm",
    "Confirm to activate all cards?",
    activateCards
  );
  const enableCardsConfirm = useModalConfirm(
    "Confirm",
    "Confirm to enable all cards?",
    enableCards
  );
  const disableCardsConfirm = useModalConfirm(
    "Confirm",
    "Confirm to disable all cards?",
    disableCards
  );

  const renameCard = useCallback(
    (_id: string, name: string) => editCard(_id, { name }),
    [editCard]
  );
  const enableCard = useCallback(
    (_id: string, enabled: boolean) => editCard(_id, { enabled }),
    [editCard]
  );
  const activateCard = useCallback(
    (_id: string) =>
      editCard(_id, { enabled: true, expire: new Date().toISOString() }),
    [editCard]
  );

  const modal = useModalMessage();
  const rename = useCallback(
    (_id: string, name: string) => editGroup(_id, { name }),
    [editGroup]
  );
  const groupRenameInput = useModalInput(
    (s) => {
      if (!s) return modal.open("Group name cannot be empty.");
      rename(groupId, s);
    },
    {
      title: "Rename group",
      label: "Group name",
      defaultValue: groupName,
    }
  );

  return (
    <>
      {enableCardsConfirm.Modal}
      {disableCardsConfirm.Modal}
      {activateCardsConfirm.Modal}
      {cardNameInput.Modal}
      {modal.Modal}
      {groupRenameInput.Modal}
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
          <div className="flex gap-2">
            <Button
              variant="flat"
              size="sm"
              isIconOnly
              onPress={groupRenameInput.open}
            >
              <MdEdit className="text-lg" />
            </Button>
          </div>
        </div>
        <Spacer y={4} />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="flat"
            size="sm"
            startContent={<MdPlaylistAddCheck className="text-lg" />}
            onPress={enableCardsConfirm.open}
          >
            Enable
          </Button>
          <Button
            variant="flat"
            size="sm"
            startContent={<MdPlaylistRemove className="text-lg" />}
            onPress={disableCardsConfirm.open}
          >
            Disable
          </Button>
          <Button
            variant="flat"
            size="sm"
            startContent={<MdRestartAlt className="text-lg" />}
            onPress={activateCardsConfirm.open}
          >
            Reset
          </Button>
          <Button
            variant="flat"
            size="sm"
            startContent={<MdAutoStories className="text-lg" />}
            as={Link}
            href={WAKAWAKA_CARD(groupId, "review")}
          >
            Review
          </Button>
          <div className="flex-1" />
          <Button
            variant="flat"
            size="sm"
            startContent={<MdAdd className="text-lg" />}
            onPress={cardNameInput.open}
          >
            Add a card
          </Button>
        </div>
        <Spacer y={4} />
        {cards?.length === 0 ? (
          <div className="opacity-50 select-none flex-center">
            {isLoadingGroup ? <Spinner color="current" /> : "no data"}
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
                isDisabled={Boolean(
                  operatingCardIds.find((i) => i === item._id)
                )}
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
