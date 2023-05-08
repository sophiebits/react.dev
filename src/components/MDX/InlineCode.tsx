/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */
'use client'; // payload size

import cn from 'classnames';

interface InlineCodeProps {}
function InlineCode({
  ...props
}: JSX.IntrinsicElements['code'] & InlineCodeProps) {
  return (
    <code
      className={cn(
        'inline text-code text-secondary dark:text-secondary-dark px-1 rounded-md no-underline',
        'bg-gray-30 bg-opacity-10 py-px'
      )}
      {...props}
    />
  );
}

export default InlineCode;
