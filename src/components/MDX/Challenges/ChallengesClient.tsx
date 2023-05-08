/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */
'use client';

import {useRef, useEffect, useState} from 'react';
import * as React from 'react';
import cn from 'classnames';
import {H2} from 'components/MDX/Heading';
import {H4} from 'components/MDX/Heading';
import {Challenge} from './Challenge';
import {Navigation} from './Navigation';
import {useHash} from 'hooks/useHash';

interface ChallengesClientProps {
  challenges: ChallengeContents[];
  isRecipes?: boolean;
  titleText?: string;
  titleId?: string;
  noTitle?: boolean;
}

export interface ChallengeContents {
  id: string;
  name: string;
  order: number;
  content: React.ReactNode;
  solution: React.ReactNode;
  hint?: React.ReactNode;
}

enum QueuedScroll {
  INIT = 'init',
  NEXT = 'next',
}

export function ChallengesClient({
  challenges,
  isRecipes,
  noTitle,
  titleText = isRecipes ? 'Try out some examples' : 'Try out some challenges',
  titleId = isRecipes ? 'examples' : 'challenges',
}: ChallengesClientProps) {
  const totalChallenges = challenges.length;
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const queuedScrollRef = useRef<undefined | QueuedScroll>(QueuedScroll.INIT);
  const [activeIndex, setActiveIndex] = useState(0);
  const currentChallenge = challenges[activeIndex];
  const hash = useHash();

  useEffect(() => {
    if (queuedScrollRef.current === QueuedScroll.INIT) {
      const initIndex = challenges.findIndex(
        (challenge) => '#' + challenge.id === hash
      );
      if (initIndex === -1) {
        queuedScrollRef.current = undefined;
      } else if (initIndex !== activeIndex) {
        setActiveIndex(initIndex);
      }
    }
    if (queuedScrollRef.current) {
      scrollAnchorRef.current!.scrollIntoView({
        block: 'start',
        ...(queuedScrollRef.current === QueuedScroll.NEXT && {
          behavior: 'smooth',
        }),
      });
      queuedScrollRef.current = undefined;
    }
  }, [activeIndex, hash, challenges]);

  const handleChallengeChange = (index: number) => {
    setActiveIndex(index);
  };

  const Heading = isRecipes ? H4 : H2;
  return (
    <div className="max-w-7xl mx-auto py-4 w-full">
      <div
        className={cn(
          'border-gray-10 bg-card dark:bg-card-dark shadow-inner rounded-none -mx-5 sm:mx-auto sm:rounded-2xl'
        )}>
        <div ref={scrollAnchorRef} className="py-2 px-5 sm:px-8 pb-0 md:pb-0">
          {!noTitle && (
            <Heading
              id={titleId}
              className={cn(
                'mb-2 leading-10 relative',
                isRecipes
                  ? 'text-xl text-purple-50 dark:text-purple-30'
                  : 'text-3xl text-link'
              )}>
              {titleText}
            </Heading>
          )}
          {totalChallenges > 1 && (
            <Navigation
              currentChallenge={currentChallenge}
              challenges={challenges}
              handleChange={handleChallengeChange}
              isRecipes={isRecipes}
            />
          )}
        </div>
        <Challenge
          key={currentChallenge.id}
          isRecipes={isRecipes}
          currentChallenge={currentChallenge}
          totalChallenges={totalChallenges}
          hasNextChallenge={activeIndex < totalChallenges - 1}
          handleClickNextChallenge={() => {
            setActiveIndex((i) => i + 1);
            queuedScrollRef.current = QueuedScroll.NEXT;
          }}
        />
      </div>
    </div>
  );
}
