/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */
'use client';

import {useEffect} from 'react';
import {ga} from '../utils/analytics';

import '@docsearch/css';
import '../styles/algolia.css';
import '../styles/index.css';
import '../styles/sandpack.css';

if (typeof window !== 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    ga('create', process.env.NEXT_PUBLIC_GA_TRACKING_ID, 'auto');
    ga('send', 'pageview');
  }
  const terminationEvent = 'onpagehide' in window ? 'pagehide' : 'unload';
  window.addEventListener(terminationEvent, function () {
    ga('send', 'timing', 'JS Dependencies', 'unload');
  });
}

export default function MyApp({children}: {children: React.ReactNode}) {
  useEffect(() => {
    // Taken from StackOverflow. Trying to detect both Safari desktop and mobile.
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      // This is kind of a lie.
      // We still rely on the manual Next.js scrollRestoration logic.
      // However, we *also* don't want Safari grey screen during the back swipe gesture.
      // Seems like it doesn't hurt to enable auto restore *and* Next.js logic at the same time.
      history.scrollRestoration = 'auto';
    } else {
      // For other browsers, let Next.js set scrollRestoration to 'manual'.
      // It seems to work better for Chrome and Firefox which don't animate the back swipe.
    }
  }, []);

  useEffect(() => {
    // If only we had router events. But patching pushState is what Vercel Analytics does.
    // https://va.vercel-scripts.com/v1/script.debug.js
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      const oldCleanedUrl = window.location.href.split(/[\?\#]/)[0];
      originalPushState.apply(history, args);
      const newCleanedUrl = window.location.href.split(/[\?\#]/)[0];
      if (oldCleanedUrl !== newCleanedUrl) {
        ga('set', 'page', newCleanedUrl);
        ga('send', 'pageview');
      }
    };
    return () => {
      history.pushState = originalPushState;
    };
  }, []);

  // Not really but let's pretend
  return children as React.ReactElement;
}
