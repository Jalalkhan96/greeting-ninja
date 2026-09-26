<div align="center">

# 🥷 greeting-ninja

**Auto-greet WhatsApp users in their own language — based on their phone number.**

[![npm version](https://img.shields.io/npm/v/greeting-ninja.svg)](https://www.npmjs.com/package/greeting-ninja)
[![npm downloads](https://img.shields.io/npm/dm/greeting-ninja.svg)](https://www.npmjs.com/package/greeting-ninja)
[![license](https://img.shields.io/npm/l/greeting-ninja.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/greeting-ninja.svg)](https://nodejs.org)

**61 languages · 80+ country codes · Zero dependencies · ~7 KB**

Made with ❤️ by **[TEAM ABIX](https://github.com/Jalalkhan96)**

</div>

---

## ✨ Why

Most WhatsApp bots greet every user with "Hello" — even when the number is `+92` (Pakistan), `+81` (Japan), or `+20` (Egypt). That looks robotic.

**greeting-ninja** reads the phone number, detects the country, and greets in the recipient's native language.

```javascript
const g = require('greeting-ninja');

g.greet('Ali',   { phone: '+923001234567' });   // "سلام, Ali"
g.greet('Yuki',  { phone: '+819012345678' });   // "こんにちは, Yuki"
g.greet('Marco', { phone: '+393331234567' });   // "Ciao, Marco"
g.greet('Ahmed', { phone: '+201234567890' });   // "مرحبا, Ahmed"
```

Every call picks a *different* greeting from the language pool — so your bot feels human, not copy-pasted.

---

## 📥 Install

```bash
npm install greeting-ninja
```

Zero runtime dependencies. Works in Node.js 16+.

---

## 🚀 Quick Start

```javascript
const g = require('greeting-ninja');

// ─── Basic — auto-detect from phone ───
g.greet('Ali', { phone: '+923001234567' });        // Urdu
g.greet('John', { phone: '+14155551234' });        // English
g.greet('Ravi', { phone: '+919876543210' });       // Hindi

// ─── Force a language ───
g.greet('Ali', { lang: 'fr' });                    // "Salut, Ali"

// ─── Group welcome ───
g.welcome('Sara', {
  phone: '+923001234567',
  group: 'Family Chat'
});
// "خوش آمدید Sara 👋\n🎉 Welcome to *Family Chat*!"

// ─── First DM to a new contact ───
g.first('Ahmed', { phone: '+201234567890' });      // "السلام عليكم Ahmed!"

// ─── Styles ───
g.greet('Ali', { style: 'formal' });               // "Good day, Ali"
g.greet('Ali', { style: 'casual' });               // "Hey, Ali!"
g.greet('Ali', { style: 'emoji' });                // "Hi, Ali 👋"
g.greet('Ali', { style: 'upper' });                // "HELLO, ALI"
g.greet('Ali', { style: 'lower' });                // "hello, ali"
g.greet('Ali', { style: 'minimal' });              // "Hello"

// ─── Deterministic (repeatable) ───
g.greet('Ali', { seed: 42 });                      // same output every call

// ─── Multiple names ───
g.greet(['Ali', 'Sara', 'Ravi']);                  // "Hello, Ali, Sara & Ravi"
```

---

## 🧠 API Reference

### `greet(name, options?)`

Standard greeting. Picks a random greeting from the language pool.

| Param | Type | Required | Description |
|---|---|---|---|
| `name` | `string \| string[]` | ✅ | Person's name, or list of names |
| `options` | `object \| string` | ❌ | Options object, or language code shorthand |

**Returns:** `string`

```javascript
g.greet('Ali');                                 // default (English)
g.greet('Ali', 'ur');                           // shorthand language
g.greet('Ali', { phone: '+923001234567' });     // full options
```

---

### `welcome(name, options?)`

Group welcome message. Uses the `{name}` template from each language.

```javascript
g.welcome('Sara', { phone: '+923001234567', group: 'Team ABIX' });
// "خوش آمدید Sara 👋\n🎉 Welcome to *Team ABIX*!"
```

| Option | Type | Description |
|---|---|---|
| `group` | string | Group name — appends "🎉 Welcome to *{group}*!" |

---

### `first(name, options?)`

First DM greeting. Shorter, more personal than `welcome`.

```javascript
g.first('Yuki', { phone: '+819012345678' });    // "こんにちは Yuki さん！"
```

---

### `phoneToLang(phone)`

Returns the ISO language code for a phone number, or `null` if unknown.

```javascript
g.phoneToLang('+923001234567');     // 'ur'
g.phoneToLang('923001234567');      // 'ur'
g.phoneToLang('00923001234567');    // 'ur'   (European 00-prefix)
g.phoneToLang('+92 300 1234567');   // 'ur'
g.phoneToLang('+9991234');          // null
```

---

### `config(options)`

Runtime customization — add languages, remap countries, change fallback.

```javascript
g.config({
  // Add a custom language
  langs: {
    'xx': ['Customish', ['Yo'], ['Yos'], 'Welcome {name}', 'Hi {name}']
  },
  // Remap a country code
  country: { '92': 'en' },
  // Change fallback language
  fallback: 'es'
});
```

---

### Helpers

```javascript
g.languages();          // ['en','es','fr', ...,'my']  (61 codes)
g.countries();          // { '92': 'ur', '91': 'hi', ... }
g.langName('ur');       // 'Urdu'
```

---

## ⚙️ Options

| Option | Type | Description |
|---|---|---|
| `lang` | string | Force a language (`en`, `ur`, `hi`, `ar`, `ja`, …) |
| `phone` | string | Auto-detect language from number |
| `style` | string | `formal` · `casual` · `emoji` · `upper` · `lower` · `minimal` |
| `seed` | number | Deterministic output (same seed = same output) |
| `group` | string | Group name (only in `welcome`) |

---

## 💻 CLI

```bash
# Basic
npx greeting-ninja Ali
npx greeting-ninja Ali --phone +923001234567

# Welcome / first DM
npx greeting-ninja Sara --mode welcome --phone +923001234567 --group "Team ABIX"
npx greeting-ninja Yuki --mode first --phone +819012345678

# Styles and seeds
npx greeting-ninja Ali --phone +923001234567 --style formal
npx greeting-ninja Ali --phone +923001234567 --seed 42

# Introspection
npx greeting-ninja --list-langs
npx greeting-ninja --list-countries
npx greeting-ninja --help
```

**Sample output:**

```
$ greeting-ninja Ali --phone +923001234567
سلام, Ali

$ greeting-ninja Sara --mode welcome --phone +923001234567 --group "Team ABIX"
خوش آمدید Sara 👋
🎉 Welcome to *Team ABIX*!

$ greeting-ninja Yuki --mode first --phone +819012345678
こんにちは Yuki さん！
```

---

## 🤖 Real WhatsApp Bot Usage

Works with **Baileys**, **@whiskeysockets/baileys**, **fixo-baileys**, or any WhatsApp library that gives you JIDs.

### Group join welcome

```javascript
const g = require('greeting-ninja');

sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
  if (action !== 'add') return;

  const meta = await sock.groupMetadata(id);

  for (const p of participants) {
    const phone = '+' + p.split('@')[0].split(':')[0];
    const name  = p.split('@')[0];

    await sock.sendMessage(id, {
      text: g.welcome(name, { phone, group: meta.subject }),
      mentions: [p]
    });
  }
});
```

### First DM to unknown contact

```javascript
const seen = new Set();

sock.ev.on('messages.upsert', async ({ messages }) => {
  const m = messages[0];
  if (!m.message || m.key.fromMe) return;
  if (m.key.remoteJid.endsWith('@g.us')) return;

  const jid = m.key.remoteJid;
  const phone = '+' + jid.split('@')[0];

  if (!seen.has(jid)) {
    seen.add(jid);
    await sock.sendMessage(jid, {
      text: g.first(phone, { phone })
    });
  }
});
```

### Reply in the detected language

```javascript
sock.ev.on('messages.upsert', async ({ messages }) => {
  const m = messages[0];
  const jid = m.key.remoteJid;
  const phone = '+' + jid.split('@')[0];
  const lang = g.phoneToLang(phone) || 'en';

  // Now you know what language to respond in
  await sock.sendMessage(jid, {
    text: g.greet('friend', { lang, style: 'casual' })
  });
});
```

---

## 🌍 Supported Languages (61)

| Code | Language | Code | Language | Code | Language |
|---|---|---|---|---|---|
| `en` | English | `fr` | French | `de` | German |
| `es` | Spanish | `it` | Italian | `pt` | Portuguese |
| `nl` | Dutch | `sv` | Swedish | `no` | Norwegian |
| `da` | Danish | `fi` | Finnish | `is` | Icelandic |
| `pl` | Polish | `cs` | Czech | `sk` | Slovak |
| `hu` | Hungarian | `ro` | Romanian | `bg` | Bulgarian |
| `el` | Greek | `ru` | Russian | `uk` | Ukrainian |
| `tr` | Turkish | `ar` | Arabic | `he` | Hebrew |
| `fa` | Persian | `ur` | Urdu | `hi` | Hindi |
| `bn` | Bengali | `pa` | Punjabi | `ta` | Tamil |
| `te` | Telugu | `ml` | Malayalam | `kn` | Kannada |
| `mr` | Marathi | `gu` | Gujarati | `ne` | Nepali |
| `si` | Sinhala | `zh` | Chinese | `ja` | Japanese |
| `ko` | Korean | `vi` | Vietnamese | `th` | Thai |
| `id` | Indonesian | `ms` | Malay | `tl` | Tagalog |
| `sw` | Swahili | `am` | Amharic | `yo` | Yoruba |
| `ig` | Igbo | `ha` | Hausa | `zu` | Zulu |
| `af` | Afrikaans | `hy` | Armenian | `ka` | Georgian |
| `az` | Azerbaijani | `kk` | Kazakh | `uz` | Uzbek |
| `mn` | Mongolian | `km` | Khmer | `lo` | Lao |
| `my` | Burmese | | | | |

Run `greeting-ninja --list-langs` for the full list with names.

---

## 📞 Country Coverage (80+ codes)

| Country | Prefix | Language |
|---|---|---|
| 🇵🇰 Pakistan | +92 | Urdu |
| 🇮🇳 India | +91 | Hindi |
| 🇧🇩 Bangladesh | +880 | Bengali |
| 🇯🇵 Japan | +81 | Japanese |
| 🇰🇷 South Korea | +82 | Korean |
| 🇨🇳 China | +86 | Chinese |
| 🇸🇦 Saudi Arabia | +966 | Arabic |
| 🇦🇪 UAE | +971 | Arabic |
| 🇪🇬 Egypt | +20 | Arabic |
| 🇹🇷 Turkey | +90 | Turkish |
| 🇷🇺 Russia | +7 | Russian |
| 🇩🇪 Germany | +49 | German |
| 🇫🇷 France | +33 | French |
| 🇪🇸 Spain | +34 | Spanish |
| 🇮🇹 Italy | +39 | Italian |
| 🇧🇷 Brazil | +55 | Portuguese |
| 🇲🇽 Mexico | +52 | Spanish |
| 🇺🇸 USA | +1 | English |
| 🇬🇧 UK | +44 | English |
| 🇦🇺 Australia | +61 | English |

Run `greeting-ninja --list-countries` to see all 80+ mappings.

---

## 🎯 Deterministic Output (Seeded)

Want repeatable output? Use `seed`:

```javascript
g.greet('Ali', { seed: 42 });  // always same output
g.greet('Ali', { seed: 42 });  // same as above
g.greet('Ali', { seed: 1 });   // different
```

Perfect for:
- Testing
- Caching
- Generating stable IDs or memes

---

## 📊 Package Stats

| Metric | Value |
|---|---|
| Languages | **61** |
| Country codes | **80+** |
| Tests | 21 (all passing) |
| Runtime deps | **0** |
| Package size | **~7 KB** |
| Files shipped | 7 |
| Node version | 16+ |
| Works in | CommonJS, ESM, TypeScript, CLI |

---

## 🧪 Testing

```bash
npm test
```

Runs 21 tests with Node's built-in test runner. No external test framework.

---

## 🛠️ Customization

### Add a new language

```javascript
g.config({
  langs: {
    'xx': [
      'Customish',                        // display name
      ['Yo', 'Heyo'],                     // general greetings
      ['Greetings'],                      // formal greetings
      'Welcome {name} 👋',                // welcome template
      'Hi {name}!'                        // first-DM template
    ]
  }
});

g.greet('Ali', { lang: 'xx' });  // "Yo, Ali"
```

### Remap a country

```javascript
g.config({ country: { '92': 'en' } });
// Now +92 → English instead of Urdu
```

### Change fallback

```javascript
g.config({ fallback: 'es' });
// Unknown numbers get Spanish greetings
```

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md).

1. Fork the repo
2. Create a branch (`git checkout -b feature/add-new-lang`)
3. Commit (`git commit -m "Add: Klingon language"`)
4. Push (`git push origin feature/add-new-lang`)
5. Open a Pull Request

---

## 📜 License

MIT © 2025 **[TEAM ABIX](https://github.com/Jalalkhan96)**

See [LICENSE](./LICENSE) for details.

---

## 🔗 Links

- **GitHub:** [github.com/Jalalkhan96/greeting-ninja](https://github.com/Jalalkhan96)
- **npm:** [npmjs.com/package/greeting-ninja](https://www.npmjs.com/package/greeting-ninja)
- **Issues:** [github.com/Jalalkhan96/greeting-ninja/issues](https://github.com/Jalalkhan96)
- **Author:** TEAM ABIX

---

<div align="center">

**⭐ If this helped you, star the repo!**

Made with 🥷 by **TEAM ABIX**

</div>