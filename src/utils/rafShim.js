/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

// Used in next.config.js to remove the raf transitive dependency.
export default typeof window !== 'undefined'
  ? window.requestAnimationFrame
  : () => {
      throw new Error('requestAnimationFrame is not supported on the server');
    };
