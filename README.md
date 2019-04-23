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
  endpoint: 'https://site-to-query.example/api.php',
  user: 'user@<my-bot-login>',
  password: 'my-bot-password',
  search: 'search terms',
  summary: 'Optional edit summary',
  find: /a (regular) expression/gu,
  replace (n0, n1) {
    return n1; // Do replacements here
  }
};
```

## To-dos

1. Need `continue` code!
1. Should tie into API to actually do regex search rather than search
    and then find/replace
1. Expose a CLI to pass in a config file, looking in working directory

## Lower-priority to-dos

1. Ideally, update `mediawiki` to use ES6 `Promise` API and use here
1. Browser support (including ESM)
