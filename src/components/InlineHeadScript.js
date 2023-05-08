/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */
'use client'; // payload size

let script = function () {
  var htmlClassList = document.documentElement.classList;
  function setTheme(newTheme) {
    if (newTheme === 'dark') {
      htmlClassList.add('dark');
    } else if (newTheme === 'light') {
      htmlClassList.remove('dark');
    }
  }

  var preferredTheme;
  try {
    preferredTheme = localStorage.getItem('theme');
  } catch (err) {}

  window.__setPreferredTheme = function (newTheme) {
    preferredTheme = newTheme;
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (err) {}
  };

  var initialTheme = preferredTheme;
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  if (!initialTheme) {
    initialTheme = darkQuery.matches ? 'dark' : 'light';
  }
  setTheme(initialTheme);

  darkQuery.addEventListener('change', function (e) {
    if (!preferredTheme) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Detect whether the browser is Mac to display platform specific content
  // An example of such content can be the keyboard shortcut displayed in the search bar
  htmlClassList.add(
    window.navigator.platform.includes('Mac') ? 'platform-mac' : 'platform-win'
  );
};

export default function InlineHeadScript() {
  return (
    <script dangerouslySetInnerHTML={{__html: `(${script.toString()})()`}} />
  );
}
