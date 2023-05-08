/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import '../styles/index.css';
import {siteConfig} from '../siteConfig';
import MyApp from './_app';
import InlineHeadScript from 'components/InlineHeadScript';

const MyDocument = ({children}: {children: React.ReactNode}) => {
  return (
    <html
      lang={siteConfig.languageCode}
      // class="" mismatch expected due to theme and platform-*
      suppressHydrationWarning>
      <head />
      <body className="font-text font-medium antialiased text-lg bg-wash dark:bg-wash-dark text-secondary dark:text-secondary-dark leading-base">
        <InlineHeadScript />
        <MyApp>{children}</MyApp>
      </body>
    </html>
  );
};

export default MyDocument;
