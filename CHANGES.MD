# mw-replace-bot CHANGES

## 0.4.0

- Breaking change: Add node engines >= 8
- Breaking change: Rename `hideText`->`logReplaceText`,
  `debug`->`readonly`; add `logging`
- Fix: `continue` code with `autoContinue` option
- Enhancement: Add example
- Enhancement: Export function which returns a `Promise` resolving to
  an array of info re: replacements
- Enhancement: Allow passing config path, config object, and defaulting to
  config in current working directory (and throwing otherwise)
- npm: Update devDep

## 0.3.1

- Fix: Had not been requiring newly renamed config file properly

## 0.3.0

- Rename config file to `mw-replace-rc.js`
- Add JSON schema file to describe config format (not yet in use)
- Docs: Clarify
- npm: Update devDeps

## 0.2.0

- Fix: Report that finishing title as finish titles, and only at
    end indicate complete finishing
- Enhancement: `debug` and `hideText` options
- Enhancement: Expose Bot config for alteration
- Docs: Clarify options more

## 0.1.1

- Avoid trying to edit page if replace yields no different result

## 0.1.0

- Initial release
