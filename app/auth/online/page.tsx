"use client";

import { CONTENT_MAX_W } from "@/constants/asst";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/table";
import { useEffect, useRef, useState } from "react";
import useErrorMessage from "@/hooks/useErrorMessage";
import { IoRefreshOutline } from "react-icons/io5";
import { StatusResponse, UserOnlineState } from "@/constants/types";
import { unpackDataWithHash } from "@cch137/utils/shuttle";
import formatDate from "@cch137/utils/format/date";
import { readStream } from "@cch137/utils/stream";

const defLastMs = 1.5 * 60000;

export default function Online() {
  const [isLoading, setIsLoading] = useState(false);
  const {errorMessageBox, openErrorMessageBox} = useErrorMessage();
  const [userList, setUserList] = useState<UserOnlineState[]>([]);
  const [lastMs, setLastMs] = useState(defLastMs);

  const refresh = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/online', {method: 'POST', body: JSON.stringify({lastMs})});
      const stream = await readStream(res.body);
      try {
        const list = unpackDataWithHash<UserOnlineState[]>(stream, 256, 371117069, 1681681688);
        setUserList(list.sort((a, b) => b.atms - a.atms));
      } catch (e) {
        const {message}: StatusResponse = JSON.parse(new TextDecoder('utf-8').decode(stream));
        throw new Error(message || (e instanceof Error ? e.message : 'Failed to fetch online users.'));
      }
    } catch (e) {
      if (e instanceof Error) openErrorMessageBox(e.message);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }
  
  const inited = useRef(false);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    refresh();
  }, [inited, refresh]);

  return (<>
    {errorMessageBox}
    <div className="max-w-full px-4 py-8 m-auto" style={{width: CONTENT_MAX_W}}>
      <div className="flex items-end mb-4">
        <h1 className="flex-1 text-3xl font-medium">Online Users</h1>
        <div className="flex-center gap-2">
          <Input
            size="sm"
            isDisabled={isLoading}
            color="default"
            variant="underlined"
            type="number"
            classNames={{inputWrapper: 'h-7 w-24', base: 'w-24'}}
            value={`${lastMs}`}
            onChange={(e) => setLastMs(Number(e.target.value) || defLastMs)}
          />
          <Button
            startContent={isLoading ? null : <IoRefreshOutline className="text-lg" />}
            size="sm"
            isLoading={isLoading}
            onClick={refresh}
          >
            <span className="text-sm">Refresh</span>
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>NAME</TableColumn>
          <TableColumn>AUTH</TableColumn>
          <TableColumn>CHECKED AT</TableColumn>
          <TableColumn>CREATED AT</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No Users"}>
          {userList.map((v, i) => (
            <TableRow key={i} className="bg-default-50 hover:brightness-150 transition">
              <TableCell className="rounded-l-lg"><code>{v.id}</code></TableCell>
              <TableCell>{v.name}</TableCell>
              <TableCell>{v.auth}</TableCell>
              <TableCell>{formatDate(new Date(v.atms))}</TableCell>
              <TableCell className="rounded-r-lg">{formatDate(new Date(v.ctms))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </>)
}
