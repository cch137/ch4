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
        {/* <Spacer y={4} />
        <div className="flex flex-col p-2 rounded-md border-1 border-default-300 gap-2">
          {newBlockType === "image" ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Input
                  variant="flat"
                  className="flex-1"
                  value=""
                  placeholder="Paste here"
                  onPaste={(e) => uploadImages(e.clipboardData.files)}
                  autoFocus
                />
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  multiple
                  onInput={() => {
                    const el = imageInputRef.current!;
                    uploadImages(el.files);
                    el.value = "";
                  }}
                  hidden
                />
              </div>
              <div
                className="w-full h-32 bg-default-50 rounded-lg flex-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => (
                  e.preventDefault(), uploadImages(e.dataTransfer.files)
                )}
              >
                <div className="flex-center gap-4 select-none">
                  <Button
                    variant="flat"
                    onPress={() => imageInputRef.current!.click()}
                  >
                    Select files
                  </Button>
                  <div className="text-default-300">/</div>
                  <div className="text-default-600">Drop files</div>
                </div>
              </div>
            </>
          ) : (
            <Textarea
              label="Content"
              variant="bordered"
              ref={contentTxtRef}
              isDisabled={isUploading}
              value={newBlockContent}
              onValueChange={(s) => setNewBlockContent(s)}
              onPaste={(e) => uploadImages(e.clipboardData.files)}
              onKeyUp={(e) => {
                if (e.key === "Enter") contentSubmitRef.current?.click();
              }}
              autoFocus
            />
          )}
          <div className="flex gap-2 justify-end">
            {newBlockType === "image" ? null : (
              <Button
                variant="bordered"
                size="sm"
                startContent={<MdAdd className="text-lg" />}
                onPress={() => {
                  const content = newBlockContent;
                  if (!content) return;
                  createBlock(newBlockType, content)
                    .then(() => setNewBlockContent(""))
                    .finally(updateBlocks);
                }}
                isDisabled={isUploading}
                ref={contentSubmitRef}
              >
                Add block
              </Button>
            )}
            <Select
              aria-label="Block Type"
              placeholder="Block Type"
              size="sm"
              variant="bordered"
              className="w-32"
              value={newBlockType}
              defaultSelectedKeys={[newBlockType]}
              onChange={(e) => setNewBlockType(e.target.value as WKContentType)}
              isDisabled={isUploading}
            >
              <SelectItem value="text" key="text">
                Text
              </SelectItem>
              <SelectItem value="md" key="md">
                Markdown
              </SelectItem>
              <SelectItem value="image" key="image">
                Image
              </SelectItem>
            </Select>
          </div>
        </div> */}
        <Spacer y={8} />
      </div>
    </>
  );
}
