module.exports = {
    "env": {
        "es6": true
    },
    "settings": {
        "polyfills": [
          "fetch",
          "Promise"
        ]
    },
    "extends": ["ash-nazg/sauron"],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
      "import/unambiguous": 0,
      "import/no-commonjs": 0
    }
};
