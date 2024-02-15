"use client";

import { useRouter } from "next/navigation";
import useUserInfo from "./useUserInfo";

export default function useNCU() {
  const router = useRouter();
  const user = useUserInfo();
  const isAuthorized = !(user.$inited && user.auth < 2);
  if (!isAuthorized) return router.replace("/");
  return { ok: 1 };
}
