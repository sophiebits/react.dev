/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import * as React from 'react';
import {ChallengeContents} from './ChallengesClient';
import {Children} from 'react';
import {H4} from '../Heading';
import {ChallengesClient} from './ChallengesClient';

interface ChallengesProps {
  children: React.ReactElement[];
  isRecipes?: boolean;
  titleText?: string;
  titleId?: string;
  noTitle?: boolean;
}

const parseChallengeContents = (
  children: React.ReactElement[]
): ChallengeContents[] => {
  const contents: ChallengeContents[] = [];

  if (!children) {
    return contents;
  }

  let challenge: Partial<ChallengeContents> = {};
  let content: React.ReactElement[] = [];
  Children.forEach(children, (child) => {
    const {props, type} = child;
    switch (type) {
      case Solution: {
        challenge.solution = child;
        challenge.content = content;
        contents.push(challenge as ChallengeContents);
        challenge = {};
        content = [];
        break;
      }
      case Hint: {
        challenge.hint = child;
        break;
      }
      case H4: {
        challenge.order = contents.length + 1;
        challenge.name = props.children;
        challenge.id = props.id;
        break;
      }
      default: {
        content.push(child);
      }
    }
  });

  return contents;
};

export function Challenges({children, ...props}: ChallengesProps) {
  const challenges = parseChallengeContents(children);
  return <ChallengesClient challenges={challenges} {...props} />;
}

export function Hint({children}: {children: React.ReactNode}) {
  return <div>{children}</div>;
}

export function Solution({children}: {children: React.ReactNode}) {
  return <div>{children}</div>;
}
