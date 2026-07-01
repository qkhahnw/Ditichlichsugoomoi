const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, '..', 'data', 'ditich.db');
const db = new DatabaseSync(DB_PATH, { readOnly: true });

// Gộp toàn bộ dữ liệu (translations + points + gallery) thành đúng cấu trúc
// mà frontend cần, tương tự các object `translations` / `diTichData` trong bản cũ.
function getSiteData() {
    const translations = { vi: {}, en: {} };
    for (const row of db.prepare('SELECT lang, key, value FROM site_translations').all()) {
        translations[row.lang][row.key] = row.value;
    }

    const pointRows = db.prepare('SELECT * FROM points ORDER BY order_index').all();
    const pointTranslationRows = db.prepare('SELECT * FROM point_translations').all();

    const points = pointRows.map((point) => {
        const entry = {
            code: point.code,
            order: point.order_index,
            top: point.top_pct,
            left: point.left_pct,
            image: point.image
        };
        for (const t of pointTranslationRows) {
            if (t.point_id === point.id) {
                entry[t.lang] = { title: t.title, content: t.content };
            }
        }
        return entry;
    });

    const gallery = db.prepare('SELECT filename, alt FROM gallery_images ORDER BY order_index').all();

    return { translations, points, gallery };
}

module.exports = { getSiteData };
