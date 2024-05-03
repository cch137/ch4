"use client";

import { UserInfo, UserDetails, StatusResponse } from "@/constants/types";
import useAppDataManager from "./useAppDataManager";
import { useFetchJSON } from "./useFetch";

export function useUserInfo() {
  const { user } = useAppDataManager();
  userInfoCache.$assign({ id: user.id, name: user.name, auth: user.auth });
  return user;
}

export default useUserInfo;

export function useUserDetails() {
  const {
    data,
    isPending,
    refresh: update,
  } = useFetchJSON<StatusResponse<UserDetails>>("/api/auth/user/details", {
    method: "POST",
  });
  return { ...data?.value, update, isPending };
}

// this object is used to fix useAiChat bug :)
import store from "@cch137/utils/dev/store";
export const userInfoCache = store<UserInfo>({ id: "", name: "", auth: 0 });
