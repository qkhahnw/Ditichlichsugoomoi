// Tạo schema và nạp dữ liệu gốc (di chuyển từ index.html cũ) vào SQLite.
// Chạy lại an toàn: script sẽ xóa bảng cũ và tạo lại từ đầu (chỉ ảnh hưởng nội dung, không đụng tới file ảnh).
const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'ditich.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec(`
    DROP TABLE IF EXISTS point_translations;
    DROP TABLE IF EXISTS points;
    DROP TABLE IF EXISTS site_translations;
    DROP TABLE IF EXISTS gallery_images;

    CREATE TABLE points (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        order_index INTEGER NOT NULL,
        top_pct REAL NOT NULL,
        left_pct REAL NOT NULL,
        image TEXT
    );

    CREATE TABLE point_translations (
        point_id INTEGER NOT NULL REFERENCES points(id),
        lang TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        PRIMARY KEY (point_id, lang)
    );

    CREATE TABLE site_translations (
        lang TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        PRIMARY KEY (lang, key)
    );

    CREATE TABLE gallery_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        alt TEXT,
        order_index INTEGER NOT NULL
    );
`);

// ---------- Nội dung đa ngôn ngữ chung của trang ----------
const siteTranslations = {
    vi: {
        headerTitle: 'CÔNG TRÌNH SỐ HÓA DI TÍCH LỊCH SỬ GÒ Ô MÔI',
        pageTitle: 'Công Trình Số Hóa Di Tích Lịch Sử Gò Ô Môi',
        logoLeftCaption: 'Phường Phú Thuận',
        logoRightCaption: 'Khoa Công nghệ thông tin<br>Trường Đại học Tôn Đức Thắng',
        modelImageAlt: 'Mô Hình Gò Ô Môi',
        modalImageAlt: 'Hình minh họa',
        lightboxImageAlt: 'Ảnh phóng to',
        btnOverview: '☰ TỔNG QUAN DI TÍCH',
        btnGallery: '🖼 HÌNH ẢNH TẠI DI TÍCH',
        galleryTitle: 'HÌNH ẢNH TẠI DI TÍCH',
        footer: 'Công trình do <span>Đoàn phường Phú Thuận phối hợp cùng Đoàn khoa Công nghệ thông tin</span><br>Trường Đại học Tôn Đức Thắng thực hiện',
        voiceHeader: '🔊 THUYẾT MINH',
        sideTitle: 'Di Tích Lịch Sử Gò Ô Môi',
        sideContent: `
                    <h4>1. Nguồn gốc tên gọi và vị trí</h4>
                    <p><strong>Vị trí ban đầu:</strong> Vốn là nơi ở của bà Ngô Thị Tài (bí danh Ba Lý) tại ấp Bà Bướm, xã Phú Mỹ, huyện Nhà Bè.</p>
                    <p><strong>Tên gọi "Gò Ô Môi":</strong> Bắt nguồn từ việc trong sân nhà có trồng một cây ô môi cao khoảng 6-7m. Khu vực này còn có tên gọi khác là "Gò Chị Ba Lý".</p>
                    <p><strong>Tên gọi "Mộ ba ông":</strong> Tên gọi này xuất hiện về sau, khi 3 chiến sĩ du kích hy sinh và được địch vùi xác chung tại căn hầm bí mật ở gò.</p>
                    <h4>2. Bối cảnh lịch sử và sự đùm bọc của nhân dân (1962 - 1965)</h4>
                    <p><strong>Năm 1962:</strong> Mỹ - Ngụy thực hiện chương trình ấp chiến lược, dời dân đi nơi khác nên Gò Ô Môi bị bỏ hoang, cây cỏ mọc rậm rạp.</p>
                    <p><strong>Năm 1965:</strong> Lợi dụng địa thế này, đồng chí Hoa Văn Tân đã chọn Gò Ô Môi làm nơi đào hầm bí mật trú ẩn và lập tổ du kích gồm 3 người: Lê Văn Sắn, Hồ Văn Nhái và Nguyễn Văn Ba.</p>
                    <p><strong>Sự ủng hộ của nhân dân:</strong> Dù bị dồn vào ấp chiến lược, người dân vẫn bất chấp hiểm nguy để tiếp tế lương thực, làm hầm, đóng nắp hầm và che chở cho các cán bộ cách mạng.</p>
                    <h4>3. Diễn biến trận đánh bi hùng ngày 23/11/1966</h4>
                    <p><strong>Bối cảnh:</strong> Sang năm 1966, đồng chí Tân đi họp nhận nhiệm vụ mới, để lại 3 chiến sĩ bám trụ lại gò trong hoàn cảnh địch càn quét gắt gao.</p>
                    <p><strong>Diễn biến:</strong> Rạng sáng ngày 23/11/1966, bị tề điệp chỉ điểm, hơn 400 quân ngụy bao vây và phát hiện lỗ thông hơi của hầm bí mật sau 4 giờ đào xới.</p>
                    <p><strong>Kết quả:</strong> 3 chiến sĩ du kích đã dũng cảm mở nắp hầm phản kích quyết liệt. Do tương quan lực lượng quá chênh lệch, cả 3 chiến sĩ đã anh dũng hy sinh.</p>
                    <h4>4. Ý nghĩa lịch sử</h4>
                    <ul>
                        <li>Là trận đánh đầu tiên của lực lượng du kích hoạt động bí mật dám kiên cường chiến đấu ngay trong vùng địch kiểm soát.</li>
                        <li>Là minh chứng cho sự anh dũng của lực lượng du kích Nhà Bè, giúp củng cố niềm tin của nhân dân đối với cách mạng, góp phần vào đại thắng mùa Xuân năm 1975.</li>
                    </ul>
                    <h4>5. Quá trình tôn tạo và hiện trạng khu di tích</h4>
                    <ul>
                        <li><strong>Sau ngày giải phóng:</strong> Chính quyền địa phương xây mộ chung cho 3 liệt sĩ tại nơi hy sinh.</li>
                        <li><strong>Năm 1999:</strong> UBND Quận 7 trùng tu lại ngôi mộ (ốp đá xám, lập bia ghi nhận sự kiện).</li>
                        <li><strong>Ngày 13/02/2007:</strong> Gò Ô Môi được chính thức công nhận là Di tích lịch sử cấp Thành phố.</li>
                    </ul><br><br>
                `
    },
    en: {
        headerTitle: 'DIGITIZED GO O MOI HISTORICAL SITE',
        pageTitle: 'Digitized Go O Moi Historical Site',
        logoLeftCaption: 'Phu Thuan Ward',
        logoRightCaption: 'Faculty of Information Technology<br>Ton Duc Thang University',
        modelImageAlt: 'Go O Moi Model',
        modalImageAlt: 'Illustration image',
        lightboxImageAlt: 'Enlarged image',
        btnOverview: '☰ SITE OVERVIEW',
        btnGallery: '🖼 SITE IMAGES GALLERY',
        galleryTitle: 'IMAGES OF THE SITE',
        footer: 'Project executed by <span>Phu Thuan Ward Youth Union in collaboration with the Faculty of Information Technology Youth Union</span><br>Ton Duc Thang University.',
        voiceHeader: '🔊 VOICEOVER',
        sideTitle: 'Go O Moi Historical Site',
        sideContent: `
                    <h4>1. Origin and Location</h4>
                    <p><strong>Original location:</strong> Originally the residence of Mrs. Ngo Thi Tai (alias Ba Ly) in Ba Buom hamlet, Phu My commune, Nha Be district.</p>
                    <p><strong>Name "Go O Moi":</strong> Named after a 6-7m tall pink shower tree (ô môi) planted in her yard. It was also known as "Go Chi Ba Ly" (Sister Ba Ly's Mound).</p>
                    <p><strong>Name "Tomb of the Three Gentlemen":</strong> Coined later when three guerrilla fighters sacrificed their lives and were buried together by the enemy in the secret tunnel.</p>
                    <h4>2. Historical Context & People's Protection (1962-1965)</h4>
                    <p><strong>In 1962:</strong> The US-Diem regime implemented the strategic hamlet program, forcing civilians to relocate, leaving Go O Moi abandoned and overgrown.</p>
                    <p><strong>In 1965:</strong> Taking advantage of the terrain, comrade Hoa Van Tan built a secret tunnel and formed a guerrilla cell of three: Le Van San, Ho Van Nhai, and Nguyen Van Ba.</p>
                    <p><strong>Support:</strong> Despite the danger, locals secretly provided food, helped build the tunnel, and shielded the revolutionaries.</p>
                    <h4>3. The Heroic Battle on Nov 23, 1966</h4>
                    <p><strong>Context:</strong> In 1966, the three fighters stayed behind to guard the mound amid intense enemy sweeps.</p>
                    <p><strong>The Battle:</strong> At dawn, tipped off by spies, over 400 enemy troops surrounded the area. After 4 hours of digging, they found the tunnel's air vent.</p>
                    <p><strong>Outcome:</strong> The three guerrillas bravely opened the hatch and fought back. Due to heavily outnumbered forces, all three fought heroically to the death.</p>
                    <h4>4. Historical Significance</h4>
                    <ul>
                        <li>The first battle where secret guerrillas dared to stand and fight directly inside an enemy-controlled zone.</li>
                        <li>A testament to the bravery of Nha Be guerrillas, contributing to the great Spring Victory of 1975.</li>
                    </ul>
                    <h4>5. Restoration and Current Status</h4>
                    <ul>
                        <li><strong>After Liberation:</strong> Local authorities built a joint tomb for the 3 martyrs at the site of their sacrifice.</li>
                        <li><strong>In 1999:</strong> District 7 People's Committee restored the tomb respectfully.</li>
                        <li><strong>In 2007:</strong> Officially recognized as a City-level Historical Monument.</li>
                    </ul><br><br>
                `
    }
};

// ---------- Các điểm ghim (pins) trên mô hình ----------
const points = [
    {
        code: 'congvao', order: 1, top: 48, left: 61, image: '/images/gallery/anh-cong-vao.jpg',
        vi: { title: '1. Cổng vào', content: '<p><strong>Địa chỉ:</strong> Đường Đào Trí, khu phố 2, phường Phú Thuận, TP.HCM</p><p><strong>Thời gian hoạt động:</strong> 07:30 – 17:30</p>' },
        en: { title: '1. Entrance', content: '<p><strong>Address:</strong> Dao Tri Street, Quarter 2, Phu Thuan Ward, District 7, HCMC</p><p><strong>Operating Hours:</strong> 07:30 AM – 05:30 PM</p>' }
    },
    {
        code: 'mobaong', order: 2, top: 38, left: 52, image: '/images/gallery/anh-mo-ba-ong.jpg',
        vi: { title: '2. MỘ BA ÔNG', content: '<p>Gò Ô Môi trước đây vốn là nơi ở của bà Ngô Thị Tài (bí danh Ba Lý), thuộc ấp Bà Bướm, xã Phú Mỹ, huyện Nhà Bè. Trong sân nhà có trồng một cây ô môi cao khoảng 6-7m nên được dân trong vùng gọi là Gò Ô Môi.</p><p>Vào rạng sáng ngày 23/11/1966, nơi đây đã trở thành một chứng tích lịch sử oai hùng, ghi dấu sự hy sinh dũng cảm của 3 chiến sĩ du kích: <strong>Lê Văn Sắn, Hồ Văn Nhái và Nguyễn Văn Ba</strong>. Trong một cuộc chiến không cân sức với hơn 400 quân ngụy bao vây, các anh đã chiến đấu kiên cường đến hơi thở cuối cùng. Từ đó, Gò Ô Môi còn có thêm tên gọi thân thương và trang trọng do nhân dân truyền tụng là <strong>"Mộ ba ông"</strong>.</p>' },
        en: { title: '2. TOMB OF THE THREE GENTLEMEN', content: '<p>Go O Moi was formerly the residence of Mrs. Ngo Thi Tai (alias Ba Ly), located in Ba Buom hamlet, Phu My commune, Nha Be district. It was named after a 6-7m tall pink shower tree (ô môi) planted in the yard.</p><p>On the dawn of November 23, 1966, this place became a heroic historical monument, marking the brave sacrifice of 3 guerrilla fighters: <strong>Le Van San, Ho Van Nhai, and Nguyen Van Ba</strong>. In an unequal battle against over 400 enemy troops, they fought resiliently to their last breath. Since then, the local people have respectfully called Go O Moi the <strong>"Tomb of the Three Gentlemen"</strong>.</p>' }
    },
    {
        code: 'phudieu', order: 3, top: 20, left: 53.5, image: '/images/gallery/anh-phu-dieu.jpg',
        vi: { title: '3. Phù điêu trang trí', content: '<p>Trang nghiêm hai bên ngôi mộ là tượng đài rặng dừa nước – biểu tượng của vùng đất Nhà Bè xưa.</p><p>Phía trên trái là mảng phù điêu đắp nổi trên nền lá dừa nước cách điệu cao 5,5m bằng chất liệu xi măng thể hiện trận đánh giữa quân địch và các chiến sĩ du kích. Phía trên phải là bia đá hoa cương màu đỏ trên nền lá dừa nước cách điệu cao 5,5m được khắc nội dung ở cả 02 mặt về sự kiện Gò Ô Môi.</p>' },
        en: { title: '3. Decorative Relief', content: '<p>Solemnly standing on both sides of the tomb is a water coconut palm monument – the symbol of the ancient Nha Be land.</p><p>On the upper left is a 5.5m high cement relief on a stylized water coconut leaf background, depicting the battle between enemy troops and guerrilla fighters. On the upper right is a red granite stele on a 5.5m high stylized water coconut leaf background, engraved on both sides with historical information about the Go O Moi event.</p>' }
    },
    {
        code: 'hamdukich', order: 4, top: 28, left: 79.5, image: '/images/gallery/anh-ham-du-kich.jpg',
        vi: { title: '4. Hầm du kích', content: '<p>Hầm du kích: nơi các chiến sỹ đã chiến đấu anh dũng và hi sinh.</p><p>Năm 1965, lợi dụng địa thế hoang vu um tùm do nhân dân bị Mỹ - Ngụy dồn vào ấp chiến lược, đồng chí Hoa Văn Tân đã chọn Gò Ô Môi làm căn cứ, đào hầm bí mật và thành lập tổ du kích 3 người.</p><p>Nhờ sự đùm bọc, tiếp tế đầy mưu trí của nhân dân (như gia đình ông Trì, ông Út Hí, bà Tài...) cùng bàn tay tài hoa của ông Lê Văn Kiệm đóng nắp hầm, căn hầm này đã chở che các chiến sĩ hoạt động an toàn ngay trong lòng địch cho đến trận đánh bi hùng rạng sáng ngày 23/11/1966.</p>' },
        en: { title: '4. Guerrilla Tunnel', content: '<p>Guerrilla Tunnel: the place where the soldiers fought bravely and made the ultimate sacrifice.</p><p>In 1965, taking advantage of the desolate and overgrown terrain when locals were forced into strategic hamlets by the US-Diem regime, comrade Hoa Van Tan chose Go O Moi as a base, digging a secret tunnel and forming a 3-person guerrilla cell.</p><p>Thanks to the brave protection and supplies from the locals (such as Mr. Tri, Mr. Ut Hi, Mrs. Tai...) and the skillful hands of Mr. Le Van Kiem who crafted the tunnel hatch, this hidden shelter protected the fighters operating right in the enemy\'s heart until the heroic battle on the dawn of November 23, 1966.</p>' }
    },
    {
        code: 'nhavesinh', order: 5, top: 17, left: 84, image: '/images/gallery/anh-nha-ve-sinh.jpg',
        vi: { title: '5. Khu vực Nhà vệ sinh', content: '<p>Khu vực nhà vệ sinh được bố trí phía sau công trình nhằm phục vụ nhu cầu của du khách khi đến tham quan.</p>' },
        en: { title: '5. Restroom Area', content: '<p>The restroom area is arranged at the back of the facility to serve the needs of tourists when visiting.</p>' }
    }
];

// ---------- Ảnh trong thư viện (gallery) ----------
// Giữ đúng thứ tự gốc; bổ sung anh-bia-da.jpg (có sẵn trong bộ ảnh nhưng trước đây chưa được đưa vào gallery).
const galleryFiles = [
    '/images/map/go-o-moi.jpg',
    '/images/gallery/anh-cong-vao.jpg',
    '/images/gallery/anh-mo-ba-ong.jpg',
    '/images/gallery/anh-phu-dieu.jpg',
    '/images/gallery/anh-ham-du-kich.jpg',
    '/images/gallery/anh-nha-ve-sinh.jpg',
    ...Array.from({ length: 24 }, (_, i) => `/images/gallery/anh-bo-sung-${i + 1}.jpg`),
    '/images/gallery/anh-bia-da.jpg',
    '/images/gallery/z7997874511728_6cfccc342efd7b626b094caa9b85b49e.jpg',
    '/images/gallery/z7997874512379_074712369afdb0e08e6b18b52f2c4235.jpg',
    '/images/gallery/z7997874512715_b3f3b7ee2bad17ab3bb390204fd19e59.jpg',
    '/images/gallery/z7997874512716_be6808b3f1c923664ee400562bc67978.jpg',
    '/images/gallery/z7997874512717_202f99c827cc0e531b1f0725d9d267b3.jpg'
];

// ---------- Ghi vào DB ----------
const insertSiteTranslation = db.prepare('INSERT INTO site_translations (lang, key, value) VALUES (?, ?, ?)');
for (const lang of Object.keys(siteTranslations)) {
    for (const key of Object.keys(siteTranslations[lang])) {
        insertSiteTranslation.run(lang, key, siteTranslations[lang][key]);
    }
}

const insertPoint = db.prepare('INSERT INTO points (code, order_index, top_pct, left_pct, image) VALUES (?, ?, ?, ?, ?)');
const insertPointTranslation = db.prepare('INSERT INTO point_translations (point_id, lang, title, content) VALUES (?, ?, ?, ?)');
for (const point of points) {
    const result = insertPoint.run(point.code, point.order, point.top, point.left, point.image);
    const pointId = result.lastInsertRowid;
    insertPointTranslation.run(pointId, 'vi', point.vi.title, point.vi.content);
    insertPointTranslation.run(pointId, 'en', point.en.title, point.en.content);
}

const insertGalleryImage = db.prepare('INSERT INTO gallery_images (filename, alt, order_index) VALUES (?, ?, ?)');
galleryFiles.forEach((filename, index) => {
    insertGalleryImage.run(filename, `Ảnh ${index + 1}`, index + 1);
});

db.close();

console.log(`Đã tạo và nạp dữ liệu vào ${DB_PATH}`);
console.log(`  - ${points.length} điểm di tích (points)`);
console.log(`  - ${galleryFiles.length} ảnh trong thư viện (gallery_images)`);
console.log(`  - ${Object.keys(siteTranslations).length} ngôn ngữ nội dung trang (site_translations)`);
