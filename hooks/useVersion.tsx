'use client';

import store from '@cch137/utils/dev/store';
import { parse } from '@cch137/utils/format/version';
import { useEffect, useState } from 'react';

export const versionStore = store(parse(), async () => {
  try {
    const res = await fetch('/api/version', {method: 'GET'});
    return parse(await res.text());
  } catch {}
});

export default function useVersion() {
  const [version, setVersion] = useState(versionStore.toString());
  useEffect(() => versionStore.$on((v) => setVersion(v.toString())), []);
  return version;
};
