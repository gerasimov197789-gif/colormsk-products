const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, 'products');

// Функция для извлечения всех SKU из JSON-файлов
function getAllSkus() {
  const allSkus = [];
  
  if (!fs.existsSync(productsDir)) {
    console.log('❌ Папка products не найдена!');
    return [];
  }
  
  const files = fs.readdirSync(productsDir);
  console.log(`📂 Найдено файлов: ${files.length}`);
  
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(productsDir, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`📄 Читаю ${file}`);
        
        if (Array.isArray(data)) {
          data.forEach(item => {
            if (item.sku) allSkus.push(item.sku);
            if (item.sizes && Array.isArray(item.sizes)) {
              item.sizes.forEach(size => {
                if (size.options && Array.isArray(size.options)) {
                  size.options.forEach(option => {
                    if (option.sku) allSkus.push(option.sku);
                  });
                }
              });
            }
          });
        }
      } catch (error) {
        console.error(`❌ Ошибка чтения ${file}:`, error.message);
      }
    }
  });
  
  return [...new Set(allSkus)];
}

// Получаем все SKU
const allSkus = getAllSkus();
console.log(`🛒 Всего уникальных товаров: ${allSkus.length}`);

// ============================================================
// !!! ОКОНЧАТЕЛЬНЫЙ СПИСОК ПРАВИЛЬНЫХ URL ИЗ НАСТРОЕК TILDA !!!
// ============================================================
const urls = [
  { loc: 'https://colormsk.ru/', priority: 1.0 },
  { loc: 'https://colormsk.ru/antiseptiki', priority: 0.9 },
  { loc: 'https://colormsk.ru/kraski-interiernye', priority: 0.9 }, // ✅ Подтвержден
  { loc: 'https://colormsk.ru/kraski-fasadnye', priority: 0.9 },    // ✅ Подтвержден
  { loc: 'https://colormsk.ru/laki', priority: 0.9 },
  { loc: 'https://colormsk.ru/gruntovki', priority: 0.8 },
  { loc: 'https://colormsk.ru/decor', priority: 0.8 },
  { loc: 'https://colormsk.ru/alkidnye-kraski', priority: 0.9 },    // ✅ Подтвержден
  { loc: 'https://colormsk.ru/rastvoriteli', priority: 0.7 },
  { loc: 'https://colormsk.ru/catalog-colors', priority: 0.6 },
  { loc: 'https://colormsk.ru/info', priority: 0.5 }
];
// ============================================================

// Добавляем все товары
allSkus.forEach(sku => {
  urls.push({
    loc: `https://colormsk.ru/product?sku=${sku}`,
    priority: 0.6
  });
});

// Генерация XML
function generateSitemap(urls) {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
}

// Сохранение
const sitemap = generateSitemap(urls);
const outputPath = path.join(__dirname, 'sitemap.xml');

fs.writeFileSync(outputPath, sitemap, 'utf8');
console.log(`\n✅ Sitemap успешно создан!`);
console.log(`📄 Файл: ${outputPath}`);
console.log(`📊 Всего URL: ${urls.length}`);
console.log(`🛒 Товаров: ${allSkus.length}`);
