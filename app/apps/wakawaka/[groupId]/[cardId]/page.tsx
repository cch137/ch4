"use client";

import "@/styles/react-markdown.css";

import { useEffect, createRef } from "react";
import Link from "next/link";
import { Button } from "@nextui-org/button";
import { Spacer } from "@nextui-org/spacer";
import { Spinner } from "@nextui-org/spinner";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import { useRouter } from "next/navigation";

import { appTitle } from "@/constants/app";
import useModalMessage from "@/components/modals/message";
import useModalInput from "@/components/modals/input";
import useModalConfirm from "@/components/modals/confirm";
import {
  WAKAWAKA_APPPATH,
  WAKAWAKA_APPSHORT,
  WAKAWAKA_GROUP,
} from "../../constants";
import { useWKCard } from "../../provider";
import CardContent from "../CardContent";

export default function CardBlocks() {
  const {
    isLoadingCard,
    groupId,
    groupName,
    cardId,
    cardName,
    cardType,
    cardContent,
    cardImages,
    cardNotFound,
    isUploading,
    editCard,
    editCurrentCard,
    deleteCurrentCard,
    uploadImages,
    createCard,
  } = useWKCard();
  const modal = useModalMessage("Error", "");
  const imageInputRef = createRef<HTMLInputElement>();
  const contentSubmitRef = createRef<HTMLButtonElement>();

  const renameInput = useModalInput(
    (name) => {
      if (!name) return modal.open("Card name cannot be empty.");
      editCard(cardId, { name });
    },
    {
      title: "Rename card",
      label: "Card name",
      defaultValue: cardName,
      textarea: true,
    }
  );
  const deleteConfirm = useModalConfirm(
    "Delete card",
    "Are you sure you want to delete the card?",
    deleteCurrentCard
  );

  const cardNameInput = useModalInput((name) => createCard(name), {
    title: "Add a card",
    label: "Card name",
    textarea: true,
  });

  const router = useRouter();
  useEffect(() => {
    if (cardNotFound) router.push(WAKAWAKA_GROUP(groupId));
  }, [cardNotFound, router, groupId]);

  if (cardNotFound) return <></>;

  return (
    <>
      {modal.Modal}
      {renameInput.Modal}
      {deleteConfirm.Modal}
      {cardNameInput.Modal}
      <div className="max-w-screen-md m-auto">
        <div className="flex">
          <title>{appTitle(cardName)}</title>
          <h1 className="font-bold text-2xl flex-1">
            <Link
              className="opacity-75 hover:brightness-75 transition"
              href={WAKAWAKA_APPPATH}
            >
              {WAKAWAKA_APPSHORT}
            </Link>
            <span className="opacity-25 px-1">/</span>
            <Link
              className="opacity-75 hover:brightness-75 transition"
              href={WAKAWAKA_GROUP(groupId)}
            >
              {groupName}
            </Link>
            <span className="opacity-25 px-1">/</span>
            <span>{cardName}</span>
          </h1>
          <div className="flex gap-2">
            <Button
              variant="flat"
              size="sm"
              isIconOnly
              onPress={renameInput.open}
            >
              <MdEdit className="text-lg" />
            </Button>
            <Button
              color="danger"
              variant="flat"
              size="sm"
              isIconOnly
              onPress={deleteConfirm.open}
            >
              <MdDelete className="text-lg" />
            </Button>
          </div>
        </div>
        <Spacer y={8} />
        <div className="flex flex-col gap-2">
          <CardContent
            _id={cardId}
            type={cardType}
            content={cardContent}
            isLoading={isLoadingCard}
            isEditable={true}
            edit={(type, content, images) =>
              editCurrentCard({ type, content, images })
            }
          />
        </div>
        <Spacer y={8} />
        <div className="flex justify-end">
          <Button
            variant="flat"
            size="sm"
            startContent={<MdAdd className="text-lg" />}
            onPress={cardNameInput.open}
          >
            Add another card
          </Button>
        </div>
        <Spacer y={8} />
        {isUploading ? (
          <>
            <Spacer y={4} />
            <div className="flex-center gap-2 text-default-500 select-none">
              <Spinner color="current" size="sm" />
              <div className="text-center">Uploading...</div>
            </div>
          </>
        ) : null}
        <Spacer y={8} />
      </div>
    </>
  );
}
