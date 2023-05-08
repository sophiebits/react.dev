/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */
'use client';
import {useSyncExternalStore} from 'react';

function subscribeToHash(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => {
    window.removeEventListener('hashchange', cb);
  };
}
export function useHash() {
  return useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash,
    () => ''
  );
}
