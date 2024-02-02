"use client";

import { AIASST_DESC_LINES, AIASST_PATH, AIASST_TRIGGERS_PATH, CONTENT_MAX_W } from "@/constants/asst";
import useAiTriggers, { createTrigger, triggersErrorBroadcaster, triggersStore } from "@/hooks/useAiTriggers";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { Spacer } from "@nextui-org/spacer";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/table";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoAddOutline, IoRefreshOutline } from "react-icons/io5";
import useErrorMessage from "@/hooks/useErrorMessage";
import useUserInfo from "@/hooks/useUserInfo";
import FullpageSpinner from "@/app/components/fullpage-spiner";
import SigninToContinue from "@/app/components/signin-to-continue";

function TriggerList() {
  const router = useRouter();
  const {triggers} = useAiTriggers();
  const [isLoading, setIsLoading] = useState(true);

  const inited = useRef(false);
  useEffect(() => {
    if (!inited.current) {
      inited.current = true;
      (async () => {
        await triggersStore.$init();
        setIsLoading(false);
      })();
    };
  }, []);

  return (
    isLoading ? <div className="flex-center py-8"><Spinner size="lg" color="secondary" /></div> :
    <Table>
      <TableHeader>
        <TableColumn>NAME</TableColumn>
        <TableColumn>ENABLED</TableColumn>
        <TableColumn>INTERVAL</TableColumn>
      </TableHeader>
      <TableBody emptyContent={"No triggers"}>
        {triggers.map((v, i) => (
          <TableRow key={i} onClick={() => router.push(`${AIASST_TRIGGERS_PATH}${v._id}`)} className="cursor-pointer bg-default-50 hover:brightness-150 transition">
            <TableCell className="rounded-l-lg">{v.name}</TableCell>
            <TableCell>{v.enbl ? 'ON' : 'OFF'}</TableCell>
            <TableCell className="rounded-r-lg">{v.intv}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function AiAsst() {
  const router = useRouter();
  const [startDate, setStartDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const {errorMessageBox, openErrorMessageBox} = useErrorMessage();
  
  useEffect(() => {
    return triggersErrorBroadcaster.subscribe(({data: {message, title}}) => openErrorMessageBox(message, title));
  }, [openErrorMessageBox]);

  const userInfo = useUserInfo();

  return (<>
    {errorMessageBox}
    {!userInfo.$inited
      ? <FullpageSpinner />
      : (userInfo.auth > 0 ? <>
        <div className="max-w-full px-4 py-8 m-auto" style={{width: CONTENT_MAX_W}}>
          <div className="flex items-end">
            <h1 className="flex-1 text-3xl font-medium">My Triggers</h1>
            <div className="flex-center gap-2">
              <Button
                startContent={isLoading ? null : <IoRefreshOutline className="text-lg" />}
                size="sm"
                isLoading={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  await triggersStore.$update();
                  setIsLoading(false);
                }}
              >
                <span className="text-sm">Refresh</span>
              </Button>
              <Button
                startContent={isLoading ? null : <IoAddOutline className="text-lg" />}
                size="sm"
                isLoading={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  const id = await createTrigger();
                  if (id) router.push(`${AIASST_TRIGGERS_PATH}${id}`);
                  setIsLoading(false);
                }}
              >
                <span className="text-sm">New</span>
              </Button>
            </div>
          </div>
          <Spacer y={4} />
          <TriggerList />
        </div>
      </> : <SigninToContinue nextPath={AIASST_PATH} title="AI Assistant" descriptions={AIASST_DESC_LINES} />)}
  </>)
}
