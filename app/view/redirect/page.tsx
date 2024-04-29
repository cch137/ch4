"use client";

import NotFound from "@/app/not-found";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Redirecting() {
  const to = useSearchParams().get("to");
  const url = `https://cch137.link${to || ""}`;
  const router = useRouter();

  useEffect(() => {
    if (!to) location.href = "/";
  }, [router, to]);

  return <NotFound redirectTo={url} />;
}
