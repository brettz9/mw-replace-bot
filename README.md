# mw-replace-bot

A Node.js tool using [mediawiki](https://github.com/oliver-moran/mediawiki)
to conveniently perform expressive find-and-replaces on wiki content
(including regular expressions with callbacks).

**THIS PROJECT IS NOT YET FUNCTIONAL.**

## Installation

```
npm i mw-replace-bot --save
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
  find: /a (regular) expression/gu,
  replace (n0, n1) {
    return n1; // Do replacements here
  }
};
```

## To-dos

1. Expose a CLI to pass in a config file, looking in working directory
