"use client";

import { UserInfo, UserDetails, StatusResponse } from "@/constants/types";
import { useState, useMemo } from "react";
import useInit from "./useInit";
import useAppData from "./useAppData";
import { useFetchJSON } from "./useFetch";

const fetchUserInfo = async () => {
  const res = await (await fetch("/api/auth/user", { method: "POST" })).json();
  const { value: user } = res as StatusResponse<UserInfo>;
  if (!user) throw new Error("Failed to fetch user info");
  return user;
};

export function useUserInfo() {
  const {
    appData: { user },
    setAppData,
  } = useAppData();
  const [isPending, setIsPending] = useState(false);
  return useMemo(() => {
    return {
      get id() {
        return user.id;
      },
      get name() {
        return user.name;
      },
      get auth() {
        return user.auth;
      },
      get isLoggedIn() {
        return user.auth > 0;
      },
      isPending,
      async update() {
        setIsPending(true);
        try {
          const user = await fetchUserInfo();
          setAppData((_) => ({ ..._, user }));
        } finally {
          setIsPending(false);
        }
      },
    };
  }, [user, setAppData]);
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
