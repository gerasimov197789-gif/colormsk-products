// generate-sitemap.js
// Генератор sitemap.xml для каталога ColorMSK
// Формат URL: https://colormsk.ru/{category}/{translit-name}--{sku}

const fs = require('fs');
const path = require('path');

// ============================================================
// НАСТРОЙКИ
// ============================================================
const SITE_URL = 'https://colormsk.ru';
const productsDir = path.join(__dirname, 'products');
const outputPath = path.join(__dirname, 'sitemap.xml');

// Соответствие JSON-файлов и URL категорий на сайте
const CATEGORIES = [
    { file: 'antiseptiki',              url: 'antiseptiki' },
    { file: 'kraski-interiernye',       url: 'kraski-interiernye' },
    { file: 'kraski-fasadnye',          url: 'kraski-fasadnye' },
    { file: 'laki',                     url: 'laki' },
    { file: 'gruntovki',                url: 'gruntovki' },
    { file: 'dekorativnye-shtukaturki', url: 'dekorativnye-shtukaturki' },
    { file: 'alkidnye-kraski',          url: 'alkidnye-kraski' },
    { file: 'rastvoriteli',             url: 'rastvoriteli' }
];

// ============================================================
// ТРАНСЛИТЕРАЦИЯ (та же, что в основном скрипте на сайте)
// ============================================================
function translit(text) {
    const map = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z',
        'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
        'с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch',
        'ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
        'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'E','Ж':'ZH','З':'Z',
        'И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R',
        'С':'S','Т':'T','У':'U','Ф':'F','Х':'H','Ц':'TS','Ч':'CH','Ш':'SH','Щ':'SCH',
        'Ъ':'','Ы':'Y','Ь':'','Э':'E','Ю':'YU','Я':'YA'
    };
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        result += map[ch] || (ch.match(/[a-zA-Z0-9]/) ? ch : '-');
    }
    return result.replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

// ============================================================
// XML-ЭСКЕЙПИНГ
// ============================================================
function escapeXml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// ============================================================
// СБОР ТОВАРОВ ИЗ JSON
// ============================================================
function collectProducts() {
    const products = [];

    if (!fs.existsSync(productsDir)) {
        console.error('❌ Папка products не найдена:', productsDir);
        return products;
    }

    CATEGORIES.forEach(cat => {
        const filePath = path.join(productsDir, cat.file + '.json');

        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ Файл не найден: ${cat.file}.json`);
            return;
        }

        try {
            const raw = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(raw);

            if (!Array.isArray(data)) {
                console.warn(`⚠️ ${cat.file}.json — не массив`);
                return;
            }

            let count = 0;
            data.forEach(product => {
                if (!product.sizes || !product.sizes.length) return;

                const firstSize = product.sizes[0];
                if (!firstSize.options || !firstSize.options.length) return;

                const firstOption = firstSize.options[0];
                if (!firstOption.sku) return;

                const slug = translit(product.name || 'product');
                const sku = firstOption.sku;
                const url = `${SITE_URL}/${cat.url}/${slug}--${sku}`;

                products.push({
                    loc: url,
                    priority: 0.7
                });
                count++;
            });

            console.log(`✅ ${cat.file}.json — ${count} товаров`);
        } catch (e) {
            console.error(`❌ Ошибка чтения ${cat.file}.json:`, e.message);
        }
    });

    return products;
}

// ============================================================
// СТАТИЧЕСКИЕ СТРАНИЦЫ
// ============================================================
const staticPages = [
    { loc: `${SITE_URL}/`,                              priority: 1.0 },
    { loc: `${SITE_URL}/antiseptiki`,                   priority: 0.9 },
    { loc: `${SITE_URL}/kraski-interiernye`,            priority: 0.9 },
    { loc: `${SITE_URL}/kraski-fasadnye`,               priority: 0.9 },
    { loc: `${SITE_URL}/laki`,                          priority: 0.9 },
    { loc: `${SITE_URL}/gruntovki`,                     priority: 0.8 },
    { loc: `${SITE_URL}/dekorativnye-shtukaturki`,      priority: 0.8 },
    { loc: `${SITE_URL}/alkidnye-kraski`,               priority: 0.9 },
    { loc: `${SITE_URL}/rastvoriteli`,                  priority: 0.7 },
    { loc: `${SITE_URL}/catalog-colors`,                priority: 0.6 },
    { loc: `${SITE_URL}/info`,                          priority: 0.5 }
];

// ============================================================
// ГЕНЕРАЦИЯ XML
// ============================================================
function generateSitemap(staticPages, products) {
    const today = new Date().toISOString().split('T')[0];
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    staticPages.forEach(page => {
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(page.loc)}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
    });

    products.forEach(product => {
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(product.loc)}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>${product.priority}</priority>\n`;
        xml += '  </url>\n';
    });

    xml += '</urlset>\n';
    return xml;
}

// ============================================================
// ЗАПУСК
// ============================================================
console.log('🚀 Генерация sitemap.xml...\n');

const products = collectProducts();
const sitemap = generateSitemap(staticPages, products);

fs.writeFileSync(outputPath, sitemap, 'utf8');

console.log(`\n✅ Sitemap успешно создан!`);
console.log(`📄 Файл: ${outputPath}`);
console.log(`📊 Всего URL: ${staticPages.length + products.length}`);
console.log(`📄 Статических страниц: ${staticPages.length}`);
console.log(`🛒 Товаров: ${products.length}`);
