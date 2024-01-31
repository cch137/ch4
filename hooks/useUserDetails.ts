'use client';

import { UserDetails, StatusResponse } from '@/constants/types';
import store from '@cch137/utils/dev/store';
import { useEffect, useState } from 'react';

export const userDetailsStore = store({} as UserDetails, async () => {
  try {
    const res = await fetch('/api/auth/user/details', {method: 'POST'});
    return (await res.json() as StatusResponse<UserDetails>)?.value || {};
  } catch {}
}, {
  autoInit: false,
  initAfterOn: true,
  updateInterval: 60 * 1000,
});

export default function useUserDetails() {
  const [userDetails, setUserDetails] = useState(userDetailsStore.$object);
  useEffect(() => userDetailsStore.$on(setUserDetails), []);
  return userDetails;
};
