/* eslint-disable promise/prefer-await-to-callbacks, no-console */
const MediaWikiBot = require('mediawiki').Bot;
const config = require('./config');

const botConfig = {
  endpoint: config.endpoint,
  rate: 6e3, // ms between API requests (Default: 6 secs)
  // userAgent: 'mw-replace-bot <https://github.com/brettz9/mw-replace-bot>',
  byeline: '(mw-replace bot edit)'
};

const bot = new MediaWikiBot(botConfig);

const hasUserAndPass = config.user && config.password;
if (hasUserAndPass) {
  // bot.login(config.user, config.password)
  bot.login(config.user, config.password, true).complete((res) => {
    console.log('login res', res);

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
      // gsrlimit: 10,
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
      // gsrsort: 'none',
      gsrsearch: config.search || '' // Search titles or content (Required)
    }, isPriority).complete((resp) => {
      const {
        // Todo: Recurse through all results
        /*
        batchcomplete,
        continue: {
          gsroffset,
          continue: cont
        },
        */
        query: {
          pages
        }
      } = resp;
      // console.log(JSON.stringify(resp, null, 2));
      Object.values(pages).forEach(({
        title, pageid, revisions, timestamp: basetimestamp
      }) => {
        // Not sure order is correct, but appears to get one only
        console.log('title', title);
        const lastRevision = revisions[revisions.length - 1]['*'];

        // GET TOKEN
        bot.get({
          action: 'query',
          meta: 'tokens'
        }).complete(({query: {tokens: {csrftoken: token}}}) => {
          // DO REPLACEMENTS
          console.log('token', token);
          const text = lastRevision.replace(config.find, config.replace);
          console.log('text', text);

          // SUBMIT EDIT
          // https://www.mediawiki.org/wiki/API:Edit
          // Todo: Once proper token received, test
          /*
          bot.post({
            action: 'edit',
            pageid,
            summary: (config.summary || '') + botConfig.byeline,
            text,
            bot: true,
            basetimestamp,
            // recreate: false, // If deleted
            nocreate: true, // Throw if non-existent
            // undo: Can be used in place of text for revisions
            // redirect: true, // Resolve redirects
            contentformat: 'application/json',
            contentmodel: 'wikitext',
            token
          });
          */
        });
      });
    }).error((err) => {
      console.log(err.toString());
    });

    if (hasUserAndPass) {
      bot.logout();
    }
  }).error((err) => {
    console.log('aaaa', err);
  });
}
