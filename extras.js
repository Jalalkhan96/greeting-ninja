'use strict';

// v4 extras — time-of-day greetings + occasion messages.
// Curated for the most-used languages; any language without an entry
// falls back to English for these extras only (core greet/welcome/first
// still cover all 61 languages in data.js).
// Format: [morning, afternoon, evening, night, farewell, thanks, birthday, congrats]
// Placeholders: {name}
const X = {
  en: ['Good morning', 'Good afternoon', 'Good evening', 'Good night',
    'Goodbye {name}! Take care 👋', 'Thank you, {name}! 🙏', 'Happy Birthday, {name}! 🎂🎉', 'Congratulations, {name}! 🎉'],
  ur: ['صبح بخیر', 'سہ پہر بخیر', 'شام بخیر', 'شب بخیر',
    'اللہ حافظ {name}! خیال رکھنا 👋', 'شکریہ، {name}! 🙏', 'سالگرہ مبارک، {name}! 🎂🎉', 'مبارک ہو، {name}! 🎉'],
  hi: ['सुप्रभात', 'नमस्कार', 'शुभ संध्या', 'शुभ रात्रि',
    'अलविदा {name}! ध्यान रखना 👋', 'धन्यवाद, {name}! 🙏', 'जन्मदिन मुबारक हो, {name}! 🎂🎉', 'बधाई हो, {name}! 🎉'],
  ar: ['صباح الخير', 'طاب يومك', 'مساء الخير', 'ليلة سعيدة',
    'مع السلامة {name}! 👋', 'شكرا لك، {name}! 🙏', 'عيد ميلاد سعيد، {name}! 🎂🎉', 'مبارك، {name}! 🎉'],
  es: ['Buenos días', 'Buenas tardes', 'Buenas tardes', 'Buenas noches',
    '¡Adiós {name}! Cuídate 👋', '¡Gracias, {name}! 🙏', '¡Feliz cumpleaños, {name}! 🎂🎉', '¡Felicidades, {name}! 🎉'],
  fr: ['Bonjour', 'Bon après-midi', 'Bonsoir', 'Bonne nuit',
    'Au revoir {name} ! Prends soin de toi 👋', 'Merci, {name} ! 🙏', 'Joyeux anniversaire, {name} ! 🎂🎉', 'Félicitations, {name} ! 🎉'],
  de: ['Guten Morgen', 'Guten Tag', 'Guten Abend', 'Gute Nacht',
    'Tschüss {name}! Pass auf dich auf 👋', 'Danke, {name}! 🙏', 'Alles Gute zum Geburtstag, {name}! 🎂🎉', 'Herzlichen Glückwunsch, {name}! 🎉'],
  it: ['Buongiorno', 'Buon pomeriggio', 'Buona sera', 'Buona notte',
    'Ciao {name}! Stammi bene 👋', 'Grazie, {name}! 🙏', 'Buon compleanno, {name}! 🎂🎉', 'Congratulazioni, {name}! 🎉'],
  pt: ['Bom dia', 'Boa tarde', 'Boa noite', 'Boa noite',
    'Tchau {name}! Se cuida 👋', 'Obrigado, {name}! 🙏', 'Feliz aniversário, {name}! 🎂🎉', 'Parabéns, {name}! 🎉'],
  nl: ['Goedemorgen', 'Goedemiddag', 'Goedenavond', 'Goedenacht',
    'Doei {name}! Zorg goed voor jezelf 👋', 'Bedankt, {name}! 🙏', 'Gefeliciteerd met je verjaardag, {name}! 🎂🎉', 'Gefeliciteerd, {name}! 🎉'],
  tr: ['Günaydın', 'İyi günler', 'İyi akşamlar', 'İyi geceler',
    'Hoşça kal {name}! Kendine iyi bak 👋', 'Teşekkürler, {name}! 🙏', 'Doğum günün kutlu olsun, {name}! 🎂🎉', 'Tebrikler, {name}! 🎉'],
  ru: ['Доброе утро', 'Добрый день', 'Добрый вечер', 'Спокойной ночи',
    'Пока, {name}! Береги себя 👋', 'Спасибо, {name}! 🙏', 'С днём рождения, {name}! 🎂🎉', 'Поздравляю, {name}! 🎉'],
  fa: ['صبح بخیر', 'روز بخیر', 'عصر بخیر', 'شب بخیر',
    'خداحافظ {name}! مراقب خودت باش 👋', 'ممنون، {name}! 🙏', 'تولدت مبارک، {name}! 🎂🎉', 'تبریک، {name}! 🎉'],
  bn: ['সুপ্রভাত', 'শুভ অপরাহ্ন', 'শুভ সন্ধ্যা', 'শুভ রাত্রি',
    'বিদায় {name}! ভালো থেকো 👋', 'ধন্যবাদ, {name}! 🙏', 'শুভ জন্মদিন, {name}! 🎂🎉', 'অভিনন্দন, {name}! 🎉'],
  zh: ['早上好', '下午好', '晚上好', '晚安',
    '再见 {name}！保重 👋', '谢谢你，{name}！🙏', '生日快乐，{name}！🎂🎉', '恭喜你，{name}！🎉'],
  ja: ['おはようございます', 'こんにちは', 'こんばんは', 'おやすみなさい',
    'じゃあね {name} さん！元気でね 👋', 'ありがとう、{name} さん！🙏', 'お誕生日おめでとう、{name} さん！🎂🎉', 'おめでとう、{name} さん！🎉'],
  ko: ['좋은 아침이에요', '안녕하세요', '안녕하세요', '안녕히 주무세요',
    '안녕 {name}님! 건강하세요 👋', '감사합니다, {name}님! 🙏', '생일 축하합니다, {name}님! 🎂🎉', '축하합니다, {name}님! 🎉'],
  id: ['Selamat pagi', 'Selamat siang', 'Selamat malam', 'Selamat malam',
    'Sampai jumpa {name}! Jaga diri ya 👋', 'Terima kasih, {name}! 🙏', 'Selamat ulang tahun, {name}! 🎂🎉', 'Selamat, {name}! 🎉'],
  ms: ['Selamat pagi', 'Selamat tengah hari', 'Selamat petang', 'Selamat malam',
    'Jumpa lagi {name}! Jaga diri 👋', 'Terima kasih, {name}! 🙏', 'Selamat hari lahir, {name}! 🎂🎉', 'Tahniah, {name}! 🎉'],
  sw: ['Habari za asubuhi', 'Habari za mchana', 'Habari za jioni', 'Usiku mwema',
    'Kwaheri {name}! Uwe na afya 👋', 'Asante, {name}! 🙏', 'Heri ya siku ya kuzaliwa, {name}! 🎂🎉', 'Hongera, {name}! 🎉'],
  pa: ['ਸ਼ੁਭ ਸਵੇਰ', 'ਸ਼ੁਭ ਦੁਪਹਿਰ', 'ਸ਼ੁਭ ਸ਼ਾਮ', 'ਸ਼ੁਭ ਰਾਤ',
    'ਅਲਵਿਦਾ {name}! ਖਿਆਲ ਰੱਖਣਾ 👋', 'ਧੰਨਵਾਦ, {name}! 🙏', 'ਜਨਮਦਿਨ ਮੁਬਾਰਕ, {name}! 🎂🎉', 'ਵਧਾਈਆਂ, {name}! 🎉'],
  uz: ['Xayrli tong', 'Xayrli kun', 'Xayrli oqshom', 'Xayrli tun',
    'Xayr {name}! O\'zingizni ehtiyot qiling 👋', 'Rahmat, {name}! 🙏', 'Tug\'ilgan kuningiz muborak, {name}! 🎂🎉', 'Tabriklayman, {name}! 🎉'],
};

module.exports = { X };
