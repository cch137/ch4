'use client';

import { UserInfo, StatusResponse } from '@/constants/types';
import store from '@cch137/utils/dev/store';
import type { StoreType } from '@cch137/utils/dev/store';

type UserInfoUpdatable = UserInfo & {
  readonly initing: boolean;
  readonly inited: boolean;
  readonly update: () => Promise<UserInfoUpdatable>;
  readonly init: () => Promise<UserInfoUpdatable>;
}

const userInfo: StoreType<UserInfoUpdatable> = store<UserInfoUpdatable>({
  initing: false,
  inited: false,
  id: '',
  name: '',
  auth: 0,
  async update() {
    try {
      userInfo.$assign({initing: true});
      const res = await fetch('/api/auth/user');
      const data = (await res.json() as StatusResponse<UserInfo>)?.value;
      userInfo.$assign({id: '', name: '', auth: 0, ...data, initing: false, inited: true});
    } catch {}
    return userInfo;
  },
  async init() {
    if (!userInfo.inited && !userInfo.initing) await userInfo.update();
    return userInfo;
  },
});

export default userInfo;
