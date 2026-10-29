'use strict';
const { L, C } = require('./data');

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
  welcome,
  first,
  phoneToLang,
  validatePhone,
  config,
  languages,
  countries,
  langName,
  default: greet
};