"use client";

import NotFound from "@/app/not-found";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function _Redirecting() {
  const search = useSearchParams();
  const to = search.get("to");
  const url = `https://cch137.link${to || ""}`;
  const router = useRouter();

  useEffect(() => {
    if (!to) location.href = "/";
  }, [router, to]);

  return <NotFound redirectTo={url} />;
}

export default function Redirecting() {
  return (
    <Suspense>
      <_Redirecting />
    </Suspense>
  );
}
