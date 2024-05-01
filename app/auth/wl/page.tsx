"use client";

import { Redirect } from "@/app/not-found";
import useTTX from "@/hooks/useTTX";

export default function AuthUnblock() {
  const { ttxRecord } = useTTX();
  return (
    <Redirect
      to={`/`}
      callback={async () =>
        prompt("What is your lucky number") === "cch137"
          ? ttxRecord("wl")
          : null
      }
    />
  );
}
