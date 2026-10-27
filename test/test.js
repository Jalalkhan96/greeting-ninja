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
