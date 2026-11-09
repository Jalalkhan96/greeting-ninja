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
    if (['help', 'list-langs', 'list-countries', 'json'].includes(k)) flags[k] = true;
    else flags[k] = argv[++i];
  } else args.push(a);
}

const showHelp = flags.help || (!args.length && !flags.name && !flags.file && !flags.json && !flags['list-langs'] && !flags['list-countries']);

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
  --style <name>       formal | casual | emoji | upper | lower | minimal
  --mode <type>        greet (default) | welcome | first
  --group <name>       Group name for welcome mode
  --seed <number>      Deterministic output
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
  seed: flags.seed !== undefined ? Number(flags.seed) : undefined
};
for (const k of Object.keys(opts)) if (opts[k] === undefined) delete opts[k];

const mode = flags.mode || 'greet';
const fn = mode === 'welcome' ? g.welcome : mode === 'first' ? g.first : g.greet;

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
    if (flags.json) {
      const out = names
        .map(n => (typeof n === 'string' ? n.trim() : n))
        .filter(n => n)
        .map(n => g.greetInfo(n, { ...opts, mode }));
      if (!out.length) {
        console.error('Error: no names found in "' + flags.file + '"');
        process.exit(1);
      }
      console.log(JSON.stringify(out));
    } else {
      const out = g.greetAll(names, { ...opts, mode });
      if (!out.length) {
        console.error('Error: no names found in "' + flags.file + '"');
        process.exit(1);
      }
      console.log(out.join('\n'));
    }
  } catch (err) {
    console.error('Error: ' + err.message);
    process.exit(1);
  }
  process.exit(0);
}

try {
  if (flags.json) console.log(JSON.stringify(g.greetInfo(name, { ...opts, mode })));
  else console.log(fn(name, opts));
} catch (err) {
  console.error('Error: ' + err.message);
  process.exit(1);
}