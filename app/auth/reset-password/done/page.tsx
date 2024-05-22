"use client";

import { Button } from "@nextui-org/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function _ResetPasswordDone() {
  const color = "secondary";
  const search = useSearchParams();
  const next = search.get("next");
  return (
    <>
      <div
        className="w-full flex-center absolute left-0"
        style={{ height: "calc(100% - 4rem)" }}
      >
        <div className="w-80 max-w-full flex flex-col gap-4">
          <h1 className="text-4xl text-center font-bold text-default-600">
            Reset Password Successful!
          </h1>
          <div></div>
          <Button color={color} href={next || "/"} className="mx-12" as={Link}>
            Continue
          </Button>
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordDone() {
  return (
    <Suspense>
      <_ResetPasswordDone />
    </Suspense>
  );
}
