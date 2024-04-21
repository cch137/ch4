"use client";

import { UserInfo, UserDetails, StatusResponse } from "@/constants/types";
import { useEffect, useRef, useState } from "react";
import useInit from "./useInit";
import store from "@cch137/utils/dev/store";

const userInfoAge = 60000;
const userInfoLastFetched = store({ t: 0 });
export const userInfoCache = store<UserInfo>({ id: "", name: "", auth: 0 });

const fetchUserInfo = async (force = false) => {
  if (!force && Date.now() - userInfoLastFetched.t < userInfoAge)
    return userInfoCache.$object;
  const res = await (await fetch("/api/auth/user", { method: "POST" })).json();
  const { value: user } = res as StatusResponse<UserInfo>;
  if (!user) throw new Error("Failed to fetch user info");
  userInfoLastFetched.t = Date.now();
  userInfoCache.$assign(user);
  return user;
};

let fetchingUserDetails: Promise<any> | null = null;
const fetchUserDetails = async () => {
  const res =
    fetchingUserDetails ||
    (await fetch("/api/auth/user/details", { method: "POST" })).json();
  if (fetchingUserDetails !== res) fetchingUserDetails = res;
  const { value: user = {} } = (await res) as StatusResponse<UserDetails>;
  fetchingUserDetails = null;
  return user;
};

export function useUserInfo() {
  const [user, setUser] = useState<UserInfo | undefined>(
    userInfoCache.auth ? userInfoCache : void 0
  );
  const auth = user?.auth || 0;
  const isLoggedIn = auth > 0;
  const update = async () => {
    setUser(await fetchUserInfo(true));
  };
  useInit(() => {
    fetchUserInfo().then(setUser);
  }, [setUser]);
  useEffect(() => userInfoCache.$on(setUser), []);
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
  const [user, setUser] = useState<UserDetails>();
  const update = async () => {
    setUser((await fetchUserDetails()) || {});
  };
  useInit(() => {
    update();
  }, [setUser]);
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
