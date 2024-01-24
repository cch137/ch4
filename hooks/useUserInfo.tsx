'use client';

import { UserInfo, StatusResponse } from '@/constants/types';
import store from '@cch137/utils/dev/store';
import type { StoreType } from '@cch137/utils/dev/store';
import { useEffect, useState } from 'react';

type UserInfoUpdatable = UserInfo & {
  readonly initing: boolean;
  readonly inited: boolean;
  readonly update: () => Promise<UserInfoUpdatable>;
  readonly init: () => Promise<UserInfoUpdatable>;
}

const userInfoStore: StoreType<UserInfoUpdatable> = store<UserInfoUpdatable>({
  initing: false,
  inited: false,
  id: '',
  name: '',
  auth: 0,
  async update() {
    try {
      userInfoStore.$assign({initing: true});
      const res = await fetch('/api/auth/user');
      const data = (await res.json() as StatusResponse<UserInfo>)?.value;
      userInfoStore.$assign({id: '', name: '', auth: 0, ...data, initing: false, inited: true});
    } catch {}
    return userInfoStore;
  },
  async init() {
    if (!userInfoStore.inited && !userInfoStore.initing) await userInfoStore.update();
    return userInfoStore;
  },
});

export { userInfoStore }

export default function useUserInfo() {
  const [userInfo, setUserInfo] = useState(userInfoStore.$object);

  useEffect(() => {
    userInfoStore.init();
    return userInfoStore.$on(setUserInfo);
  }, []);

  return userInfo;
};
