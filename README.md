# Purpose

To find and replace strings in a Remark based project. I created this with the intention
of using it with Astro.

## Installation

```bash
npm install -D remark-plugin-find-and-replace
```

## Usage

In an Astro project, here's how you would use the plugin:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { RemarkPluginFindAndReplace } from 'remark-plugin-find-and-replace';

// https://astro.build/config
export default defineConfig({
  // ...
  markdown: {
    remarkPlugins: [
      RemarkPluginFindAndReplace({
        replacements: [
          // Replaces all strings that look like "%VERSION%" with "2.6.2"
          { pattern: '%VERSION%', replacement: "2.6.2" },
          // Replacement can be anything you pass as a "replacement" as noted here:
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#replacement
          { pattern: '%CDNDIR%', replacement: (name, pattern) => return `pattern: ${pattern}` },
          // You can also pass in regex, just make sure to provide the "g" flag for global regex.
          { pattern: /LICENSE/g, replacement: "[MIT LICENSE](https://opensource.org/license/mit/)" }
        ]
      })
    ]
  },
  // ...
})
```
