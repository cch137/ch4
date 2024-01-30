"use client"

import useAdmin, { adminErrorBroadcaster, adminStore, handleAdminError, loginAdmin, setAdminItem, updateConfig } from "@/hooks/useAdmin"
import useErrorMessage from "@/hooks/useErrorMessage";
import Broadcaster from "@cch137/utils/dev/broadcaster";
import { Button } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";
import { useCallback, useEffect, useRef, useState } from "react";

const resetBroadcaster = new Broadcaster<void>('admin-reset');

function AdminLogin() {
  const [pw, setPw] = useState('');
  const [ld, setLd] = useState(false);
  return (<>
    <div className="flex flex-col gap-8 p-16 max-w-96 m-auto">
      <Input
        type="password"
        size="lg"
        variant="bordered"
        color="primary"
        onChange={(e) => setPw(e.target.value)}
        isDisabled={ld}
      />
      <div className="flex-center">
        <Button
          color="primary"
          onClick={async () => {
            try {
              setLd(true);
              await loginAdmin(pw);
            } finally {
              setLd(false);
            }
          }}
          isLoading={ld}
        >
          Log In
        </Button>
      </div>
    </div>
  </>)
}

function AdminItemInput<K extends string, V = any>({name, value, isDisabled}: {name: K, value: V, isDisabled?: boolean}) {
  const initStringifyValue = JSON.stringify(adminStore.config.find(i => i[0] === name)![1]);
  const initType = typeof value;

  const [isLoading, setIsLoading] = useState(false);
  const [v, setV] = useState(initStringifyValue);
  const isChanged = v !== initStringifyValue;

  const [dangerMessage, setDangerMessage] = useState('');
  const [warnMessage, setWarnMessage] = useState('');
  const isWarn = Boolean(warnMessage);
  const isDanger = Boolean(dangerMessage);
  const [isSuccess, setIsSuccess] = useState(false);
  const successTimeout = useRef<NodeJS.Timeout>();

  const checkValue = useCallback((s: string) => {
    try {
      const currType = typeof JSON.parse(s);
      setWarnMessage(currType === initType
        ? ''
        : `TypeWaring: "${name}" changed from \`${initType}\` to \`${currType}\`.`
      );
      setDangerMessage('');
    } catch (e) {
      setDangerMessage(e instanceof Error ? e.message : 'Oops! Something went wrong.');
      setWarnMessage('');
    }
    return s;
  }, [setDangerMessage, setWarnMessage, initType, name]);

  const resetValue = useCallback(() => setV(checkValue(initStringifyValue)), [setV, initStringifyValue, checkValue]);
  useEffect(() => resetBroadcaster.subscribe(resetValue), [resetValue]);

  return (<div>
    <div className="text-xl font-bold">{name}</div>
    {warnMessage ? <div className="text-sm text-warning-400">{warnMessage}</div> : null}
    {dangerMessage ? <div className="text-sm text-danger-400">{dangerMessage}</div> : null}
    <div className="flex gap-4 mt-2">
      <Textarea
        isDisabled={isLoading || isDisabled}
        minRows={1}
        size="sm"
        variant={(isDanger || isWarn) ? "flat" : "bordered"}
        color={isDanger ? 'danger' : isWarn ? 'warning' : 'primary'}
        value={v}
        onChange={(e) => setV(checkValue(e.target.value))}
        defaultValue={initStringifyValue}
      />
      <Button
        color={isDanger ? 'danger' : isChanged ? 'primary' : isSuccess ? 'success' : 'default'}
        isLoading={isLoading}
        isDisabled={isDanger || isDisabled}
        variant={isDanger ? 'flat' : isChanged ? 'shadow' : isSuccess ? 'faded' : 'solid'}
        onClick={async () => {
          try {
            setIsLoading(true);
            await setAdminItem(name, JSON.parse(v));
            setWarnMessage('');
            setDangerMessage('');
            setIsSuccess(true);
            clearTimeout(successTimeout.current);
            successTimeout.current = setTimeout(() => setIsSuccess(false), 1500);
          } catch(e) {
            handleAdminError(e);
          } finally {
            setIsLoading(false);
          }
        }}
      >
        {isSuccess ? 'Saved' : 'Save'}
      </Button>
    </div>
  </div>)
}

export default function Admin() {
  const admin = useAdmin();
  const { errorMessageBox, openErrorMessageBox } = useErrorMessage();

  useEffect(() => {
    return adminErrorBroadcaster
      .subscribe(({data: {message, title}}) => openErrorMessageBox(message, title));
  }, [openErrorMessageBox]);

  return (<>
    {errorMessageBox}
    {!admin.isLoggedIn ? <AdminLogin /> : <>
      <div className="flex flex-col gap-4 p-8 pb-32 m-auto" style={{maxWidth: 680}}>
        <div className="flex mb-4">
          <Button
            isLoading={admin.isUpdating}
            onClick={async () => {
              resetBroadcaster.broadcast();
              await updateConfig();
            }}>
            Refresh
          </Button>
        </div>
        {admin.config.map(([k, v]) => <AdminItemInput name={k} value={v} isDisabled={admin.isUpdating} key={k} />)}        
      </div>
    </>}
  </>)
}
