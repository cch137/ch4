"use client";

import { UserInfo, UserDetails, StatusResponse } from "@/constants/types";
import { useRef, useState } from "react";
import useInit from "./useInit";
import store from "@cch137/utils/dev/store";

export const userInfoCache = store<UserInfo>({ id: "", name: "", auth: 0 });

let fetchingUserInfo: Promise<any> | null = null;
const fetchUserInfo = async () => {
  const res =
    fetchingUserInfo ||
    (await fetch("/api/auth/user", { method: "POST" })).json();
  if (fetchingUserInfo !== res) fetchingUserInfo = res;
  const { value: user } = (await res) as StatusResponse<UserInfo>;
  fetchingUserInfo = null;
  if (!user) throw new Error("Failed to fetch user info");
  return user;
};

let fetchingUserDetails: Promise<any> | null = null;
const fetchUserDetails = async () => {
  const res =
    fetchingUserDetails ||
    (await fetch("/api/auth/user/details", { method: "POST" })).json();
  if (fetchingUserDetails !== res) fetchingUserDetails = res;
  const { value: user } = (await res) as StatusResponse<UserDetails>;
  fetchingUserDetails = null;
  if (!user) throw new Error("Failed to fetch user details");
  return user;
};

export function useUserInfo() {
  const lastFetched = useRef(0);
  const [user, setUser] = useState<UserInfo | undefined>(
    userInfoCache.auth ? userInfoCache : void 0
  );
  const auth = user?.auth || 0;
  const isLoggedIn = auth > 0;
  const update = async () => {
    lastFetched.current = Date.now();
    const user = await fetchUserInfo();
    setUser(user);
    if (user) userInfoCache.$assign(user);
  };
  useInit(() => {
    update();
  }, [setUser, lastFetched]);
  return {
    ...user,
    auth,
    isLoggedIn,
    update,
    isPending: user === undefined,
  };
}

export default useUserInfo;

export function useUserDetails() {
  const lastFetched = useRef(0);
  const [user, setUser] = useState<UserDetails>();
  const update = async () => {
    lastFetched.current = Date.now();
    setUser((await fetchUserDetails()) || {});
  };
  useInit(() => {
    update();
  }, [setUser, lastFetched]);
  return { ...user, update, isPending: user === undefined };
}

export function useUserProfile() {
  const {
    update: update1,
    isPending: pending1,
    ...user1
  } = useUserInfo() || {};
  const {
    update: update2,
    isPending: pending2,
    ...user2
  } = useUserDetails() || {};
  return {
    ...user1,
    ...user2,
    update() {
      return Promise.all([update1(), update2()]);
    },
    isPending: pending1 || pending2,
  };
}
