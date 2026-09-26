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
    if (['help', 'list-langs', 'list-countries'].includes(k)) flags[k] = true;
    else flags[k] = argv[++i];
  } else args.push(a);
}

const showHelp = flags.help || (!args.length && !flags['list-langs'] && !flags['list-countries']);

if (showHelp) {
  console.log(`greet-ninja — greet anyone in their own language 🥷

Usage:
  greet-ninja <name> [options]

Options:
  --phone <number>     Auto-detect language from WhatsApp number
  --lang <code>        Force a language (en, ur, hi, ar, ja…)
  --style <name>       formal | casual | emoji | upper | lower | minimal
  --mode <type>        greet (default) | welcome | first
  --group <name>       Group name for welcome mode
  --seed <number>      Deterministic output
  --list-langs         Show all languages
  --list-countries     Show country → language mappings
  --help               Show this help

Examples:
  greet-ninja Ali
  greet-ninja Ali --phone +923001234567
  greet-ninja Sara --mode welcome --phone +923001234567 --group "Family"
  greet-ninja Yuki --mode first --phone +819012345678
  greet-ninja Ahmed --phone +201234567890 --style formal
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

const name = args[0];
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
console.log(fn(name, opts));