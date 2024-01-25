'use client';

import store, { StoreType } from '@cch137/utils/dev/store';
import { parse, serialize, type Version } from '@cch137/utils/format/version';
import { useEffect, useState } from 'react';

type VersionUpdatable = Version & {
  readonly inited: boolean;
  readonly update: () => Promise<VersionUpdatable>;
  readonly init: () => Promise<VersionUpdatable>;
  readonly toString: () => string;
}

export const versionStore: StoreType<VersionUpdatable> = store({
  inited: false,
  details: [],
  async update() {
    try {
      const res = await fetch('/api/version', {method: 'GET'});
      versionStore.$assign({...parse(await res.text()), inited: true});
    } catch {}
    return versionStore;
  },
  async init() {
    if (!versionStore.inited) await versionStore.update();
    return versionStore;
  },
  toString() {
    const v = versionStore;
    if (!v.major && !v.minor && !v.patch) return '';
    return serialize(v.major, v.minor, v.patch, ...v.details);
  }
});

export default function useVersion() {
  const [version, setVersion] = useState(versionStore.toString());

  useEffect(() => {
    versionStore.init();
    return versionStore.$on((v) => setVersion(v.toString()));
  }, []);

  return version;
};
