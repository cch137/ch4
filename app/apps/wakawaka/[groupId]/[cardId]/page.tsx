"use client";

import "@/styles/react-markdown.css";

import { createRef, useCallback, useState } from "react";
import Link from "next/link";
import { Button } from "@nextui-org/button";
import { Textarea, Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { Spacer } from "@nextui-org/spacer";
import { Spinner } from "@nextui-org/spinner";
import { appTitle } from "@/constants/app";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import {
  API_IMAGE_PATH,
  API_OP_BLOCKS_PATH,
  API_OP_CARDS_PATH,
  WAKAWAKA_APPPATH,
  WAKAWAKA_APPSHORT,
  WAKAWAKA_GROUP,
} from "../../constants";
import type { BlockType, WKBlock } from "../../provider";
import { useWK, useWKCard, useWKPage } from "../../provider";
import { readStream, readString } from "@cch137/utils/stream";
import useModalMessage from "@/components/modals/message";
import useModalConfirm from "@/components/modals/confirm";
import useModalInput from "@/components/modals/input";
import useModalSelect from "@/components/modals/select";
import BlockItem from "../BlockItem";

function BlockItemEditor({
  item,
  del,
  edit,
}: {
  item: WKBlock;
  del: (_id: string) => void;
  edit: (_id: string, type: string, content: string) => void;
}) {
  const modal = useModalMessage();
  const deleteConfirm = useModalConfirm(
    "Delete block",
    "Are you sure you want to delete the block?",
    () => del(item._id)
  );
  const editSelect = useModalSelect(
    (s) => {
      if (!s) return modal.open("Edit cancel.");
      switch (s) {
        case "type": {
          editType.open();
          break;
        }
        case "content": {
          editContent.open();
          break;
        }
      }
    },
    {
      title: "Select key",
      label: "Select key",
      defaultValue: "content",
      items: [
        { label: "Type", value: "type" },
        { label: "Content", value: "content" },
      ],
    }
  );
  const editContent = useModalInput(
    (s) => {
      if (!s) return modal.open("Content cannot be empty.");
      edit(item._id, item.type, s);
    },
    {
      title: "Edit block content",
      label: "Content",
      defaultValue: item.content,
      textarea: true,
    }
  );
  const editType = useModalSelect(
    (s) => {
      if (!s) return modal.open("Type cannot be empty.");
      edit(item._id, s, item.content);
    },
    {
      title: "Edit block type",
      label: "Type",
      defaultValue: item.type,
      items: [
        { label: "Text", value: "text" },
        { label: "Markdown", value: "md" },
        { label: "Image", value: "image" },
      ],
    }
  );
  return (
    <>
      {modal.Modal}
      {editSelect.Modal}
      {editType.Modal}
      {editContent.Modal}
      {deleteConfirm.Modal}
      <div className="flex w-full gap-2">
        <div className="flex-1">
          <BlockItem item={item} />
        </div>
        <div className="flex flex-col gap-2">
          <Button isIconOnly variant="flat" size="sm" onPress={editSelect.open}>
            <MdEdit className="text-lg" />
          </Button>
          <Button
            isIconOnly
            variant="flat"
            color="danger"
            size="sm"
            onPress={deleteConfirm.open}
          >
            <MdDelete className="text-lg" />
          </Button>
        </div>
      </div>
    </>
  );
}

export default function CardBlocks() {
  const { sid } = useWK();
  const { id: groupId, name: groupName, headers, updateCards } = useWKPage();
  const {
    id: cardId,
    name: cardName,
    blocks,
    updateBlocks,
    isLoadingBlocks,
  } = useWKCard();
  const modal = useModalMessage("Error", "");
  const [newBlockType, setNewBlockType] = useState<BlockType>("text");
  const [newBlockContent, setNewBlockContent] = useState("");
  const [uploads, setUploads] = useState<symbol[]>([]);
  const contentTxtRef = createRef<HTMLTextAreaElement>();
  const imageInputRef = createRef<HTMLInputElement>();
  const contentSubmitRef = createRef<HTMLButtonElement>();
  const isUploading = [...uploads].length !== 0;

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

  const renameInput = useModalInput(
    (s) => {
      if (!s) return modal.open("Card name cannot be empty.");
      renameCard(cardId, s);
    },
    {
      title: "Rename card",
      label: "Card name",
      defaultValue: cardName,
      textarea: true,
    }
  );

  async function createBlocks(blocks: { type: BlockType; content: string }[]) {
    const symbol = Symbol();
    try {
      setUploads((s) => [...s, symbol]);
      await fetch(API_OP_CARDS_PATH(groupId, cardId), {
        method: "POST",
        headers,
        body: JSON.stringify({ blocks }),
      });
    } finally {
      setUploads((s) => s.filter((i) => i !== symbol));
    }
  }

  function createBlock(type: BlockType, content: string) {
    return createBlocks([{ type, content }]);
  }

  async function uploadFiles(_files?: FileList | null) {
    const files = _files ? [..._files] : [];
    if (!files.length) return;
    Promise.all(
      files.map(async (file) => {
        try {
          if (file.type.startsWith("image/")) {
            const body = await readStream(file.stream());
            const symbol = Symbol();
            setUploads((s) => [...s, symbol]);
            try {
              const res = await fetch(API_IMAGE_PATH, {
                method: "POST",
                headers: {
                  ...headers,
                  "Content-Type": "application/uint8array",
                  Filename: file.name,
                },
                body,
              });
              const { id, filename } = await res.json();
              return ["image", JSON.stringify({ id, filename }, null, 0)] as [
                BlockType,
                string
              ];
            } catch {
              return null;
            } finally {
              setUploads((s) => s.filter((i) => i !== symbol));
            }
          }
          const isMd = file.name.endsWith(".md");
          if (isMd || file.type.startsWith("text/")) {
            const body = await readString(file.stream());
            return [isMd ? "md" : ("text" as BlockType), body] as [
              BlockType,
              string
            ];
          }
          modal.open("File type is not supported.");
          return null;
        } catch {
          return null;
        }
      })
    )
      .then(async (blockArgs) => {
        const blocks = blockArgs.filter((b) => b) as [BlockType, string][];
        const symbol = Symbol();
        setUploads((s) => [...s, symbol]);
        try {
          await createBlocks(
            blocks.map(([type, content]) => ({ type, content }))
          );
        } catch {}
        setUploads((s) => s.filter((i) => i !== symbol));
        return;
      })
      .finally(updateBlocks);
  }

  const deleteBlock = useCallback(
    (_id: string) => {
      fetch(API_OP_BLOCKS_PATH(groupId, cardId, _id), {
        method: "DELETE",
        headers,
      }).finally(updateBlocks);
    },
    [groupId, cardId, headers, updateBlocks]
  );

  const editBlock = useCallback(
    (_id: string, type: string, content: string) => {
      fetch(API_OP_BLOCKS_PATH(groupId, cardId, _id), {
        method: "PUT",
        headers,
        body: JSON.stringify({ type, content }),
      }).finally(updateBlocks);
    },
    [groupId, cardId, headers, updateBlocks]
  );

  return (
    <>
      {modal.Modal}
      {renameInput.Modal}
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
          <Button
            variant="flat"
            size="sm"
            isIconOnly
            onPress={renameInput.open}
          >
            <MdEdit className="text-lg" />
          </Button>
        </div>
        <Spacer y={4} />
        {blocks?.length === 0 ? (
          <div className="opacity-50 select-none flex-center">
            {!sid || isLoadingBlocks ? <Spinner color="current" /> : "no data"}
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          {blocks.map((item, i) => (
            <BlockItemEditor
              key={i}
              item={item}
              del={deleteBlock}
              edit={editBlock}
            />
          ))}
        </div>
        {isUploading ? (
          <>
            <Spacer y={4} />
            <div className="flex-center gap-2 text-default-500 select-none">
              <Spinner color="current" size="sm" />
              <div className="text-center">Uploading...</div>
            </div>
          </>
        ) : null}
        <Spacer y={4} />
        <div className="flex flex-col p-2 rounded-md border-1 border-default-300 gap-2">
          {newBlockType === "image" ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Input
                  variant="flat"
                  className="flex-1"
                  value=""
                  placeholder="Paste here"
                  onPaste={(e) => uploadFiles(e.clipboardData.files)}
                  autoFocus
                />
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  multiple
                  onInput={() => {
                    const el = imageInputRef.current!;
                    uploadFiles(el.files);
                    el.value = "";
                  }}
                  hidden
                />
              </div>
              <div
                className="w-full h-32 bg-default-50 rounded-lg flex-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => (
                  e.preventDefault(), uploadFiles(e.dataTransfer.files)
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
              onPaste={(e) => uploadFiles(e.clipboardData.files)}
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
              onChange={(e) => setNewBlockType(e.target.value as BlockType)}
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
        </div>
        <Spacer y={8} />
      </div>
    </>
  );
}
