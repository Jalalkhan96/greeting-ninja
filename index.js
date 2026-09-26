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

// ─── resolve lang from options ───
function resolveLang(opts = {}) {
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
  welcome,
  first,
  phoneToLang,
  config,
  languages,
  countries,
  langName,
  default: greet
};