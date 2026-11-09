'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const g = require('../index');

test('v4: timeGreet morning in Urdu via phone', () => {
  const out = g.timeGreet('Ali', { phone: '+923001234567', hour: 9 });
  assert.match(out, /Ali/);
  assert.match(out, /صبح بخیر/);
});

test('v4: timeGreet day parts (en)', () => {
  assert.match(g.timeGreet('Ali', { hour: 8 }), /Good morning/);
  assert.match(g.timeGreet('Ali', { hour: 14 }), /Good afternoon/);
  assert.match(g.timeGreet('Ali', { hour: 19 }), /Good evening/);
  assert.match(g.timeGreet('Ali', { hour: 23 }), /Good night/);
  assert.match(g.timeGreet('Ali', { hour: 2 }), /Good night/);
});

test('v4: timeGreet wraps hours safely', () => {
  assert.match(g.timeGreet('Ali', { hour: 26 }), /Good night/); // 26 -> 2
  assert.match(g.timeGreet('Ali', { hour: -3 }), /Good night/); // -3 -> 21 -> night
});

test('v4: farewell / thank / birthday / congrats (en + ur)', () => {
  assert.match(g.farewell('Ali'), /Goodbye Ali/);
  assert.match(g.thank('Ali'), /Thank you, Ali/);
  assert.match(g.birthday('Ali'), /Happy Birthday, Ali/);
  assert.match(g.congrats('Ali'), /Congratulations, Ali/);
  assert.match(g.birthday('Ali', { phone: '+923001234567' }), /سالگرہ مبارک/);
  assert.match(g.farewell('Ali', { phone: '+923001234567' }), /اللہ حافظ/);
});

test('v4: extras fall back to English for uncovered language', () => {
  // Swahili is covered; use a data.js-only language e.g. Icelandic (is)
  const out = g.birthday('Jon', { lang: 'is' });
  assert.match(out, /Happy Birthday, Jon/);
});

test('v4: greetInfo supports new modes', () => {
  const info = g.greetInfo('Ali', { mode: 'birthday', phone: '+923001234567' });
  assert.strictEqual(info.mode, 'birthday');
  assert.strictEqual(info.lang, 'ur');
  assert.match(info.greeting, /Ali/);
  const t = g.greetInfo('Ali', { mode: 'time', hour: 8 });
  assert.match(t.greeting, /Good morning/);
});

test('v4: greetAll supports time mode', () => {
  const out = g.greetAll(['Ali', 'Sara'], { mode: 'time', hour: 8 });
  assert.strictEqual(out.length, 2);
  assert.match(out[0], /Good morning, Ali/);
});

test('v4: forWhatsApp returns sendMessage-ready payload', () => {
  const r = g.forWhatsApp('Ali', { phone: '+923001234567', mode: 'welcome', group: 'Team ABIX' });
  assert.ok(r.payload && typeof r.payload.text === 'string');
  assert.match(r.payload.text, /Ali/);
  assert.strictEqual(r.lang, 'ur');
  const m = g.forWhatsApp('Ali', { mentions: ['923001234567@s.whatsapp.net'] });
  assert.deepStrictEqual(m.payload.mentions, ['923001234567@s.whatsapp.net']);
});
