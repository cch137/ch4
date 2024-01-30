'use client';

import Broadcaster from '@cch137/utils/dev/broadcaster';
import store from '@cch137/utils/dev/store';
import { packDataWithHash } from '@cch137/utils/shuttle';
import { useEffect, useState } from 'react';

export const adminErrorBroadcaster = new Broadcaster<{message: string, title?: string}>('admin-error');

export const handleAdminError = (e: any): void => {
  if (e instanceof Error) return handleAdminError(e.message);
  if (typeof e !== 'string') return (console.error(e), handleAdminError('Unknown error: check console'));
  adminErrorBroadcaster.broadcast({ message: e });
}

export const admin = store({
  isUpdating: false,
  isLoggedIn: false,
  a: '',
  config: [] as [string, any][],
}, async () => {
  try {
    updateConfig();
  } catch {}
});

export {
  admin as adminStore
};

const _getPw = (): string => admin.a;

export async function fetchWithAdmin(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = {...init.headers, a: packDataWithHash(_getPw(), 256, 407717888, 137).toBase64()};
  return fetch(input, {...init, headers});
}

export async function loginAdmin(a: string) {
  admin.a = a;
  const res = await fetchWithAdmin('/api/admin/login', {method: 'POST'});
  const isLoggedIn: boolean = await res.json();
  admin.isLoggedIn = isLoggedIn;
  if (isLoggedIn) await updateConfig();
}

export async function updateConfig() {
  try {
    admin.isUpdating = true;
    const res = await fetchWithAdmin('/api/admin/config', {method: 'POST'});
    if (res.status !== 200) {
      const status = await res.json();
      throw new Error(status?.message || `Unknown error: ${JSON.stringify(status)}`);
    }
    const config: [string, any][] = await res.json();
    admin.config = config;
  } catch (e) {
    handleAdminError(e);
  }
  admin.isUpdating = false;
}

export async function setAdminItem(name: string, value: any) {
  const res = await fetchWithAdmin('/api/admin/config', {method: 'PUT', body: JSON.stringify({name, value})});
  const newValue = await res.json();
  if (name === 'admin-password') admin.a = newValue;
  admin.config = admin.config.map((i) => i[0] === name ? [name, newValue] : i);
}

export default function useAdmin() {
  const [_admin, _setAdmin] = useState(admin.$object);
  useEffect(() => admin.$on(_setAdmin), []);
  return _admin;
};
