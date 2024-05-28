"use client";

import { useCallback } from "react";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { Spacer } from "@nextui-org/spacer";
import { Switch } from "@nextui-org/switch";
import Link from "next/link";
import { IoAdd, IoPencil, IoReload, IoTrashOutline } from "react-icons/io5";

import {
  API_LISTS_PATH,
  API_OP_GROUPS_PATH,
  WAKAWAKA_APPNAME,
  WAKAWAKA_GROUP,
} from "@/app/apps/wakawaka/constants";
import useModalInput from "@/components/modals/input";
import useModalMessage from "@/components/modals/message";
import { useWK, type WKGroup } from "./provider";
import formatDate from "@cch137/utils/str/date";

function GroupItem({
  item,
  del,
  rename,
  enable,
  activate,
}: {
  item: WKGroup;
  del: (_id: string) => void;
  rename: (_id: string, name: string) => void;
  enable: (_id: string, enabled: boolean) => void;
  activate: (_id: string) => void;
}) {
  const modal = useModalMessage();
  const deleteConfirm = useModalInput(
    (s) => {
      if (s !== item.name)
        return modal.open("Deletion canceled: Verification failed");
      del(item._id);
    },
    {
      title: "Delete group",
      message: `Type the group name "${item.name}" below to confirm deletion.`,
      label: "Group name",
    }
  );
  const renameInput = useModalInput(
    (s) => {
      if (!s) return modal.open("Group name cannot be empty.");
      rename(item._id, s);
    },
    {
      title: "Rename group",
      label: "Group name",
      defaultValue: item.name,
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
        <Link href={WAKAWAKA_GROUP(item._id)} className="flex-1 py-3 pl-4">
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
            <IoReload className="text-lg" />
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

export default function Wakawaka() {
  const { groups, updateGroups, isLoadingGroups, sid, updateSid, headers } =
    useWK();

  const groupNameInput = useModalInput(
    (name) => {
      fetch(API_LISTS_PATH, {
        method: "POST",
        headers,
        body: JSON.stringify({ name }),
      }).finally(updateGroups);
    },
    { title: "Add a group", label: "Group name" }
  );

  const deleteGroup = useCallback(
    (_id: string) => {
      fetch(API_OP_GROUPS_PATH(_id), {
        method: "DELETE",
        headers,
      }).finally(updateGroups);
    },
    [headers, updateGroups]
  );

  const renameGroup = useCallback(
    (_id: string, name: string) => {
      fetch(API_OP_GROUPS_PATH(_id), {
        method: "PUT",
        body: JSON.stringify({ name }),
        headers,
      }).finally(updateGroups);
    },
    [headers, updateGroups]
  );

  const enableGroup = useCallback(
    (_id: string, enabled: boolean) => {
      fetch(API_OP_GROUPS_PATH(_id), {
        method: "PUT",
        body: JSON.stringify({ enabled }),
        headers,
      }).finally(updateGroups);
    },
    [headers, updateGroups]
  );

  const activateGroup = useCallback(
    (_id: string) => {
      fetch(API_OP_GROUPS_PATH(_id), {
        method: "PUT",
        body: JSON.stringify({ enabled: true, expire: new Date() }),
        headers,
      }).finally(updateGroups);
    },
    [headers, updateGroups]
  );

  return (
    <>
      {groupNameInput.Modal}
      <div className="max-w-screen-md m-auto">
        <div className="flex">
          <h1 className="font-bold text-2xl flex-1">
            Welcome to {WAKAWAKA_APPNAME}!
          </h1>
          <Button variant="light" size="sm" isIconOnly onPress={updateSid}>
            <IoReload className="text-lg text-default-300" />
          </Button>
        </div>
        <Spacer y={4} />
        <div className="flex gap-2">
          <div className="flex-1" />
          <Button
            variant="flat"
            size="sm"
            startContent={<IoAdd className="text-lg" />}
            onPress={groupNameInput.open}
          >
            Add a group
          </Button>
        </div>
        <Spacer y={4} />
        {!sid || groups?.length === 0 ? (
          <div className="opacity-50 select-none flex-center">
            {isLoadingGroups ? <Spinner color="current" /> : "no data"}
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          {groups
            .sort((a, b) => (a.name > b.name ? 1 : -1))
            .map((item, i) => (
              <GroupItem
                key={i}
                item={item}
                del={deleteGroup}
                rename={renameGroup}
                enable={enableGroup}
                activate={activateGroup}
              />
            ))}
        </div>
      </div>
    </>
  );
}
