/* eslint-disable jsdoc/check-types,
    promise/prefer-await-to-callbacks, no-console */
const {join} = require('path');

const MediaWikiBot = require('mediawiki').Bot;

/**
* @typedef {PlainObject} MWReplaceConfig
* @property {string} endpoint URI
* @property {string} user
* @property {string} pass Password
* @property {string} search
* @property {string} find Regex
* @property {string} replace Function as string
* @property {string} [byline]
* @property {string} [summary]
* @property {boolean} [readonly]
* @property {boolean} [logging]
* @property {boolean} [logReplacedText]
* @property {boolean} [autoContinue]
* @property {PositiveFiniteNumber} [rate]
* @property {string} [userAgent]
* @property {Integer} [gsrlimit] Greater than or equal to 1
* @property {"relevance"|"just_match"|"none"|"incoming_links_asc"|
* "incoming_links_desc"|"last_edit_asc"|"last_edit_desc"|
* "create_timestamp_asc"|"create_timestamp_desc"} [gsrsort="relevance"]
*/

/**
* @typedef {PlainObject} MWReplaceResult
* @property {string} title
* @property {string} text
* @property {boolean} [noDifference]
*/

/**
 * @param {MWReplaceConfig|string} config
 * @returns {Promise<MWReplaceResult[]>}
 */
function findReplace (config) {
  if (!config) {
    /* eslint-disable global-require, import/no-dynamic-require */
    try {
      config = require(join(process.cwd(), 'mw-replace-rc.js'));
    } catch (jsErr) {
      try {
        config = require(join(process.cwd(), 'mw-replace-rc.json'));
      } catch (jsonErr) {
        throw new Error('Config files not found');
      }
    }
  } else if (typeof config === 'string') {
    config = require(config);
    /* eslint-enable global-require, import/no-dynamic-require */
  } else if (typeof config !== 'object') {
    throw new TypeError('Unrecognized config type');
  }

  const {logging, endpoint, userAgent} = config;
  const botConfig = {
    endpoint,
    rate: config.rate || 6e3, // ms between API requests (Default: 6 secs)
    userAgent, // Change default from `mediawiki` to 'mw-replace-bot <https://github.com/brettz9/mw-replace-bot>'?
    byeline: 'byline' || 'byeline' in config // Allow empty string
      ? (config.byline || config.byeline)
      : '(mw-replace bot edit)'
  };

  const bot = new MediaWikiBot(botConfig);

  const hasUserAndPass = config.user && config.password;
  if (!hasUserAndPass) {
    throw new TypeError('User and password expected');
  }

  /**
   * From Mediawiki API results
   * @typedef {PlainObject} MWContinue
   * @property {PositiveInteger} gsroffset
   * @property {string} continue
  */

  const results = [];
  /**
   * @param {MWContinue} cont
   * @returns {Promise<MWReplaceResult[]>}
   */
  function searchAndEdit (cont) {
    // Really ought to get `mediawiki` bot returning standard promises
    // eslint-disable-next-line promise/avoid-new
    return new Promise((resolve, reject) => {
      // Execute before all other queued requests? (Default: false)
      const isPriority = true;
      bot.get({
        // See https://www.mediawiki.org/wiki/API:Search
        action: 'query',
        // We'll use a search generator instead of directly using `search`
        // list: 'search',
        generator: 'search',
        utf8: '', // Necessary?
        // format: 'json', // Added by API
        // For generator; for properties, see https://www.mediawiki.org/wiki/API:Query#query (fewer at https://www.mediawiki.org/wiki/API:Properties )
        prop: 'revisions',
        // For revisiions: https://www.mediawiki.org/wiki/API:Revisions
        // rvlimit: 1, // We only need latest
        rvprop: 'content', // |timestamp
        // These would be useful but not allowed with generators
        // rvdir: 'older',
        // rvcontinue:

        // Adding `g` below for (search) generator use
        // gsrnamespace: [].join('|') // Numbers or "*" (Default: 0)
        // Pages to return (Default: 10; max: 5000 for bots, 500 for humans)
        gsrlimit: config.gsrlimit || 10,
        // For continuing results (Default: 0)
        // gsroffset: 0,
        // Ranking enums: classic|classic_noboostlinks|empty|wsum_inclinks|
        //   wsum_inclinks_pv|popular_inclinks_pv|popular_inclinks|
        //   engine_autoselect (Default)
        // gsrqiprofile:
        gsrwhat: 'text', // title|text|nearmatch (Default ?)
        // Default: totalhits|suggestion|rewrittenquery
        gsrinfo: ['totalhits', 'suggestion', 'rewrittenquery'].join('|'),
        // (Gives ns, title, pageid automatically)
        // Properties to return: size|wordcount|timestamp|snippet|
        //   titlesnippet|redirecttitle|redirectsnippet|sectiontitle|
        //   sectionsnippet|isfilematch|categorysnippet|
        //   extensiondata (Default: size|wordcount|timestamp|snippet)
        gsrprop: ['snippet'].join('|'),
        // gsrinterwiki: false, // Include interwiki results (Default ?)
        // Attempts rewriting, e.g., for spelling (Default ?)
        // gsrenablerewrites: false,
        // `srsort` not recognized due to testing on older wiki?
        // Sorting: relevance (Default)|just_match|none|incoming_links_asc|
        //   incoming_links_desc|last_edit_asc|last_edit_desc|
        //   create_timestamp_asc|create_timestamp_desc
        gsrsort: config.gsrsort || 'none',
        gsrsearch: config.search || '', // Search titles or content (Required)
        ...cont
      }, isPriority).complete((resp) => {
        const {
          // Todo: `batchcomplete` needed?
          // batchcomplete,
          continue: continuation,
          query: {
            pages
          }
        } = resp;
        // console.log(JSON.stringify(resp, null, 2));
        let prom = Promise.resolve();
        Object.values(pages).forEach(({
          title, pageid, revisions, timestamp: basetimestamp
        }) => {
          // Not sure order is correct, but appears to get one only
          if (logging) console.log('Page title:', title);
          const lastRevision = revisions[revisions.length - 1]['*'];

          const text = lastRevision.replace(config.find, config.replace);
          if (text === lastRevision) {
            if (logging) console.log('No differences for', title);
            results.push({title, text, noDifference: true});
            return;
          }
          const summary = config.summary || '';
          if (logging) console.log('Summary:', summary);

          if (config.logReplacedText) {
            if (logging) console.log('Replaced text:\n\n', text);
          }

          results.push({title, text});

          if (config.readonly) {
            return;
          }

          // GET TOKEN AND DO REPLACEMENTS
          // Todo: Should we avoid making Promise dependent (or at least not
          ///  sequential) on the actual replacing resolving or just the query?
          // eslint-disable-next-line promise/prefer-await-to-then
          prom = prom.then(() => {
            // Really ought to get `mediawiki` bot returning standard promises
            // eslint-disable-next-line promise/avoid-new, promise/param-names
            return new Promise((res, rej) => {
              bot.edit(title, text, summary, true).complete(() => {
                if (logging) console.log('Finished edit for title', title);
                res();
              }).error((err) => {
                rej(err);
              });
            });
          });
        });

        // eslint-disable-next-line max-len
        // eslint-disable-next-line promise/prefer-await-to-then, promise/catch-or-return
        prom.then(() => {
          if (logging) console.log('Finishing a batch...');
          // eslint-disable-next-line promise/always-return
          if (config.autoContinue && continuation) {
            if (logging) console.log('continuation', continuation);
            resolve(searchAndEdit(continuation));
            return;
          }
          resolve(continuation);
        });
      }).error((err) => {
        reject(err);
      });
    });
  }

  // Really ought to get `mediawiki` bot returning standard promises
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    bot.login(config.user, config.password, true).complete((res) => {
      if (logging) console.log('Logged in', res);

      // eslint-disable-next-line promise/prefer-await-to-then
      searchAndEdit().then((continuation) => {
        if (hasUserAndPass) {
          if (logging) console.log('Finished; logging out...');
          bot.logout();
        } else if (logging) console.log('Finished!');

        // console.log('results', results);
        resolve({results, continuation});
        return undefined;
      }).catch(reject);
    }).error((err) => {
      reject(err);
    });
  });
}

exports.findReplace = findReplace;
