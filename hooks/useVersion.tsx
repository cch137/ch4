'use client';

import store from '@cch137/utils/dev/store';
import { parse } from '@cch137/utils/format/version';
import { useEffect, useState } from 'react';

export const versionStore = store(parse(), async () => {
  try {
    const res = await fetch('/api/version', {method: 'GET'});
    const ver = parse(await res.text());
    return ver;
  } catch {}
}, {
  autoInit: false,
  initAfterOn: true,
});

export const getVersion = () => versionStore.toString();

/** alias for `getVersion`. */
export const vers = getVersion;

export default function useVersion() {
  const [version, setVersion] = useState(vers());
  useEffect(() => versionStore.$on(() => setVersion(vers())), []);
  return version;
};
