'use strict';
const { L, C } = require('./data');
const { X } = require('./extras');

const state = {
  langs: { ...L },
  country: { ...C },
  fallback: 'en'
};

// ─── helpers ───
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (arr, rng) => arr[Math.floor((rng ? rng() : Math.random()) * arr.length)];
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

function normName(name) {
  if (Array.isArray(name)) {
    if (!name.length) throw new Error('Name required');
    return name.length === 1
      ? name[0]
      : name.slice(0, -1).join(', ') + ' & ' + name[name.length - 1];
  }
  if (!name || typeof name !== 'string') throw new Error('Name required');
  return name;
}

function phoneToLang(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;

  // Strip international prefix "00" (common in Europe, Asia, Africa)
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (!digits) return null;

  for (let len = 3; len >= 1; len--) {
    const prefix = digits.slice(0, len);
    if (state.country[prefix]) return state.country[prefix];
  }
  return null;
}

// ─── phone validation ───
// validatePhone(phone): reject an explicitly supplied phone number that
// has no digits or is too short to be real. Returns the digit string.
// undefined/null (no phone given) returns null — callers fall back to
// the default language. Unknown-but-well-formed prefixes (e.g. +999)
// are NOT rejected here; phoneToLang returns null for those and the
// caller falls back, as before.
function validatePhone(phone) {
  if (phone === undefined || phone === null) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (!digits) throw new Error('Invalid phone number: "' + phone + '" has no digits — pass a full international number like +923001234567');
  if (digits.length < 7) throw new Error('Invalid phone number: "' + phone + '" is too short (' + digits.length + ' digits) — pass a full international number like +923001234567');
  return digits;
}

// ─── resolve lang from options ───
function resolveLang(opts = {}) {
  if (opts.phone !== undefined && opts.phone !== null) validatePhone(opts.phone);
  return (
    opts.lang ||
    (opts.phone && phoneToLang(opts.phone)) ||
    state.fallback
  );
}

function langData(code) {
  return state.langs[code] || state.langs[state.fallback];
}

// ─── main APIs ───

function greet(name, options = {}) {
  if (typeof options === 'string') options = { lang: options };
  name = normName(name);

  const lang = resolveLang(options);
  const data = langData(lang);
  const [, hi, formal] = data;

  const rng = options.seed !== undefined ? mulberry32(options.seed) : null;
  const pool = options.style === 'formal' ? formal : hi;
  const word = pick(pool, rng);

  switch (options.style) {
    case 'upper':   return `${word}, ${name}`.toUpperCase();
    case 'lower':   return `${word}, ${name}`.toLowerCase();
    case 'emoji':   return `${word}, ${name} 👋`;
    case 'minimal': return word;
    case 'casual':  return `${word}, ${name}!`;
    default:        return `${word}, ${name}`;
  }
}

// greetFor(name, phone): greet by phone number without building an
// options object — language is auto-detected via phoneToLang, and an
// optional third argument passes through any greet() option (lang,
// style, seed, ...). An explicit lang option still beats the phone.
function greetFor(name, phone, options = {}) {
  if (typeof options === 'string') options = { lang: options };
  return greet(name, { ...options, phone: phone ?? options.phone });
}

// greetAll(names, options): greet a list of names (e.g. read from a file,
// one name per line). Blank lines and surrounding whitespace are skipped;
// a single string counts as one name. options.mode picks the greeting
// ('greet' | 'welcome' | 'first'); every other option passes through to
// greet()/welcome()/first() unchanged. Returns one greeting per name,
// in the same order.
function greetAll(names, options = {}) {
  if (typeof names === 'string') names = [names];
  if (!Array.isArray(names)) throw new Error('Names must be an array or a string');
  const mode = options.mode || 'greet';
  const fn = (typeof MODES !== 'undefined' && MODES[mode]) || (mode === 'welcome' ? welcome : mode === 'first' ? first : greet);
  return names
    .map(n => (typeof n === 'string' ? n.trim() : n))
    .filter(n => n)
    .map(n => fn(n, options));
}

// greetIn(name, langs, options): greet the same person in several
// languages at once — one greeting per language, each tagged with its
// lang code, in the order given. langs is an array of codes or a
// comma-separated string ("ur,en,ar"). options.mode picks the greeting
// ('greet' | 'welcome' | 'first' | 'time' | ...); 'random' is treated as
// 'greet' here, since the languages are given explicitly. Unknown codes
// fall back to English, like greet(). Returns
// [{ lang, greeting, mode }, ...].
function greetIn(name, langs, options = {}) {
  if (typeof langs === 'string') langs = langs.split(',').map(s => s.trim()).filter(Boolean);
  if (!Array.isArray(langs) || !langs.length) throw new Error('At least one language code is required — pass e.g. greetIn("Ali", ["ur", "en"])');
  const opts = { ...options };
  if (opts.mode === 'random') opts.mode = 'greet';
  return langs.map(code => {
    const info = greetInfo(name, { ...opts, lang: code });
    return { lang: info.lang, greeting: info.greeting, mode: info.mode };
  });
}

function welcome(name, options = {}) {
  if (typeof options === 'string') options = { lang: options };
  name = normName(name);

  const lang = resolveLang(options);
  const data = langData(lang);
  const line = fill(data[3], { name });
  return options.group
    ? `${line}\n🎉 Welcome to *${options.group}*!`
    : line;
}

function first(name, options = {}) {
  if (typeof options === 'string') options = { lang: options };
  name = normName(name);

  const lang = resolveLang(options);
  return fill(langData(lang)[4], { name });
}

// ─── v4: time-of-day + occasion messages ───
// Data lives in extras.js for the most-used languages; other languages
// fall back to the English extras (core greetings still cover 61 langs).

function extrasFor(opts = {}) {
  const lang = resolveLang(opts);
  return { lang, x: X[lang] || X.en };
}

function dayPart(hour) {
  const h = ((Number(hour) % 24) + 24) % 24;
  if (h >= 5 && h < 12) return 0;   // morning
  if (h >= 12 && h < 17) return 1;  // afternoon
  if (h >= 17 && h < 21) return 2;  // evening
  return 3;                          // night
}

// timeGreet(name, options): "Good morning, Ali" in the user's language.
// options.hour (0-23) or options.date (Date) pick the part of day;
// default is the current local hour. Combine with phone like greet().
function timeGreet(name, options = {}) {
  if (typeof options === 'string') options = { lang: options };
  name = normName(name);
  const { x } = extrasFor(options);
  const hour = options.hour !== undefined
    ? options.hour
    : (options.date instanceof Date ? options.date.getHours() : new Date().getHours());
  return `${x[dayPart(hour)]}, ${name}`;
}

function occasion(name, options, idx) {
  if (typeof options === 'string') options = { lang: options };
  name = normName(name);
  const { x } = extrasFor(options);
  return fill(x[idx], { name });
}

// farewell(name, options) / thank(name, options) /
// birthday(name, options) / congrats(name, options)
function farewell(name, options = {}) { return occasion(name, options, 4); }
function thank(name, options = {}) { return occasion(name, options, 5); }
function birthday(name, options = {}) { return occasion(name, options, 6); }
function congrats(name, options = {}) { return occasion(name, options, 7); }

const MODES = { greet, welcome, first, time: timeGreet, farewell, thank, birthday, congrats, random: greetRandom };

// randomLang(seed): pick one supported language code at random.
// options.seed makes the pick deterministic (same seed → same language).
function randomLang(seed) {
  const rng = seed !== undefined ? mulberry32(seed) : null;
  return pick(languages(), rng);
}

// greetRandom(name, options): greet in a random supported language.
// options.seed makes the language pick deterministic; options.style
// still applies. An explicit options.lang is ignored — the point is
// random — use greet() when the language is known.
function greetRandom(name, options = {}) {
  return greet(name, { ...options, lang: randomLang(options.seed) });
}

// greetInfo(name, options): machine-readable form of a greeting — the
// greeting text plus the resolved language and mode, for scripts and
// pipelines (see the CLI --json flag). options.mode picks the greeting
// ('greet' | 'welcome' | 'first' | 'time' | 'farewell' | 'thank' |
// 'birthday' | 'congrats' | 'random'); every other option passes through unchanged.
function greetInfo(name, options = {}) {
  const mode = options.mode || 'greet';
  if (mode === 'random') {
    // Pick the language once and use it for both the greeting and the
    // reported lang, so --json never reports a different language than
    // the one actually greeted in.
    const lang = randomLang(options.seed);
    return {
      name: normName(name),
      greeting: greet(name, { ...options, lang }),
      lang,
      mode
    };
  }
  const fn = MODES[mode] || greet;
  return {
    name: normName(name),
    greeting: fn(name, options),
    lang: resolveLang(options),
    mode
  };
}

// ─── v4: WhatsApp / Baileys helpers ───
// forWhatsApp(name, options): a sendMessage-ready payload object.
//   const p = g.forWhatsApp('Ali', { phone: '+92...', mode: 'welcome', group: 'Team' });
//   await sock.sendMessage(jid, p.payload);
// options.mentions (array of JIDs) is passed through when given.
function forWhatsApp(name, options = {}) {
  const info = greetInfo(name, options);
  const payload = { text: info.greeting };
  if (Array.isArray(options.mentions) && options.mentions.length) {
    payload.mentions = options.mentions;
  }
  return { ...info, payload };
}

// ─── customization ───

function config(opts = {}) {
  if (opts.langs) Object.assign(state.langs, opts.langs);
  if (opts.country) Object.assign(state.country, opts.country);
  if (opts.fallback) state.fallback = opts.fallback;
  return state;
}

function languages() { return Object.keys(state.langs); }
function countries() { return { ...state.country }; }
function langName(code) { return state.langs[code]?.[0] || code; }

module.exports = {
  greet,
  greetFor,
  greetAll,
  greetIn,
  greetInfo,
  greetRandom,
  randomLang,
  welcome,
  first,
  timeGreet,
  farewell,
  thank,
  birthday,
  congrats,
  forWhatsApp,
  phoneToLang,
  validatePhone,
  config,
  languages,
  countries,
  langName,
  default: greet
};