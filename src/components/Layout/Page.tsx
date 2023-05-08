/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import {Suspense} from 'react';
import * as React from 'react';
import {SidebarNav} from './SidebarNav';
import {PageFooter} from './Footer';
import {Toc} from './Toc';
import SocialBanner from '../SocialBanner';
import {DocsPageFooter} from 'components/DocsFooter';
import {Seo} from 'components/Seo';
import PageHeading from 'components/PageHeading';
import {getRouteMeta} from './getRouteMeta';
import {TocContextProvider} from '../MDX/TocContext';
import type {TocItem} from 'components/MDX/TocContext';
import type {RouteItem} from 'components/Layout/getRouteMeta';
import {HomeContent} from './HomeContent';
import {TopNav} from './TopNav';
import cn from 'classnames';

import(/* webpackPrefetch: true */ '../MDX/CodeBlock/CodeBlock');

interface PageProps {
  path: string;
  children: React.ReactNode;
  toc: Array<TocItem>;
  routeTree: RouteItem;
  clientRouteTree: RouteItem; // client reference
  meta: {title?: string; description?: string};
  section: 'learn' | 'reference' | 'community' | 'blog' | 'home' | 'unknown';
}

export function Page({
  path,
  children,
  toc,
  routeTree,
  clientRouteTree,
  meta,
  section,
}: PageProps) {
  const cleanedPath = path.split(/[\?\#]/)[0];
  const {route, nextRoute, prevRoute, breadcrumbs, order} = getRouteMeta(
    cleanedPath,
    routeTree
  );
  const title = meta.title || route?.title || '';
  const description = meta.description || route?.description || '';
  const isHomePage = cleanedPath === '/';
  const isBlogIndex = cleanedPath === '/blog';

  let content;
  if (isHomePage) {
    content = <HomeContent />;
  } else {
    content = (
      <div className="pl-0">
        <div
          className={cn(
            section === 'blog' && 'mx-auto px-0 lg:px-4 max-w-5xl'
          )}>
          <PageHeading
            title={title}
            description={description}
            tags={route?.tags}
            breadcrumbs={breadcrumbs}
          />
        </div>
        <div className="px-5 sm:px-12">
          <div
            className={cn(
              'max-w-7xl mx-auto',
              section === 'blog' && 'lg:flex lg:flex-col lg:items-center'
            )}>
            <TocContextProvider value={toc}>{children}</TocContextProvider>
          </div>
          {!isBlogIndex && (
            <DocsPageFooter
              route={route}
              nextRoute={nextRoute}
              prevRoute={prevRoute}
            />
          )}
        </div>
      </div>
    );
  }

  let hasColumns = true;
  let showSidebar = true;
  let showToc = true;
  let showSurvey = true;
  if (isHomePage || isBlogIndex) {
    hasColumns = false;
    showSidebar = false;
    showToc = false;
    showSurvey = false;
  } else if (section === 'blog') {
    showToc = false;
    hasColumns = false;
    showSidebar = false;
  }

  let searchOrder;
  if (section === 'learn' || (section === 'blog' && !isBlogIndex)) {
    searchOrder = order;
  }

  return (
    <>
      <Seo
        path={path}
        title={title}
        isHomePage={isHomePage}
        image={`/images/og-` + section + '.png'}
        searchOrder={searchOrder}
      />
      <SocialBanner />
      <TopNav
        section={section}
        routeTree={clientRouteTree}
        breadcrumbs={breadcrumbs}
      />
      <div
        className={cn(
          hasColumns &&
            'grid grid-cols-only-content lg:grid-cols-sidebar-content 2xl:grid-cols-sidebar-content-toc'
        )}>
        {showSidebar && (
          <div className="lg:-mt-16">
            <div className="lg:pt-16 fixed lg:sticky top-0 left-0 right-0 py-0 shadow lg:shadow-none">
              <SidebarNav
                key={section}
                routeTree={clientRouteTree}
                breadcrumbs={breadcrumbs}
              />
            </div>
          </div>
        )}
        {/* No fallback UI so need to be careful not to suspend directly inside. */}
        <Suspense fallback={null}>
          <main className="min-w-0 isolate">
            <article
              className="break-words font-normal text-primary dark:text-primary-dark"
              key={path}>
              {content}
            </article>
            <PageFooter isHomePage={isHomePage} showSurvey={showSurvey} />
          </main>
        </Suspense>
        <div className="-mt-16 hidden lg:max-w-xs 2xl:block">
          {showToc && toc.length > 0 && <Toc headings={toc} key={path} />}
        </div>
      </div>
    </>
  );
}
