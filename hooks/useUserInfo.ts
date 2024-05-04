"use client";

import type { UserDetails, StatusResponse } from "@/constants/types";
import useAppDataManager from "./useAppDataManager";
import useFetch from "./useFetch";

export function useUserInfo() {
  const user = useAppDataManager().user;
  userIdCache.id = user.id;
  return user;
}

export default useUserInfo;

export function useUserDetails() {
  const {
    data,
    isPending,
    refresh: update,
  } = useFetch<StatusResponse<UserDetails>>("/api/auth/user/details", {
    method: "POST",
  });
  return { ...data?.value, update, isPending };
}

// this object is used to fix useAiChat bug :)
import store from "@cch137/utils/dev/store";
export const userIdCache = store<{ id: string }>({ id: "" });
