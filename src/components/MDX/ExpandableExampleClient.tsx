/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */
'use client';

import * as React from 'react';
import cn from 'classnames';
import {IconChevron} from '../Icon/IconChevron';
import {IconDeepDive} from '../Icon/IconDeepDive';
import {IconCodeBlock} from '../Icon/IconCodeBlock';
import {Button} from '../Button';
import {H4} from './Heading';
import {useEffect, useState} from 'react';
import {useHash} from '../../hooks/useHash';

interface ExpandableExampleClientProps {
  id: string;
  heading: React.ReactNode;
  children: React.ReactNode;
  excerpt?: string;
  type: 'DeepDive' | 'Example';
}

function ExpandableExampleClient({
  id,
  heading,
  children,
  excerpt,
  type,
}: ExpandableExampleClientProps) {
  const isDeepDive = type === 'DeepDive';
  const isExample = type === 'Example';

  const shouldAutoExpand = '#' + id === useHash();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (shouldAutoExpand) {
      setIsExpanded(true);
    }
  }, [shouldAutoExpand]);

  return (
    <details
      open={isExpanded}
      onToggle={(e: any) => {
        setIsExpanded(e.currentTarget!.open);
      }}
      className={cn(
        'my-12 rounded-2xl shadow-inner-border dark:shadow-inner-border-dark relative',
        {
          'dark:bg-opacity-20 dark:bg-purple-60 bg-purple-5': isDeepDive,
          'dark:bg-opacity-20 dark:bg-yellow-60 bg-yellow-5': isExample,
        }
      )}>
      <summary
        className="list-none p-8"
        tabIndex={-1 /* there's a button instead */}
        onClick={(e) => {
          // We toggle using a button instead of this whole area,
          // with an escape case for the header anchor link
          if (!(e.target instanceof SVGElement)) {
            e.preventDefault();
          }
        }}>
        <h5
          className={cn('mb-4 uppercase font-bold flex items-center text-sm', {
            'dark:text-purple-30 text-purple-50': isDeepDive,
            'dark:text-yellow-30 text-yellow-60': isExample,
          })}>
          {isDeepDive && (
            <>
              <IconDeepDive className="inline mr-2 dark:text-purple-30 text-purple-40" />
              Deep Dive
            </>
          )}
          {isExample && (
            <>
              <IconCodeBlock className="inline mr-2 dark:text-yellow-30 text-yellow-50" />
              Example
            </>
          )}
        </h5>
        <div className="mb-4">
          <H4
            id={id}
            className="text-xl font-bold text-primary dark:text-primary-dark">
            {heading}
          </H4>
          {excerpt && <div>{excerpt}</div>}
        </div>
        <Button
          active={true}
          className={cn({
            'bg-purple-50 border-purple-50 hover:bg-purple-40 focus:bg-purple-50 active:bg-purple-50':
              isDeepDive,
            'bg-yellow-50 border-yellow-50 hover:bg-yellow-40 focus:bg-yellow-50 active:bg-yellow-50':
              isExample,
          })}
          onClick={() => setIsExpanded((current) => !current)}>
          <span className="mr-1">
            <IconChevron displayDirection={isExpanded ? 'up' : 'down'} />
          </span>
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </Button>
      </summary>
      <div
        className={cn('p-8 border-t', {
          'dark:border-purple-60 border-purple-10 ': isDeepDive,
          'dark:border-yellow-60 border-yellow-50': isExample,
        })}>
        {children}
      </div>
    </details>
  );
}

export default ExpandableExampleClient;
