const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const apiRouter = require('./routes/api');

const DB_PATH = path.join(__dirname, '..', 'data', 'ditich.db');
if (!fs.existsSync(DB_PATH)) {
    console.error('Chưa có database. Hãy chạy "npm run init-db" trước khi start server.');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/api', apiRouter);
app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => {
    console.log(`Di tích Gò Ô Môi đang chạy tại http://localhost:${PORT}`);
});
