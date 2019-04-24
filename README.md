# mw-replace-bot

A Node.js tool using [mediawiki](https://github.com/oliver-moran/mediawiki)
to conveniently perform expressive find-and-replaces on wiki content
(including regular expressions with callbacks).

**NOTE: This project is very much experimental, and short of the
potential it adds for your own replacements to be problematic, it may
have its own bugs at this stage. Use at your own risk!**

## Installation

```
npm i mw-replace-bot
```

## Usage

In a `config.js` file in the same directory as `mw-replace-bot`,
add the following:

```js
module.exports = {
  // REQUIRED ITEMS

  endpoint: 'https://site-to-be-queried.example/api.php',
  user: 'user@<my-bot-login>',
  password: 'my-bot-password',
  // The search can be more broad than the regex find,
  //   as entries found with `search` that are not found
  //   by `find` will not be modified; but currently a
  //   `search` is needed to get results out of the
  //   API and over the network; the `find` is
  //   post-processing done within Node
  search: 'search terms',

  // This can also be just a string in which case,
  //   regular expressions wouldn't apply and only
  //   a single instance would be replaced
  // For regular expressions in JavaScript, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
  find: /a (regular) expression/gu,

  // Instead of a function, this can also be a
  //   regex replacement string: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
  // For function docs, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter
  replace (n0, n1) {
    return n1; // Do replacements here
  },

  // OPTIONAL ITEMS

  // Disable actual editing
  debug: true,
  // Don't show the replaced text of the page in console (can be large)
  hideText: true,
  // Suffix to add to edit summaries:
  byline: '(mw-replace bot edit)',
  // Summary for the batch
  summary: 'A summary for this batch of edits',
  // ms between API requests (Default: 6 secs)
  rate: 6e3,

  // Used in `User-Agent` header; `version` is that of `mediawiki` module
  // 1. Default for Node:
  // 'MediaWiki/' + version + '; Node/' + process.version +
  //    '; <https://github.com/oliver-moran/mediawiki>',
  // 2. Default for browser (once we may support):
  // 'MediaWiki/' + version + '; ' + navigator.userAgent +
  //    '; <https://github.com/oliver-moran/mediawiki>'
  userAgent: 'A string to use for the `User-Agent` header'
};
```

## To-dos

1. Need `continue` code!
1. GUI and/or expose a CLI to pass in a config file, looking in working directory

## Lower-priority to-dos

1. Ideally, update `mediawiki` to use ES6 `Promise` API and use here
1. Browser support (including ESM)
1. Would ideally tie into SQL to actually do regex search rather than search
    and then find/replace
