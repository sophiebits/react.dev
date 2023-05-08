/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import * as React from 'react';

interface CodeDiagramProps {
  children: React.ReactElement[];
  flip?: boolean;
}

export function CodeDiagram({children}: CodeDiagramProps) {
  const illustration = children[0];
  const content = children.slice(1);
  return (
    <section className="my-8 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
      {illustration}
      <div className="flex flex-col justify-center">{content}</div>
    </section>
  );
}
