'use client';

import { UserInfo, StatusResponse } from '@/constants/types';
import store from '@cch137/utils/dev/store';

type UserInfoUpdatable = UserInfo & {
  readonly initing: boolean;
  readonly inited: boolean;
  readonly update: () => Promise<void>;
  readonly init: () => void;
}

const userInfo = store<UserInfoUpdatable>({
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
  },
  init() {
    if (!userInfo.inited && !userInfo.initing) userInfo.update();
  },
});

export default userInfo;
