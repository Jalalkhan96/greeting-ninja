#!/usr/bin/env node
'use strict';
const g = require('./index');

const argv = process.argv.slice(2);
const flags = {};
const args = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) {
    const k = a.slice(2);
    if (['help', 'list-langs', 'list-countries', 'json', 'random', 'card'].includes(k)) flags[k] = true;
    else flags[k] = argv[++i];
  } else args.push(a);
}

const showHelp = flags.help || (!args.length && !flags.name && !flags.file && !flags.json && !flags.random && !flags.card && !flags.langs && !flags['list-langs'] && !flags['list-countries']);

if (showHelp) {
  console.log(`greet-ninja — greet anyone in their own language 🥷

Usage:
  greet-ninja <name> [options]
  greet-ninja --name <name> [options]

Options:
  --name <name>        Name to greet (alternative to the positional <name>)
  --file <path>        Greet every name in a text file (one per line)
  --phone <number>     Auto-detect language from WhatsApp number
  --lang <code>        Force a language (en, ur, hi, ar, ja…)
  --langs <codes>      Greet in several languages at once, e.g. ur,en,ar (one greeting per line)
  --style <name>       formal | casual | emoji | upper | lower | minimal
  --mode <type>        greet (default) | welcome | first | time | farewell | thank | birthday | congrats | eid | ramadan | newyear | anniversary
  --hour <0-23>        Hour for --mode time (default: current hour)
  --group <name>       Group name for welcome mode
  --seed <number>      Deterministic output
  --random             Greet in a random supported language (seedable with --seed)
  --card               Print the greeting inside a bordered card
  --subtitle <text>    Extra line inside the card (single greeting)
  --border <style>     Card frame: double (default) | single | plain
  --json               Output as JSON (single object, or an array with --file)
  --list-langs         Show all languages
  --list-countries     Show country → language mappings
  --help               Show this help

Examples:
  greet-ninja Ali
  greet-ninja --name Ali --phone +923001234567
  greet-ninja Ali --phone +923001234567
  greet-ninja Sara --mode welcome --phone +923001234567 --group "Family"
  greet-ninja Yuki --mode first --phone +819012345678
  greet-ninja Ahmed --phone +201234567890 --style formal
  greet-ninja --file names.txt --lang ur
  greet-ninja --file names.txt --mode welcome --group "Family"
  greet-ninja Ali --random
  greet-ninja Ali --random --seed 7 --json
  greet-ninja Ali --langs ur,en,ar --seed 1
  greet-ninja Ali --langs ur,en --json
  greet-ninja Ali --card --subtitle "Happy Birthday!"
  greet-ninja Ali --mode birthday --card --border single
  greet-ninja Ali --mode eid --phone +923001234567
  greet-ninja Sara --mode ramadan --lang ar
  greet-ninja Ali --mode newyear --phone +923001234567
  greet-ninja Sara --mode anniversary --lang fr
`);
  process.exit(0);
}

if (flags['list-langs']) {
  console.log('🌍 Languages:\n');
  for (const code of g.languages()) console.log(`  ${code.padEnd(4)} ${g.langName(code)}`);
  console.log(`\n  Total: ${g.languages().length}`);
  process.exit(0);
}

if (flags['list-countries']) {
  console.log('📞 Country → language:\n');
  const c = g.countries();
  for (const [k, v] of Object.entries(c)) console.log(`  +${k.padEnd(5)} → ${v.padEnd(3)} ${g.langName(v)}`);
  console.log(`\n  Total: ${Object.keys(c).length}`);
  process.exit(0);
}

const name = flags.name || args[0];
const opts = {
  lang: flags.lang,
  phone: flags.phone,
  style: flags.style,
  group: flags.group,
  subtitle: flags.subtitle,
  border: flags.border,
  seed: flags.seed !== undefined ? Number(flags.seed) : undefined
};
for (const k of Object.keys(opts)) if (opts[k] === undefined) delete opts[k];

const mode = flags.random ? 'random' : (flags.mode || 'greet');
const langs = flags.langs !== undefined
  ? String(flags.langs).split(',').map(s => s.trim()).filter(Boolean)
  : null;
if (flags.langs !== undefined && !langs.length) {
  console.error('Error: --langs needs at least one language code, e.g. --langs ur,en,ar');
  process.exit(1);
}
const MODE_FNS = {
  greet: g.greet, welcome: g.welcome, first: g.first, time: g.timeGreet,
  farewell: g.farewell, thank: g.thank, birthday: g.birthday, congrats: g.congrats,
  eid: g.eid, ramadan: g.ramadan, newyear: g.newyear, anniversary: g.anniversary,
  random: g.greetRandom
};
const fn = MODE_FNS[mode] || g.greet;
if (flags.hour !== undefined) opts.hour = Number(flags.hour);

// Batch mode: greet every name in a text file, one greeting per line.
if (flags.file) {
  const fs = require('node:fs');
  let text;
  try {
    text = fs.readFileSync(flags.file, 'utf8');
  } catch (err) {
    console.error('Error: cannot read file "' + flags.file + '": ' + err.message);
    process.exit(1);
  }
  try {
    const names = text.split(/\r?\n/);
    const clean = names.map(n => (typeof n === 'string' ? n.trim() : n)).filter(n => n);
    if (flags.json) {
      const out = langs
        ? clean.flatMap(n => g.greetIn(n, langs, { ...opts, mode }))
        : clean.map(n => g.greetInfo(n, { ...opts, mode }));
      if (!out.length) {
        console.error('Error: no names found in "' + flags.file + '"');
        process.exit(1);
      }
      console.log(JSON.stringify(flags.card
        ? out.map(o => ({ ...o, card: g.frameText([o.greeting], opts.border) }))
        : out));
    } else {
      const out = langs
        ? clean.flatMap(n => g.greetIn(n, langs, { ...opts, mode }).map(o => o.greeting))
        : g.greetAll(names, { ...opts, mode });
      if (!out.length) {
        console.error('Error: no names found in "' + flags.file + '"');
        process.exit(1);
      }
      console.log(flags.card
        ? out.map(t => g.frameText([t], opts.border)).join('\n\n')
        : out.join('\n'));
    }
  } catch (err) {
    console.error('Error: ' + err.message);
    process.exit(1);
  }
  process.exit(0);
}

try {
  if (langs) {
    const out = g.greetIn(name, langs, { ...opts, mode });
    if (flags.json) console.log(JSON.stringify(flags.card ? out.map(o => ({ ...o, card: g.frameText([o.greeting], opts.border) })) : out));
    else if (flags.card) console.log(out.map(o => g.frameText([o.greeting], opts.border)).join('\n\n'));
    else console.log(out.map(o => o.greeting).join('\n'));
  } else if (flags.json) {
    const info = g.greetInfo(name, { ...opts, mode });
    console.log(JSON.stringify(flags.card ? { ...info, card: g.greetCard(name, { ...opts, mode }) } : info));
  } else if (flags.card) console.log(g.greetCard(name, { ...opts, mode }));
  else console.log(fn(name, opts));
} catch (err) {
  console.error('Error: ' + err.message);
  process.exit(1);
}