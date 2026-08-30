const fs = require('fs');

// 1. Точные URL разделов из Tilda
const categoryUrls = {
  "Антисептики": "https://colormsk.ru/antiseptiki",
  "Краски интерьерные": "https://colormsk.ru/interier",
  "Краски фасадные": "https://colormsk.ru/fasad", 
  "Лаки": "https://colormsk.ru/laki",
  "Грунтовки и Шпатлевки": "https://colormsk.ru/gruntovki",
  "Декоративные штукатурки": "https://colormsk.ru/decor",
  "Эмали": "https://colormsk.ru/alkid", 
  "Растворители": "https://colormsk.ru/rastvoriteli"
};

// 2. Статические страницы (главная и доп. разделы)
const staticPages = [
  { url: 'https://colormsk.ru/', priority: 1.0 },
  { url: 'https://colormsk.ru/catalog-colors', priority: 0.6 },
  { url: 'https://colormsk.ru/info', priority: 0.5 }
];

let allUrls = [...staticPages];

// 3. Читаем ваши JSON файлы
const files = [
  'antiseptiki.json', 'interier.json', 'fasad.json', 
  'laki.json', 'gruntovki.json', 'decor.json', 
  'alkid.json', 'rastvoriteli.json'
];

files.forEach(file => {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (data.length > 0) {
      const categoryName = data[0].cat;
      
      if (categoryUrls[categoryName]) {
        allUrls.push({
          url: categoryUrls[categoryName],
          priority: 0.9
        });
      }
    }
  } catch (e) {
    console.error(`Ошибка чтения файла ${file}:`, e);
  }
});

// 4. Удаляем дубликаты
const uniqueUrls = Array.from(new Map(allUrls.map(item => [item.url, item])).values());

// 5. Генерируем XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

uniqueUrls.forEach(item => {
  xml += `  <url>\n    <loc>${item.url}</loc>\n    <lastmod>2026-08-26</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${item.priority}</priority>\n  </url>\n`;
});

xml += '</urlset>';

fs.writeFileSync('sitemap.xml', xml);
console.log('✅ Sitemap обновлен!');
console.log('Сгенерированные URL:', uniqueUrls.map(u => u.url));
