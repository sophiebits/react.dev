/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import * as React from 'react';

export function AuthorCredit({
  author = 'Rachel Lee Nabors',
  authorLink = 'http://rachelnabors.com/',
}: {
  author: string;
  authorLink: string;
}) {
  return (
    <div className="sr-only group-hover:not-sr-only group-focus-within:not-sr-only hover:sr-only">
      <p className="bg-card dark:bg-card-dark text-center text-sm text-secondary dark:text-secondary-dark leading-tight dark:text-secondary-dark p-2 rounded-lg absolute left-1/2 -top-4 -translate-x-1/2 -translate-y-full group-hover:flex group-hover:opacity-100 after:content-[''] after:absolute after:left-1/2 after:top-[95%] after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-card after:dark:border-t-card-dark opacity-0 transition-opacity duration-300">
        <cite>
          Illustrated by{' '}
          {authorLink ? (
            <a
              target="_blank"
              rel="noreferrer"
              className="text-link dark:text-link-dark"
              href={authorLink}>
              {author}
            </a>
          ) : (
            author
          )}
        </cite>
      </p>
    </div>
  );
}
