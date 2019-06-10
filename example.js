/* eslint-disable no-console */
const mwReplaceBot = require('./');

(async () => {
const info = await (mwReplaceBot.findReplace());
console.log(info);
console.log(
  'length',
  info.results.length,
  '; no difference:',
  info.results.filter((r) => r.noDifference).length
);
})();
