import * as React from 'react';

export const OL = (p: JSX.IntrinsicElements['ol']) => (
  <ol className="ml-6 my-3 list-decimal" {...p} />
);
export const LI = (p: JSX.IntrinsicElements['li']) => (
  <li className="leading-relaxed mb-1" {...p} />
);
export const UL = (p: JSX.IntrinsicElements['ul']) => (
  <ul className="ml-6 my-3 list-disc" {...p} />
);
