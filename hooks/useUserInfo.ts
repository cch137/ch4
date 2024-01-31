'use client';

import { UserInfo, UserDetails, StatusResponse } from '@/constants/types';
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
  initAfterOn: true,
  updateInterval: 60 * 1000,
});

export const userDetailsStore = store({} as UserDetails, async () => {
  try {
    const res = await fetch('/api/auth/user/details', {method: 'POST'});
    return (await res.json() as StatusResponse<UserDetails>)?.value || {};
  } catch {}
}, {
  autoInit: false,
  initAfterOn: true,
});

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState(userInfoStore.$object);
  useEffect(() => userInfoStore.$on(setUserInfo), []);
  return userInfo;
};

export default useUserInfo;

export const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState(userDetailsStore.$object);
  useEffect(() => userDetailsStore.$on(setUserDetails), []);
  return userDetails;
};

export const useUserProfile = () => {
  const {id, name, auth} = useUserInfo();
  const {eadd, ctms, mtms, atms} = useUserDetails();

  return {
    id, name, auth,
    eadd, ctms, mtms, atms,
    $init: async () => {
      const [a, b] = await Promise.all([userInfoStore.$init(), userDetailsStore.$init()]);
      return {...b, ...a};
    },
    $update: async () => {
      const [a, b] = await Promise.all([userInfoStore.$update(), userDetailsStore.$update()]);
      return {...b, ...a};
    },
    $inited: userInfoStore.$inited || userDetailsStore.$inited,
    $updating: userInfoStore.$updating || userDetailsStore.$updating,
    $initing: userInfoStore.$initing || userDetailsStore.$initing,
  };
};
