// generate-sitemap.js
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://colormsk.ru';
const PRODUCTS_DIR = './products';
const OUTPUT_FILE = './sitemap.xml';

// Все JSON-файлы с товарами
const files = [
  'antiseptiki.json',
  'laki.json',
  'fasad.json',
  'interier.json',
  'gruntovki.json',
  'decor.json',
  'alkid.json',
  'rastvoriteli.json'
];

// Основные страницы
const pages = [
  { loc: '/', priority: '1.0' },
  { loc: '/antiseptiki', priority: '0.9' },
  { loc: '/kraski-interiernye', priority: '0.9' },
  { loc: '/kraski-fasadnye', priority: '0.9' },
  { loc: '/laki', priority: '0.9' },
  { loc: '/gruntovki', priority: '0.8' },
  { loc: '/decor', priority: '0.7' },
  { loc: '/alkidnye-kraski', priority: '0.9' },
  { loc: '/rastvoriteli', priority: '0.7' },
  { loc: '/catalog-colors', priority: '0.6' },
  { loc: '/info', priority: '0.5' }
];

let allUrls = [];

// Добавляем основные страницы
pages.forEach(page => {
  allUrls.push({
    loc: BASE_URL + page.loc,
    priority: page.priority
  });
});

// Собираем все SKU из JSON-файлов
files.forEach(fileName => {
  try {
    const filePath = path.join(PRODUCTS_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn('⚠️ Файл не найден:', fileName);
      return;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let count = 0;
    data.forEach(product => {
      if (product.sizes) {
        product.sizes.forEach(size => {
          size.options.forEach(opt => {
            if (opt.sku) {
              allUrls.push({
                loc: BASE_URL + '/product?sku=' + opt.sku,
                priority: '0.6'
              });
              count++;
            }
          });
        });
      }
    });
    console.log('✅ ' + fileName + ': ' + count + ' товаров');
  } catch (e) {
    console.error('❌ Ошибка чтения', fileName, e.message);
  }
});

console.log('📊 Всего URL: ' + allUrls.length);

// Генерируем XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
const today = new Date().toISOString().split('T')[0];
allUrls.forEach(url => {
  xml += '  <url>\n';
  xml += '    <loc>' + url.loc + '</loc>\n';
  xml += '    <lastmod>' + today + '</lastmod>\n';
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>' + (url.priority || '0.5') + '</priority>\n';
  xml += '  </url>\n';
});
xml += '</urlset>';

fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');
console.log('✅ Sitemap создан! Количество URL:', allUrls.length);
