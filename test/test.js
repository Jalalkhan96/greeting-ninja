'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const g = require('../index');

test('basic greeting includes the name', () => {
  assert.match(g.greet('Ali'), /Ali/);
});

test('phone → Urdu for +92 (Pakistan)', () => {
  assert.strictEqual(g.phoneToLang('+923001234567'), 'ur');
  const out = g.greet('Ali', { phone: '+923001234567' });
  assert.match(out, /Ali/);
  assert.doesNotMatch(out, /Hello/);
});

test('phone → Hindi for +91', () => {
  assert.strictEqual(g.phoneToLang('+919876543210'), 'hi');
});

test('phone → English for +1', () => {
  assert.strictEqual(g.phoneToLang('+14155551234'), 'en');
});

test('phone → Japanese for +81', () => {
  assert.strictEqual(g.phoneToLang('+819012345678'), 'ja');
});

test('phone parsing handles multiple formats', () => {
  assert.strictEqual(g.phoneToLang('+923001234567'), 'ur');
  assert.strictEqual(g.phoneToLang('923001234567'), 'ur');
  assert.strictEqual(g.phoneToLang('00923001234567'), 'ur');   // EU-style prefix
  assert.strictEqual(g.phoneToLang('+92 300 1234567'), 'ur');
  assert.strictEqual(g.phoneToLang('+92-300-1234567'), 'ur');
});

test('unknown phone returns null (fallback happens at resolveLang)', () => {
  assert.strictEqual(g.phoneToLang('+9991234'), null);        // 999 not assigned
  assert.strictEqual(g.phoneToLang(''), null);
  assert.strictEqual(g.phoneToLang(null), null);
});

test('resolveLang uses fallback when phone is unknown', () => {
  const out = g.greet('Ali', { phone: '+9991234' });          // unknown → fallback en
  assert.match(out, /Ali/);
  assert.match(out, /Hello|Hi|Hey|Howdy/);
});

test('lang override beats phone', () => {
  const out = g.greet('Ali', { phone: '+923001234567', lang: 'fr' });
  assert.match(out, /Ali/);
  assert.match(out, /Salut|Coucou/);
});

test('welcome() in a group', () => {
  const out = g.welcome('Ali', { phone: '+923001234567', group: 'Family' });
  assert.match(out, /Ali/);
  assert.match(out, /Family/);
  assert.match(out, /خوش آمدید/);
});

test('welcome() without group', () => {
  const out = g.welcome('Ali', { lang: 'en' });
  assert.match(out, /Ali/);
  assert.match(out, /Welcome/);
});

test('first() DM message in Urdu', () => {
  const out = g.first('Ahmed', { phone: '+923001234567' });
  assert.match(out, /Ahmed/);
  assert.match(out, /السلام علیکم/);
});

test('first() DM message in English', () => {
  const out = g.first('John', { phone: '+14155551234' });
  assert.match(out, /Hey John/);
});

test('seed makes output deterministic', () => {
  const a = g.greet('Ali', { seed: 42 });
  const b = g.greet('Ali', { seed: 42 });
  assert.strictEqual(a, b);
});

test('multiple names joined', () => {
  const out = g.greet(['Ali', 'Sara', 'Ravi']);
  assert.match(out, /Ali, Sara & Ravi/);
});

test('config() adds a custom language', () => {
  g.config({ langs: { xx: ['Testish', ['Yo'], ['Yos'], 'Welcome {name}', 'Hi {name}'] } });
  assert.match(g.greet('Ali', { lang: 'xx' }), /Yo/);
  assert.strictEqual(g.langName('xx'), 'Testish');
});

test('config() remaps a country code', () => {
  g.config({ country: { '999': 'fr' } });
  assert.strictEqual(g.phoneToLang('+999111'), 'fr');
});

test('config() changes fallback', () => {
  g.config({ fallback: 'es' });
  assert.strictEqual(g.phoneToLang('+0000'), null); // still null
  const out = g.greet('Ali', { lang: 'zz' });
  assert.match(out, /Ali/); // uses fallback Spanish internally
});

test('upper / lower / emoji / minimal styles', () => {
  const up = g.greet('Ali', { style: 'upper', seed: 1 });
  assert.strictEqual(up, up.toUpperCase());

  const lo = g.greet('Ali', { style: 'lower', seed: 1 });
  assert.strictEqual(lo, lo.toLowerCase());

  const em = g.greet('Ali', { style: 'emoji', seed: 1 });
  assert.match(em, /👋/);

  const mi = g.greet('Ali', { style: 'minimal', seed: 1 });
  assert.doesNotMatch(mi, /Ali/);
});

test('languages() returns 60+ entries', () => {
  assert.ok(g.languages().length >= 60);
});

test('countries() returns 70+ entries', () => {
  assert.ok(Object.keys(g.countries()).length >= 70);
});
test('greetFor() greets by phone number (Pakistan → Urdu)', () => {
  assert.strictEqual(typeof g.greetFor, 'function');
  const out = g.greetFor('Ali', '+923001234567');
  assert.match(out, /Ali/);
  assert.doesNotMatch(out, /Hello/);
});

test('greetFor() lang option beats the phone', () => {
  const out = g.greetFor('Ali', '+923001234567', { lang: 'fr' });
  assert.match(out, /Ali/);
  assert.match(out, /Salut|Coucou/);
});

test('greetFor() passes options through (casual style)', () => {
  const out = g.greetFor('Ali', '+923001234567', { style: 'casual' });
  assert.match(out, /Ali!/);
});

test('greetFor() falls back for an unknown phone', () => {
  const out = g.greetFor('Ali', '+9991234');
  assert.match(out, /Ali/);
});

test('validatePhone() accepts well-formed numbers and returns digits', () => {
  assert.strictEqual(g.validatePhone('+923001234567'), '923001234567');
  assert.strictEqual(g.validatePhone('00923001234567'), '923001234567');
  assert.strictEqual(g.validatePhone(null), null);
  assert.strictEqual(g.validatePhone(undefined), null);
});

test('validatePhone() rejects empty / digit-less / too-short phones', () => {
  assert.throws(() => g.validatePhone(''), /Invalid phone number.*no digits/);
  assert.throws(() => g.validatePhone('abc'), /Invalid phone number.*no digits/);
  assert.throws(() => g.validatePhone('123'), /Invalid phone number.*too short/);
  assert.throws(() => g.validatePhone('+92'), /Invalid phone number.*too short/);
});

test('greet() rejects an invalid phone with a clear error', () => {
  assert.throws(() => g.greet('Ali', { phone: '' }), /Invalid phone number/);
  assert.throws(() => g.greet('Ali', { phone: 'abc' }), /Invalid phone number/);
  assert.throws(() => g.greet('Ali', { phone: '12345' }), /Invalid phone number/);
});

test('greetFor() rejects an invalid phone', () => {
  assert.throws(() => g.greetFor('Ali', ''), /Invalid phone number/);
  assert.throws(() => g.greetFor('Ali', 'not-a-number'), /Invalid phone number/);
});

test('CLI rejects an invalid phone (exit 1 + clear error)', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const cli = path.join(__dirname, '..', 'cli.js');
  const bad = spawnSync('node', [cli, '--name', 'Ali', '--phone', 'abc'], { encoding: 'utf8' });
  assert.notStrictEqual(bad.status, 0);
  assert.match(bad.stderr, /Invalid phone number/);
  const good = spawnSync('node', [cli, '--name', 'Ali', '--phone', '+923001234567', '--seed', '1'], { encoding: 'utf8' });
  assert.strictEqual(good.status, 0);
  assert.match(good.stdout, /Ali/);
});

test('new country mappings (Belize, Guyana, Suriname, Timor-Leste, Brunei, Ivory Coast, Ghana, Angola, Mozambique, Malta)', () => {
  const c = g.countries();
  assert.strictEqual(c['501'], 'en'); // Belize
  assert.strictEqual(c['592'], 'en'); // Guyana
  assert.strictEqual(c['597'], 'nl'); // Suriname (Dutch)
  assert.strictEqual(c['670'], 'pt'); // Timor-Leste (Portuguese)
  assert.strictEqual(c['673'], 'ms'); // Brunei (Malay)
  assert.strictEqual(c['225'], 'fr'); // Ivory Coast (French)
  assert.strictEqual(c['233'], 'en'); // Ghana
  assert.strictEqual(c['244'], 'pt'); // Angola (Portuguese)
  assert.strictEqual(c['258'], 'pt'); // Mozambique (Portuguese)
  assert.strictEqual(c['356'], 'en'); // Malta
  // Behavioural check: greetFor resolves the new prefixes, not the fallback guesswork.
  assert.match(g.greetFor('Ana', '+5971234567', { seed: 1 }), /Ana/);
  assert.match(g.greetFor('Ana', '+2251234567', { seed: 1 }), /Salut|Coucou/);
});

test('greetAll() greets every name, skips blank lines', () => {
  const out = g.greetAll(['Ali', '  ', 'Sara', ''], { lang: 'en', seed: 1 });
  assert.strictEqual(out.length, 2);
  assert.match(out[0], /Ali/);
  assert.match(out[1], /Sara/);
});

test('greetAll() accepts a single string and passes options through', () => {
  const out = g.greetAll('Ali', { lang: 'ur', seed: 1 });
  assert.strictEqual(out.length, 1);
  assert.match(out[0], /Ali/);
  assert.doesNotMatch(out[0], /Hello/);
});

test('greetAll() rejects a non-array, non-string input', () => {
  assert.throws(() => g.greetAll(42), /Names must be/);
});

test('greetAll() honours mode: welcome', () => {
  const out = g.greetAll(['Ali'], { lang: 'en', mode: 'welcome', group: 'Family', seed: 1 });
  assert.strictEqual(out.length, 1);
  assert.match(out[0], /Family/);
});

test('greetInfo() returns name, greeting, lang and mode', () => {
  const info = g.greetInfo('Ali', { lang: 'en', seed: 1 });
  assert.strictEqual(info.name, 'Ali');
  assert.strictEqual(info.lang, 'en');
  assert.strictEqual(info.mode, 'greet');
  assert.match(info.greeting, /Ali/);
});

test('greetInfo() resolves lang from phone and honours mode', () => {
  const info = g.greetInfo('Ali', { phone: '+923001234567', mode: 'welcome', group: 'Family', seed: 1 });
  assert.strictEqual(info.lang, 'ur');
  assert.strictEqual(info.mode, 'welcome');
  assert.match(info.greeting, /Family/);
});

test('greetInfo() rejects an invalid phone', () => {
  assert.throws(() => g.greetInfo('Ali', { phone: 'abc' }), /Invalid phone number/);
});

test('CLI --json prints a parseable object for one name', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const cli = path.join(__dirname, '..', 'cli.js');
  const run = spawnSync('node', [cli, '--name', 'Sara', '--phone', '+14155551234', '--seed', '1', '--json'], { encoding: 'utf8' });
  assert.strictEqual(run.status, 0, run.stderr);
  const obj = JSON.parse(run.stdout);
  assert.strictEqual(obj.name, 'Sara');
  assert.strictEqual(obj.lang, 'en');
  assert.strictEqual(obj.mode, 'greet');
  assert.match(obj.greeting, /Sara/);
});

test('CLI --file --json prints a JSON array, skipping blank lines', () => {
  const { spawnSync } = require('node:child_process');
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const cli = path.join(__dirname, '..', 'cli.js');
  const tmp = path.join(os.tmpdir(), 'gn-json-' + Date.now() + '.txt');
  fs.writeFileSync(tmp, 'Ali\n\nSara\n');
  try {
    const run = spawnSync('node', [cli, '--file', tmp, '--lang', 'en', '--seed', '1', '--json'], { encoding: 'utf8' });
    assert.strictEqual(run.status, 0, run.stderr);
    const arr = JSON.parse(run.stdout);
    assert.strictEqual(arr.length, 2);
    assert.strictEqual(arr[0].name, 'Ali');
    assert.strictEqual(arr[1].name, 'Sara');
    assert.strictEqual(arr[0].lang, 'en');
  } finally {
    fs.unlinkSync(tmp);
  }
});


test('CLI --file greets every name in the file', () => {
  const { spawnSync } = require('node:child_process');
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const cli = path.join(__dirname, '..', 'cli.js');
  const tmp = path.join(os.tmpdir(), 'gn-names-' + Date.now() + '.txt');
  fs.writeFileSync(tmp, 'Ali\n\nSara\n');
  try {
    const run = spawnSync('node', [cli, '--file', tmp, '--lang', 'en', '--seed', '1'], { encoding: 'utf8' });
    assert.strictEqual(run.status, 0, run.stderr);
    assert.match(run.stdout, /Ali/);
    assert.match(run.stdout, /Sara/);
    const missing = spawnSync('node', [cli, '--file', tmp + '.nope'], { encoding: 'utf8' });
    assert.notStrictEqual(missing.status, 0);
    assert.match(missing.stderr, /cannot read file/);
    const empty = path.join(os.tmpdir(), 'gn-empty-' + Date.now() + '.txt');
    fs.writeFileSync(empty, '\n\n');
    const noNames = spawnSync('node', [cli, '--file', empty], { encoding: 'utf8' });
    assert.notStrictEqual(noNames.status, 0);
    assert.match(noNames.stderr, /no names found/);
    fs.unlinkSync(empty);
  } finally {
    fs.unlinkSync(tmp);
  }
});

test('greetRandom greets in a supported language', () => {
  const out = g.greetRandom('Ali');
  assert.match(out, /Ali/);
  const info = g.greetInfo('Ali', { mode: 'random', seed: 7 });
  assert.strictEqual(info.mode, 'random');
  assert.ok(g.languages().includes(info.lang));
  assert.match(info.greeting, /Ali/);
});

test('greetRandom is deterministic with a seed', () => {
  assert.strictEqual(g.greetRandom('Ali', { seed: 7 }), g.greetRandom('Ali', { seed: 7 }));
  assert.strictEqual(g.randomLang(7), g.randomLang(7));
  assert.ok(g.languages().includes(g.randomLang(7)));
});

test('CLI --random flag greets in a random language', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const cli = path.join(__dirname, '..', 'cli.js');
  const run = spawnSync('node', [cli, 'Ali', '--random', '--seed', '7'], { encoding: 'utf8' });
  assert.strictEqual(run.status, 0, run.stderr);
  assert.match(run.stdout, /Ali/);
  const json = spawnSync('node', [cli, 'Ali', '--random', '--seed', '7', '--json'], { encoding: 'utf8' });
  assert.strictEqual(json.status, 0, json.stderr);
  const info = JSON.parse(json.stdout);
  assert.strictEqual(info.mode, 'random');
  assert.ok(g.languages().includes(info.lang));
  assert.match(info.greeting, /Ali/);
  // --random --json reports the same language it greeted in
  const plain = spawnSync('node', [cli, 'Ali', '--random', '--seed', '7'], { encoding: 'utf8' });
  assert.strictEqual(plain.stdout.trim(), info.greeting);
});

test('greetIn() greets in several languages, in order', () => {
  const out = g.greetIn('Ali', ['ur', 'en', 'ar'], { seed: 1 });
  assert.strictEqual(out.length, 3);
  assert.deepStrictEqual(out.map(o => o.lang), ['ur', 'en', 'ar']);
  assert.strictEqual(out[0].mode, 'greet');
  for (const o of out) assert.match(o.greeting, /Ali/);
  assert.match(out[0].greeting, /سلام|ہیلو|آداب/);
  assert.match(out[1].greeting, /Hello|Hi|Hey|Howdy/);
  assert.match(out[2].greeting, /مرحبا|هلا/);
});

test('greetIn() accepts a comma-separated string and honours mode', () => {
  const out = g.greetIn('Ali', 'ur, en', { seed: 1 });
  assert.deepStrictEqual(out.map(o => o.lang), ['ur', 'en']);
  const welcome = g.greetIn('Ali', ['en'], { mode: 'welcome', group: 'Family', seed: 1 });
  assert.strictEqual(welcome.length, 1);
  assert.strictEqual(welcome[0].mode, 'welcome');
  assert.match(welcome[0].greeting, /Welcome Ali/);
  assert.match(welcome[0].greeting, /Family/);
});

test('greetIn() rejects empty / missing language lists', () => {
  assert.throws(() => g.greetIn('Ali', []), /At least one language code/);
  assert.throws(() => g.greetIn('Ali', ''), /At least one language code/);
  assert.throws(() => g.greetIn('Ali'), /At least one language code/);
});

test('CLI --langs prints one greeting per line', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const cli = path.join(__dirname, '..', 'cli.js');
  const run = spawnSync('node', [cli, 'Ali', '--langs', 'ur,en,ar', '--seed', '1'], { encoding: 'utf8' });
  assert.strictEqual(run.status, 0, run.stderr);
  const lines = run.stdout.trim().split('\n');
  assert.strictEqual(lines.length, 3);
  for (const line of lines) assert.match(line, /Ali/);
  assert.match(lines[0], /سلام|ہیلو|آداب/);
  assert.match(lines[1], /Hello|Hi|Hey|Howdy/);
  assert.match(lines[2], /مرحبا|هلا/);
});

test('CLI --langs --json prints a parseable array in order', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const cli = path.join(__dirname, '..', 'cli.js');
  const run = spawnSync('node', [cli, 'Ali', '--langs', 'ur,en', '--seed', '1', '--json'], { encoding: 'utf8' });
  assert.strictEqual(run.status, 0, run.stderr);
  const arr = JSON.parse(run.stdout);
  assert.strictEqual(arr.length, 2);
  assert.deepStrictEqual(arr.map(o => o.lang), ['ur', 'en']);
  assert.strictEqual(arr[0].mode, 'greet');
  assert.match(arr[0].greeting, /Ali/);
  const bad = spawnSync('node', [cli, 'Ali', '--langs', ' , ', '--seed', '1'], { encoding: 'utf8' });
  assert.notStrictEqual(bad.status, 0);
  assert.match(bad.stderr, /--langs needs at least one language code/);
});

test('CLI --file --langs greets each name in each language', () => {
  const { spawnSync } = require('node:child_process');
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const cli = path.join(__dirname, '..', 'cli.js');
  const tmp = path.join(os.tmpdir(), 'gn-langs-' + Date.now() + '.txt');
  fs.writeFileSync(tmp, 'Ali\n\nSara\n');
  try {
    const run = spawnSync('node', [cli, '--file', tmp, '--langs', 'ur,en', '--seed', '1'], { encoding: 'utf8' });
    assert.strictEqual(run.status, 0, run.stderr);
    const lines = run.stdout.trim().split('\n');
    assert.strictEqual(lines.length, 4); // 2 names x 2 languages
    assert.match(lines[0], /Ali/);
    assert.match(lines[2], /Sara/);
  } finally {
    fs.unlinkSync(tmp);
  }
});

test('greetCard() draws a double-bordered box around the greeting', () => {
  const card = g.greetCard('Ali', { lang: 'en', seed: 1 });
  const lines = card.split('\n');
  assert.strictEqual(lines.length, 3);
  assert.match(lines[0], /^╔═+╗$/);
  assert.match(lines[1], /^║ .*Ali.* ║$/);
  assert.match(lines[2], /^╚═+╝$/);
  assert.strictEqual(lines[0].length, lines[1].length);
  assert.strictEqual(lines[0].length, lines[2].length);
});

test('greetCard() adds a subtitle line and widens the box to fit it', () => {
  const card = g.greetCard('Ali', { lang: 'en', seed: 1, subtitle: 'Happy Birthday!' });
  const lines = card.split('\n');
  assert.strictEqual(lines.length, 4);
  assert.match(lines[2], /Happy Birthday!/);
  assert.ok(lines.every(l => l.length === lines[0].length));
});

test('greetCard() honours border styles and falls back to double', () => {
  const single = g.greetCard('Ali', { lang: 'en', seed: 1, border: 'single' });
  assert.match(single.split('\n')[0], /^┌─+┐$/);
  assert.match(single.split('\n')[2], /^└─+┘$/);
  const plain = g.greetCard('Ali', { lang: 'en', seed: 1, border: 'plain' });
  assert.match(plain.split('\n')[0], /^\+-+\+$/);
  assert.match(plain.split('\n')[1], /^\| .*Ali.* \|$/);
  const unknown = g.greetCard('Ali', { lang: 'en', seed: 1, border: 'fancy' });
  assert.match(unknown.split('\n')[0], /^╔═+╗$/);
});

test('greetCard() honours mode and language (welcome in Urdu)', () => {
  const card = g.greetCard('Ali', { phone: '+923001234567', mode: 'welcome', group: 'Family', seed: 1 });
  assert.match(card, /Ali/);
  assert.match(card, /Family/);
  assert.match(card, /خوش آمدید/);
});

test('CLI --card prints a bordered card; --card --json adds a card field', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const cli = path.join(__dirname, '..', 'cli.js');
  const run = spawnSync('node', [cli, 'Ali', '--lang', 'en', '--seed', '1', '--card', '--subtitle', 'Happy Birthday!'], { encoding: 'utf8' });
  assert.strictEqual(run.status, 0, run.stderr);
  assert.match(run.stdout, /╔/);
  assert.match(run.stdout, /Ali/);
  assert.match(run.stdout, /Happy Birthday!/);
  const json = spawnSync('node', [cli, 'Ali', '--lang', 'en', '--seed', '1', '--card', '--json'], { encoding: 'utf8' });
  assert.strictEqual(json.status, 0, json.stderr);
  const obj = JSON.parse(json.stdout);
  assert.match(obj.card, /╔/);
  assert.match(obj.card, /Ali/);
  assert.strictEqual(obj.greeting, obj.card.split('\n')[1].trim().replace(/^║ /, '').replace(/ ║$/, ''));
});

test('eid() greets in Urdu, Arabic and English', () => {
  assert.match(g.eid('Ali', { lang: 'ur' }), /عید مبارک/);
  assert.match(g.eid('Ali', { lang: 'ur' }), /Ali/);
  assert.match(g.eid('Omar', { lang: 'ar' }), /عيد مبارك/);
  assert.strictEqual(g.eid('Sara', { lang: 'en' }), 'Eid Mubarak, Sara! 🌙🎉');
  assert.match(g.eid('Mei', { lang: 'zh' }), /开斋节快乐/);
});

test('ramadan() greets in Arabic and falls back to English for other languages', () => {
  assert.match(g.ramadan('Omar', { lang: 'ar' }), /رمضان مبارك/);
  assert.match(g.ramadan('Ali', { lang: 'ur' }), /رمضان مبارک/);
  assert.strictEqual(g.ramadan('Sara', { lang: 'en' }), 'Ramadan Mubarak, Sara! 🌙');
  // A language without extras falls back to the English extras.
  assert.strictEqual(g.ramadan('Sara', { lang: 'xx' }), 'Ramadan Mubarak, Sara! 🌙');
  assert.strictEqual(g.eid('Sara', { lang: 'xx' }), 'Eid Mubarak, Sara! 🌙🎉');
});

test('greetInfo() honours mode eid and ramadan', () => {
  const eidInfo = g.greetInfo('Ali', { lang: 'ur', mode: 'eid' });
  assert.strictEqual(eidInfo.lang, 'ur');
  assert.strictEqual(eidInfo.mode, 'eid');
  assert.match(eidInfo.greeting, /عید مبارک/);
  const ramadanInfo = g.greetInfo('Ali', { phone: '+923001234567', mode: 'ramadan' });
  assert.strictEqual(ramadanInfo.lang, 'ur');
  assert.strictEqual(ramadanInfo.mode, 'ramadan');
  assert.match(ramadanInfo.greeting, /رمضان مبارک/);
  // greetIn honours the new modes too.
  const multi = g.greetIn('Ali', ['ur', 'en'], { mode: 'eid' });
  assert.strictEqual(multi.length, 2);
  assert.match(multi[0].greeting, /عید مبارک/);
  assert.strictEqual(multi[1].greeting, 'Eid Mubarak, Ali! 🌙🎉');
});

test('CLI --mode eid and --mode ramadan print the greeting', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const cli = path.join(__dirname, '..', 'cli.js');
  const eid = spawnSync('node', [cli, 'Ali', '--mode', 'eid', '--phone', '+923001234567'], { encoding: 'utf8' });
  assert.strictEqual(eid.status, 0, eid.stderr);
  assert.match(eid.stdout, /عید مبارک/);
  const ramadan = spawnSync('node', [cli, 'Sara', '--mode', 'ramadan', '--lang', 'ar'], { encoding: 'utf8' });
  assert.strictEqual(ramadan.status, 0, ramadan.stderr);
  assert.match(ramadan.stdout, /رمضان مبارك/);
});

test('newyear() greets in Urdu, Arabic and English', () => {
  assert.match(g.newyear('Ali', { lang: 'ur' }), /نیا سال مبارک/);
  assert.match(g.newyear('Ali', { lang: 'ur' }), /Ali/);
  assert.match(g.newyear('Omar', { lang: 'ar' }), /سنة جديدة سعيدة/);
  assert.strictEqual(g.newyear('Sara', { lang: 'en' }), 'Happy New Year, Sara! 🎉🥂');
  assert.match(g.newyear('Mei', { lang: 'zh' }), /新年快乐/);
});

test('anniversary() greets in French and falls back to English for other languages', () => {
  assert.match(g.anniversary('Sara', { lang: 'fr' }), /Joyeux anniversaire de mariage/);
  assert.match(g.anniversary('Ali', { lang: 'ur' }), /شادی کی سالگرہ مبارک/);
  assert.strictEqual(g.anniversary('Sara', { lang: 'en' }), 'Happy Anniversary, Sara! 💐🎉');
  // A language without extras falls back to the English extras.
  assert.strictEqual(g.anniversary('Sara', { lang: 'xx' }), 'Happy Anniversary, Sara! 💐🎉');
  assert.strictEqual(g.newyear('Sara', { lang: 'xx' }), 'Happy New Year, Sara! 🎉🥂');
});

test('greetInfo() honours mode newyear and anniversary', () => {
  const newyearInfo = g.greetInfo('Ali', { lang: 'ur', mode: 'newyear' });
  assert.strictEqual(newyearInfo.lang, 'ur');
  assert.strictEqual(newyearInfo.mode, 'newyear');
  assert.match(newyearInfo.greeting, /نیا سال مبارک/);
  const anniversaryInfo = g.greetInfo('Ali', { phone: '+923001234567', mode: 'anniversary' });
  assert.strictEqual(anniversaryInfo.lang, 'ur');
  assert.strictEqual(anniversaryInfo.mode, 'anniversary');
  assert.match(anniversaryInfo.greeting, /شادی کی سالگرہ مبارک/);
  // greetIn honours the new modes too.
  const multi = g.greetIn('Ali', ['ur', 'en'], { mode: 'newyear' });
  assert.strictEqual(multi.length, 2);
  assert.match(multi[0].greeting, /نیا سال مبارک/);
  assert.strictEqual(multi[1].greeting, 'Happy New Year, Ali! 🎉🥂');
});

test('CLI --mode newyear and --mode anniversary print the greeting', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const cli = path.join(__dirname, '..', 'cli.js');
  const newyear = spawnSync('node', [cli, 'Ali', '--mode', 'newyear', '--phone', '+923001234567'], { encoding: 'utf8' });
  assert.strictEqual(newyear.status, 0, newyear.stderr);
  assert.match(newyear.stdout, /نیا سال مبارک/);
  const anniversary = spawnSync('node', [cli, 'Sara', '--mode', 'anniversary', '--lang', 'fr'], { encoding: 'utf8' });
  assert.strictEqual(anniversary.status, 0, anniversary.stderr);
  assert.match(anniversary.stdout, /Joyeux anniversaire de mariage/);
});

test('wedding() greets in Urdu, Arabic and English', () => {
  assert.match(g.wedding('Ali', { lang: 'ur' }), /شادی مبارک/);
  assert.match(g.wedding('Ali', { lang: 'ur' }), /Ali/);
  assert.match(g.wedding('Omar', { lang: 'ar' }), /تهانينا على زواجك/);
  assert.strictEqual(g.wedding('Sara', { lang: 'en' }), 'Congratulations on your wedding, Sara! 💍🎉');
  assert.match(g.wedding('Mei', { lang: 'zh' }), /新婚快乐/);
});

test('graduation() greets in French and falls back to English for other languages', () => {
  assert.match(g.graduation('Sara', { lang: 'fr' }), /Félicitations pour ton diplôme/);
  assert.match(g.graduation('Ali', { lang: 'ur' }), /گریجویشن مبارک/);
  assert.strictEqual(g.graduation('Sara', { lang: 'en' }), 'Congratulations on your graduation, Sara! 🎓🎉');
  // A language without extras falls back to the English extras.
  assert.strictEqual(g.graduation('Sara', { lang: 'xx' }), 'Congratulations on your graduation, Sara! 🎓🎉');
  assert.strictEqual(g.wedding('Sara', { lang: 'xx' }), 'Congratulations on your wedding, Sara! 💍🎉');
});

test('greetInfo() honours mode wedding and graduation', () => {
  const weddingInfo = g.greetInfo('Ali', { lang: 'ur', mode: 'wedding' });
  assert.strictEqual(weddingInfo.lang, 'ur');
  assert.strictEqual(weddingInfo.mode, 'wedding');
  assert.match(weddingInfo.greeting, /شادی مبارک/);
  const graduationInfo = g.greetInfo('Ali', { phone: '+923001234567', mode: 'graduation' });
  assert.strictEqual(graduationInfo.lang, 'ur');
  assert.strictEqual(graduationInfo.mode, 'graduation');
  assert.match(graduationInfo.greeting, /گریجویشن مبارک/);
  // greetIn honours the new modes too.
  const multi = g.greetIn('Ali', ['ur', 'en'], { mode: 'wedding' });
  assert.strictEqual(multi.length, 2);
  assert.match(multi[0].greeting, /شادی مبارک/);
  assert.strictEqual(multi[1].greeting, 'Congratulations on your wedding, Ali! 💍🎉');
});

test('CLI --mode wedding and --mode graduation print the greeting', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const cli = path.join(__dirname, '..', 'cli.js');
  const wedding = spawnSync('node', [cli, 'Ali', '--mode', 'wedding', '--phone', '+923001234567'], { encoding: 'utf8' });
  assert.strictEqual(wedding.status, 0, wedding.stderr);
  assert.match(wedding.stdout, /شادی مبارک/);
  const graduation = spawnSync('node', [cli, 'Sara', '--mode', 'graduation', '--lang', 'en'], { encoding: 'utf8' });
  assert.strictEqual(graduation.status, 0, graduation.stderr);
  assert.match(graduation.stdout, /Congratulations on your graduation, Sara! 🎓🎉/);
});

test('getwell() greets in Urdu, Arabic and English', () => {
  assert.match(g.getwell('Ali', { lang: 'ur' }), /جلد صحت یاب ہو/);
  assert.match(g.getwell('Ali', { lang: 'ur' }), /Ali/);
  assert.match(g.getwell('Omar', { lang: 'ar' }), /شفاك الله/);
  assert.strictEqual(g.getwell('Sara', { lang: 'en' }), 'Get well soon, Sara! 🌸');
  assert.match(g.getwell('Mei', { lang: 'zh' }), /早日康复/);
});

test('goodluck() greets in French and falls back to English for other languages', () => {
  assert.match(g.goodluck('Sara', { lang: 'fr' }), /Bonne chance/);
  assert.match(g.goodluck('Ali', { lang: 'ur' }), /نیک تمنائیں/);
  assert.strictEqual(g.goodluck('Sara', { lang: 'en' }), 'Good luck, Sara! 🍀');
  // A language without extras falls back to the English extras.
  assert.strictEqual(g.goodluck('Sara', { lang: 'xx' }), 'Good luck, Sara! 🍀');
  assert.strictEqual(g.getwell('Sara', { lang: 'xx' }), 'Get well soon, Sara! 🌸');
});

test('greetInfo() honours mode getwell and goodluck', () => {
  const getwellInfo = g.greetInfo('Ali', { lang: 'ur', mode: 'getwell' });
  assert.strictEqual(getwellInfo.lang, 'ur');
  assert.strictEqual(getwellInfo.mode, 'getwell');
  assert.match(getwellInfo.greeting, /جلد صحت یاب ہو/);
  const goodluckInfo = g.greetInfo('Ali', { phone: '+923001234567', mode: 'goodluck' });
  assert.strictEqual(goodluckInfo.lang, 'ur');
  assert.strictEqual(goodluckInfo.mode, 'goodluck');
  assert.match(goodluckInfo.greeting, /نیک تمنائیں/);
  // greetIn honours the new modes too.
  const multi = g.greetIn('Ali', ['ur', 'en'], { mode: 'getwell' });
  assert.strictEqual(multi.length, 2);
  assert.match(multi[0].greeting, /جلد صحت یاب ہو/);
  assert.strictEqual(multi[1].greeting, 'Get well soon, Ali! 🌸');
});

test('CLI --mode getwell and --mode goodluck print the greeting', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const cli = path.join(__dirname, '..', 'cli.js');
  const getwell = spawnSync('node', [cli, 'Ali', '--mode', 'getwell', '--phone', '+923001234567'], { encoding: 'utf8' });
  assert.strictEqual(getwell.status, 0, getwell.stderr);
  assert.match(getwell.stdout, /جلد صحت یاب ہو/);
  const goodluck = spawnSync('node', [cli, 'Sara', '--mode', 'goodluck', '--lang', 'fr'], { encoding: 'utf8' });
  assert.strictEqual(goodluck.status, 0, goodluck.stderr);
  assert.match(goodluck.stdout, /Bonne chance, Sara ! 🍀/);
});
