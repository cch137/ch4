'use client';

import { UserInfo, StatusResponse } from '@/constants/types';
import store from '@cch137/utils/dev/store';
import { useEffect, useState } from 'react';

export const userInfoStore = store({
  id: '',
  name: '',
  auth: 0,
} as UserInfo, async () => {
  try {
    const res = await fetch('/api/auth/user', {method: 'POST'});
    return (await res.json() as StatusResponse<UserInfo>)?.value || {};
  } catch {}
}, {
  autoInit: false,
  updateInterval: 60 * 1000,
});

export default function useUserInfo() {
  const [userInfo, setUserInfo] = useState(userInfoStore.$object);
  useEffect(() => {
    userInfo.$init();
    return userInfoStore.$on(setUserInfo);
  }, []);
  return userInfo;
};
