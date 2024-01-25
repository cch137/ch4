'use client';

import { UserInfo, StatusResponse } from '@/constants/types';
import store from '@cch137/utils/dev/store';
import type { StoreType } from '@cch137/utils/dev/store';
import { useEffect, useState } from 'react';

type UserInfoUpdatable = UserInfo & {
  _timeout?: NodeJS.Timeout;
  readonly initing: boolean;
  readonly inited: boolean;
  readonly update: () => Promise<UserInfoUpdatable>;
  readonly init: () => Promise<UserInfoUpdatable>;
}

export const userInfoStore: StoreType<UserInfoUpdatable> = store({
  initing: false,
  inited: false,
  id: '',
  name: '',
  auth: 0,
  async update() {
    clearTimeout(userInfoStore._timeout);
    try {
      const res = await fetch('/api/auth/user/', {method: 'POST'});
      const data = (await res.json() as StatusResponse<UserInfo>)?.value;
      userInfoStore.$assign({id: '', name: '', auth: 0, ...data, initing: false, inited: true});
    } catch {}
    userInfoStore._timeout = setTimeout(() => userInfoStore.update(), 60 * 1000);
    return userInfoStore;
  },
  async init() {
    if (!userInfoStore.inited && !userInfoStore.initing) {
      userInfoStore.$assign({initing: true});
      await userInfoStore.update();
    }
    return userInfoStore;
  },
});

export default function useUserInfo() {
  const [userInfo, setUserInfo] = useState(userInfoStore.$object);

  useEffect(() => {
    userInfoStore.init();
    return userInfoStore.$on(setUserInfo);
  }, []);

  return userInfo;
};
