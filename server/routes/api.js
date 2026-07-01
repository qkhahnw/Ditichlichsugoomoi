const express = require('express');
const { getSiteData } = require('../db');

const router = express.Router();

// Toàn bộ nội dung động của trang (đa ngôn ngữ, các điểm ghim, thư viện ảnh)
// được lấy từ SQLite thay vì hard-code trong JS như bản cũ.
router.get('/site', (req, res) => {
    res.json(getSiteData());
});

module.exports = router;
