const fs = require('fs');
const path = require('path');

// Путь к папке с JSON-файлами продуктов
const productsDir = path.join(__dirname, 'products');

// Функция для получения всех SKU из JSON-файлов
function getAllProducts() {
  const allProducts = [];
  
  // Проверяем, существует ли папка products
  if (!fs.existsSync(productsDir)) {
    console.log('⚠️ Папка products не найдена!');
    return [];
  }
  
  const files = fs.readdirSync(productsDir);
  console.log(`📂 Найдено файлов: ${files.length}`);
  
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(productsDir, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`📄 Читаю ${file}: ${data.length} записей`);
        
        // Если JSON - массив
        if (Array.isArray(data)) {
          data.forEach(item => {
            if (typeof item === 'string') {
              allProducts.push(item);
            } else if (item.sku) {
              allProducts.push(item.sku);
            } else if (item.id) {
              allProducts.push(item.id);
            }
          });
        } 
        // Если JSON - объект с ключами
        else if (typeof data === 'object') {
          Object.values(data).forEach(item => {
            if (typeof item === 'string') {
              allProducts.push(item);
            } else if (item.sku) {
              allProducts.push(item.sku);
            }
          });
        }
      } catch (error) {
        console.error(`❌ Ошибка чтения ${file}:`, error.message);
      }
    }
  });
  
  // Удаляем дубликаты
  return [...new Set(allProducts)];
}

// Получаем все SKU
const allSkus = getAllProducts();
console.log(`🛒 Всего уникальных товаров: ${allSkus.length}`);

// Основные URL сайта
const urls = [
  { loc: 'https://colormsk.ru/', priority: 1.0 },
  { loc: 'https://colormsk.ru/catalog-colors', priority: 0.8 },
  { loc: 'https://colormsk.ru/info', priority: 0.5 }
];

// Категории из названий JSON-файлов
const categoryFiles = fs.readdirSync(productsDir).filter(f => f.endsWith('.json'));
categoryFiles.forEach(file => {
  const category = file.replace('.json', '');
  urls.push({
    loc: `https://colormsk.ru/${category}`,
    priority: 0.9
  });
});
console.log(`📂 Категорий: ${categoryFiles.length}`);

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

// Сохранение файла
const sitemap = generateSitemap(urls);
const outputPath = path.join(__dirname, 'sitemap.xml');

fs.writeFileSync(outputPath, sitemap, 'utf8');
console.log(`✅ Sitemap успешно создан!`);
console.log(`📄 Файл: ${outputPath}`);
console.log(`📊 Всего URL: ${urls.length}`);
