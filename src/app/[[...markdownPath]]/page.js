/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import {MDXComponents} from 'components/MDX/MDXComponents';
import {Page} from 'components/Layout/Page';
import sidebarHome from '../../sidebarHome.json';
import sidebarLearn from '../../sidebarLearn.json';
import sidebarReference from '../../sidebarReference.json';
import sidebarCommunity from '../../sidebarCommunity.json';
import sidebarBlog from '../../sidebarBlog.json';

export default async function Layout({params: {markdownPath = []}}) {
  const {content, toc, meta} = (await getStaticProps(markdownPath)).props;
  const parsedContent = JSON.parse(content, reviveNodeOnClient);
  const parsedToc = JSON.parse(toc, reviveNodeOnClient);
  const section = getActiveSection(markdownPath);
  let routeTree;
  switch (section) {
    case 'home':
    case 'unknown':
      routeTree = sidebarHome;
      break;
    case 'learn':
      routeTree = sidebarLearn;
      break;
    case 'reference':
      routeTree = sidebarReference;
      break;
    case 'community':
      routeTree = sidebarCommunity;
      break;
    case 'blog':
      routeTree = sidebarBlog;
      break;
  }
  const path = '/' + markdownPath.join('/');
  return (
    <Page
      path={path}
      toc={parsedToc}
      routeTree={routeTree}
      meta={meta}
      section={section}>
      {parsedContent}
    </Page>
  );
}

function getActiveSection(markdownPath) {
  const cleanedPath = '/' + markdownPath.join('/');
  if (cleanedPath === '/') {
    return 'home';
  } else if (cleanedPath.startsWith('/reference')) {
    return 'reference';
  } else if (cleanedPath.startsWith('/learn')) {
    return 'learn';
  } else if (cleanedPath.startsWith('/community')) {
    return 'community';
  } else if (cleanedPath.startsWith('/blog')) {
    return 'blog';
  } else {
    return 'unknown';
  }
}

// Deserialize a client React tree from JSON.
function reviveNodeOnClient(key, val) {
  if (Array.isArray(val) && val[0] == '$r') {
    // Assume it's a React element.
    let type = val[1];
    let key = val[2];
    let props = val[3];
    if (type === 'wrapper') {
      type = Fragment;
      props = {children: props.children};
    }
    if (MDXComponents[type]) {
      type = MDXComponents[type];
    }
    if (!type) {
      console.error('Unknown type: ' + type);
      type = Fragment;
    }
    return {
      $$typeof: Symbol.for('react.element'),
      type: type,
      key: key,
      ref: null,
      props: props,
      _owner: null,
    };
  } else {
    return val;
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~ IMPORTANT: BUMP THIS IF YOU CHANGE ANY CODE BELOW ~~~
const DISK_CACHE_BREAKER = 7;
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Put MDX output into JSON for client.
async function getStaticProps(markdownPath) {
  const fs = require('fs');
  const {
    prepareMDX,
    PREPARE_MDX_CACHE_BREAKER,
  } = require('../../utils/prepareMDX');
  const rootDir = process.cwd() + '/src/content/';
  const mdxComponentNames = Object.keys(MDXComponents);

  // Read MDX from the file.
  let path = markdownPath.join('/') || 'index';
  let mdx;
  try {
    mdx = fs.readFileSync(rootDir + path + '.md', 'utf8');
  } catch {
    mdx = fs.readFileSync(rootDir + path + '/index.md', 'utf8');
  }

  // See if we have a cached output first.
  const {FileStore, stableHash} = require('metro-cache');
  const store = new FileStore({
    root: process.cwd() + '/node_modules/.cache/react-docs-mdx/',
  });
  const hash = Buffer.from(
    stableHash({
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // ~~~~ IMPORTANT: Everything that the code below may rely on.
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      mdx,
      mdxComponentNames,
      DISK_CACHE_BREAKER,
      PREPARE_MDX_CACHE_BREAKER,
      lockfile: fs.readFileSync(process.cwd() + '/yarn.lock', 'utf8'),
    })
  );
  const cached = await store.get(hash);
  if (cached) {
    console.log(
      'Reading compiled MDX for /' + path + ' from ./node_modules/.cache/'
    );
    return cached;
  }
  if (process.env.NODE_ENV === 'production') {
    console.log(
      'Cache miss for MDX for /' + path + ' from ./node_modules/.cache/'
    );
  }

  // If we don't add these fake imports, the MDX compiler
  // will insert a bunch of opaque components we can't introspect.
  // This will break the prepareMDX() call below.
  let mdxWithFakeImports =
    mdx +
    '\n\n' +
    mdxComponentNames
      .map((key) => 'import ' + key + ' from "' + key + '";\n')
      .join('\n');

  // Turn the MDX we just read into some JS we can execute.
  const {remarkPlugins} = require('../../../plugins/markdownToHtml');
  const {compile: compileMdx} = await import('@mdx-js/mdx');
  const visit = (await import('unist-util-visit')).default;
  const jsxCode = await compileMdx(mdxWithFakeImports, {
    remarkPlugins: [
      ...remarkPlugins,
      (await import('remark-gfm')).default,
      (await import('remark-frontmatter')).default,
    ],
    rehypePlugins: [
      // Support stuff like ```js App.js {1-5} active by passing it through.
      function rehypeMetaAsAttributes() {
        return (tree) => {
          visit(tree, 'element', (node) => {
            if (node.tagName === 'code' && node.data && node.data.meta) {
              node.properties.meta = node.data.meta;
            }
          });
        };
      },
    ],
  });
  const {transform} = require('@babel/core');
  const jsCode = await transform(jsxCode, {
    plugins: [require('@babel/plugin-transform-modules-commonjs')],
    presets: [require('@babel/preset-react')],
  }).code;

  // Prepare environment for MDX.
  let fakeExports = {};
  const fakeRequire = (name) => {
    if (name === 'react/jsx-runtime') {
      return require('react/jsx-runtime');
    } else {
      // For each fake MDX import, give back the string component name.
      // It will get serialized later.
      return name;
    }
  };
  const evalJSCode = new Function('require', 'exports', jsCode);
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // THIS IS A BUILD-TIME EVAL. NEVER DO THIS WITH UNTRUSTED MDX (LIKE FROM CMS)!!!
  // In this case it's okay because anyone who can edit our MDX can also edit this file.
  evalJSCode(fakeRequire, fakeExports);
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const reactTree = fakeExports.default({});

  // Pre-process MDX output and serialize it.
  let {toc, children} = prepareMDX(reactTree.props.children);
  if (path === 'index') {
    toc = [];
  }

  // Parse Frontmatter headers from MDX.
  const fm = require('gray-matter');
  const meta = fm(mdx).data;

  const output = {
    props: {
      content: JSON.stringify(children, stringifyNodeOnServer),
      toc: JSON.stringify(toc, stringifyNodeOnServer),
      meta,
    },
  };

  // Serialize a server React tree node to JSON.
  function stringifyNodeOnServer(key, val) {
    if (val != null && val.$$typeof === Symbol.for('react.element')) {
      // Remove fake MDX props.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {mdxType, originalType, parentName, ...cleanProps} = val.props;
      return [
        '$r',
        typeof val.type === 'string' ? val.type : mdxType,
        val.key,
        cleanProps,
      ];
    } else {
      return val;
    }
  }

  // Cache it on the disk.
  await store.set(hash, output);
  return output;
}

// Collect all MDX files for static generation.
export async function generateStaticParams() {
  const {promisify} = require('util');
  const {resolve} = require('path');
  const fs = require('fs');
  const readdir = promisify(fs.readdir);
  const stat = promisify(fs.stat);
  const rootDir = process.cwd() + '/src/content';

  // Find all MD files recursively.
  async function getFiles(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(
      subdirs.map(async (subdir) => {
        const res = resolve(dir, subdir);
        return (await stat(res)).isDirectory()
          ? getFiles(res)
          : res.slice(rootDir.length + 1);
      })
    );
    return files.flat().filter((file) => file.endsWith('.md'));
  }

  // 'foo/bar/baz.md' -> ['foo', 'bar', 'baz']
  // 'foo/bar/qux/index.md' -> ['foo', 'bar', 'qux']
  function getSegments(file) {
    let segments = file.slice(0, -3).replace(/\\/g, '/').split('/');
    if (segments[segments.length - 1] === 'index') {
      segments.pop();
    }
    return segments;
  }

  const files = await getFiles(rootDir);
  return files.map((file) => ({
    markdownPath: getSegments(file),
    // ^^^ CAREFUL HERE.
    // If you rename markdownPath, update patches/next-remote-watch.patch too.
    // Otherwise you'll break Fast Refresh for all MD files.
  }));
}

export const dynamic = 'force-static';
export const dynamicParams = false;
