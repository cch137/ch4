"use client";

import { Spinner } from "@nextui-org/spinner";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function FullpageSpinner({
  label,
  redirectTo,
  delay,
  show: _show = true,
  callback,
  color = "current",
}: {
  label?: string;
  redirectTo?: string;
  delay?: number;
  show?: boolean;
  callback?: Function;
  color?:
    | "secondary"
    | "current"
    | "white"
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | undefined;
}) {
  const router = useRouter();

  const [show, setShow] = useState(true);
  const inited = useRef(false);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    (async () => {
      const delayPromise =
        delay !== undefined && typeof delay === "number"
          ? new Promise<void>((resolve) => setTimeout(() => resolve(), delay))
          : null;
      if (callback) await callback();
      await delayPromise;
      if (redirectTo) {
        if (/^(https?:\/\/)/.test(redirectTo)) location.href = redirectTo;
        else router.replace(redirectTo);
        return;
      }
      setShow(false);
    })();
  }, [router, redirectTo, delay, callback]);

  return (
    <>
      {show && _show ? (
        <div
          className="w-screen h-screen bg-black fixed left-0 top-0 flex-center flex-col"
          style={{ zIndex: 999999 }}
        >
          <Spinner size="lg" color={color} style={{ scale: 2 }} />
          <div className="mt-10 text-default-600">{label}</div>
        </div>
      ) : null}
    </>
  );
}
