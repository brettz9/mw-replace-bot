import {jml, body} from '../node_modules/jamilih/dist/jml-es.js';

// Todo: i18n
const _ = (s) => s;
document.documentElement.lang = 'en';
document.documentElement.dir = 'ltr';

document.title = _('Mediawiki Replacement Bot');

(async () => {
const json = await (await fetch('../schemas/fieldSchema.json').json());
// Todo
console.log(json); // eslint-disable-line no-console
})();

jml('div', [
  ['div', {role: 'main'}, [

  ]]
], body);
