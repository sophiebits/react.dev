/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */
import ExpandableExampleClient from './ExpandableExampleClient';
import {H4} from './Heading';

interface ExpandableExampleProps {
  children: React.ReactNode;
  excerpt?: string;
  type: 'DeepDive' | 'Example';
}

function ExpandableExample({children, excerpt, type}: ExpandableExampleProps) {
  if (!Array.isArray(children) || children[0].type !== H4) {
    throw Error(
      `Expandable content ${type} is missing a corresponding title at the beginning`
    );
  }
  const id = children[0].props.id;
  let heading = children[0].props.children;
  let rest = children.slice(1);
  return (
    <ExpandableExampleClient
      id={id}
      heading={heading}
      excerpt={excerpt}
      type={type}>
      {rest}
    </ExpandableExampleClient>
  );
}

export default ExpandableExample;
