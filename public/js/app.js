/* Toàn bộ nội dung (ngôn ngữ, điểm ghim, ảnh gallery) được nạp từ API /api/site
   (dữ liệu lấy từ SQLite) thay vì hard-code như bản gốc. Logic tương tác
   (kéo/zoom bản đồ, modal, lightbox, đổi ngôn ngữ) được giữ nguyên như cũ. */

let currentLang = 'vi';
let currentOpenModalId = null;
let siteData = null; // { translations: {vi,en}, points: [...], gallery: [...] }

async function loadSiteData() {
    const res = await fetch('/api/site');
    if (!res.ok) throw new Error('Không tải được dữ liệu từ /api/site');
    siteData = await res.json();
}

function getPoint(code) {
    return siteData.points.find(p => p.code === code);
}

function buildPins() {
    const container = document.getElementById('map-container');
    siteData.points.forEach(point => {
        const pin = document.createElement('div');
        pin.className = 'pin';
        pin.id = `pin-${point.code}`;
        pin.style.top = `${point.top}%`;
        pin.style.left = `${point.left}%`;
        pin.onclick = () => openInfoModal(point.code);
        container.appendChild(pin);
    });
}

function buildGallery() {
    const grid = document.querySelector('.gallery-grid');
    siteData.gallery.forEach((img, index) => {
        const el = document.createElement('img');
        el.src = img.filename;
        el.dataset.index = index + 1;
        el.onclick = () => openLightbox(el.src);
        grid.appendChild(el);
    });
    galleryImages = Array.from(grid.querySelectorAll('img')).map(img => img.getAttribute('src'));
}

function updateGalleryAlt() {
    const label = currentLang === 'vi' ? 'Ảnh' : 'Image';
    document.querySelectorAll('.gallery-grid img').forEach(el => {
        el.alt = `${label} ${el.dataset.index}`;
    });
}

function applyLanguageContent() {
    const t = siteData.translations[currentLang];
    document.documentElement.lang = currentLang;
    document.title = t.pageTitle;
    document.getElementById('main-header-title').innerHTML = t.headerTitle;
    document.getElementById('logo-left-caption').innerHTML = t.logoLeftCaption;
    document.getElementById('logo-right-caption').innerHTML = t.logoRightCaption;
    document.getElementById('model-image').alt = t.modelImageAlt;
    document.getElementById('btn-overview').innerHTML = t.btnOverview;
    document.getElementById('btn-gallery').innerHTML = t.btnGallery;
    document.getElementById('gallery-title').innerHTML = t.galleryTitle;
    document.getElementById('side-menu-title').innerHTML = t.sideTitle;
    document.getElementById('side-menu-content').innerHTML = t.sideContent;
    document.getElementById('footer-credit').innerHTML = t.footer;
    document.getElementById('voice-header-text').innerHTML = t.voiceHeader;

    // Cập nhật text của nút Ngôn ngữ nhưng vẫn giữ biểu tượng mũi tên
    document.getElementById('lang-btn-text').innerHTML = currentLang === 'vi' ? '🌐 Ngôn ngữ' : '🌐 Language';

    updateGalleryAlt();

    siteData.points.forEach(point => {
        const pinEl = document.getElementById(`pin-${point.code}`);
        if (pinEl) pinEl.title = point[currentLang].title;
    });

    if (currentOpenModalId) {
        const point = getPoint(currentOpenModalId);
        document.getElementById('modal-title').innerHTML = point[currentLang].title;
        document.getElementById('modal-text').innerHTML = point[currentLang].content;
    }

    let audioPlayer = document.getElementById('audio-player');
    let audioSource = document.getElementById('audio-source');
    let isPlaying = !audioPlayer.paused;

    audioSource.src = currentLang === 'vi' ? '/audio/voice-vi.mp3' : '/audio/voice-en.mp3';

    audioPlayer.load();
    if (isPlaying) { audioPlayer.play().catch(e => console.log("Autoplay bị chặn")); }
}

function toggleLangMenu() { document.getElementById('lang-menu').classList.toggle('active'); }
function changeLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-opt').forEach(el => el.classList.remove('active-lang'));
    event.currentTarget.classList.add('active-lang');
    document.getElementById('lang-menu').classList.remove('active');
    applyLanguageContent();
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('#lang-menu')) { document.getElementById('lang-menu').classList.remove('active'); }
});

/* --- QUẢN LÝ MODAL INFO & GALLERY --- */
function openInfoModal(code) {
    currentOpenModalId = code;
    const point = getPoint(code);
    document.getElementById('modal-title').innerHTML = point[currentLang].title;
    document.getElementById('modal-text').innerHTML = point[currentLang].content;
    let modalImg = document.getElementById('modal-image');
    modalImg.alt = siteData.translations[currentLang].modalImageAlt;
    if (point.image) {
        modalImg.src = point.image; modalImg.style.display = 'block';
    } else { modalImg.style.display = 'none'; }
    document.getElementById('info-modal').classList.add('show');
}

function openGalleryModal() { document.getElementById('gallery-modal').classList.add('show'); }

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    if (modalId === 'info-modal') currentOpenModalId = null;
}

/* --- LOGIC LIGHTBOX (SLIDER & ZOOM) --- */
let currentImageIndex = 0;
let galleryImages = [];
let lbScale = 1;

function openLightbox(src) {
    currentImageIndex = galleryImages.indexOf(src); // Tìm vị trí ảnh đang click
    resetZoom(); // Đưa ảnh về kích thước gốc
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = src;
    lightboxImg.alt = siteData.translations[currentLang].lightboxImageAlt;
    document.getElementById('lightbox-modal').classList.add('show');
}

function closeLightbox() {
    document.getElementById('lightbox-modal').classList.remove('show');
    resetZoom();
}

// Chuyển ảnh tiếp theo
function nextImage(e) {
    if (e) e.stopPropagation(); // Ngăn click nhầm ra ngoài modal
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    document.getElementById('lightbox-img').src = galleryImages[currentImageIndex];
    resetZoom();
}

// Chuyển ảnh trước đó
function prevImage(e) {
    if (e) e.stopPropagation();
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    document.getElementById('lightbox-img').src = galleryImages[currentImageIndex];
    resetZoom();
}

// Xử lý Phóng to / Thu nhỏ
function zoomLightbox(step, e) {
    if (e) e.stopPropagation();
    lbScale += step;
    if (lbScale < 0.5) lbScale = 0.5; // Thu nhỏ tối đa
    if (lbScale > 4) lbScale = 4;     // Phóng to tối đa
    document.getElementById('lightbox-img').style.transform = `scale(${lbScale})`;
}

function resetZoom(e) {
    if (e) e.stopPropagation();
    lbScale = 1;
    document.getElementById('lightbox-img').style.transform = `scale(1)`;
}

function openSideMenu() { document.getElementById('side-menu').classList.add('open'); }
function closeSideMenu() { document.getElementById('side-menu').classList.remove('open'); }

// Bấm ra ngoài vùng tối để đóng các Modal
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay') && event.target.id !== 'lightbox-modal') {
        event.target.classList.remove('show');
        if (event.target.id === 'info-modal') currentOpenModalId = null;
    }
}

/* --- LOGIC KÉO (có giới hạn) + ZOOM TRÊN MAP ---
   Khi zoom > 1 mới kéo ra được, nhưng luôn bị chặn (clamp) không cho ảnh
   trôi ra ngoài khung nhìn của #main-area. */
const mainArea = document.getElementById('main-area');
const container = document.getElementById('map-container');
let scale = 1, panning = false, pointX = 0, pointY = 0;
let start = { x: 0, y: 0 }; let initialPinchDistance = null; let initialScale = 1;

function clampPan() {
    const mainRect = mainArea.getBoundingClientRect();
    const maxX = Math.max(0, (container.offsetWidth * scale - mainRect.width) / 2);
    const maxY = Math.max(0, (container.offsetHeight * scale - mainRect.height) / 2);
    pointX = Math.min(maxX, Math.max(-maxX, pointX));
    pointY = Math.min(maxY, Math.max(-maxY, pointY));
}

function setTransform() {
    clampPan();
    container.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
}

mainArea.onmousedown = function (e) {
    if (e.target.closest('#side-menu') || e.target.closest('.menu-buttons-container') || e.target.closest('.pin') || e.target.closest('.modal-content') || e.target.closest('#footer-credit') || e.target.closest('#lightbox-modal')) return;
    e.preventDefault(); start = { x: e.clientX - pointX, y: e.clientY - pointY }; panning = true; container.style.transition = 'none';
}
window.onmouseup = function () { panning = false; container.style.transition = 'transform 0.1s ease-out'; }
mainArea.onmouseleave = function () { panning = false; }
mainArea.onmousemove = function (e) {
    if (!panning) return; e.preventDefault();
    pointX = (e.clientX - start.x); pointY = (e.clientY - start.y); setTransform();
}
mainArea.onwheel = function (e) {
    if (e.target.closest('#side-menu') || e.target.closest('.modal-content') || e.target.closest('#footer-credit') || e.target.closest('#lightbox-modal')) return;
    e.preventDefault(); let zoomFactor = ((e.wheelDelta ? e.wheelDelta : -e.deltaY) > 0) ? 1.1 : 0.9;
    scale *= zoomFactor; if (scale > 3) scale = 3; if (scale < 0.5) scale = 0.5; setTransform();
}

mainArea.addEventListener('touchstart', function(e) {
    if (e.target.closest('#side-menu') || e.target.closest('.menu-buttons-container') || e.target.closest('.pin') || e.target.closest('.modal-content') || e.target.closest('#footer-credit') || e.target.closest('#lightbox-modal')) return;
    if (e.touches.length === 1) {
        panning = true; start = { x: e.touches[0].clientX - pointX, y: e.touches[0].clientY - pointY }; container.style.transition = 'none';
    } else if (e.touches.length === 2) {
        panning = false; initialPinchDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        initialScale = scale; container.style.transition = 'none';
    }
}, {passive: false});

mainArea.addEventListener('touchmove', function(e) {
    if (e.target.closest('#side-menu') || e.target.closest('.modal-content') || e.target.closest('#footer-credit') || e.target.closest('#lightbox-modal')) return;
    e.preventDefault();
    if (panning && e.touches.length === 1) {
        pointX = (e.touches[0].clientX - start.x); pointY = (e.touches[0].clientY - start.y); setTransform();
    } else if (e.touches.length === 2 && initialPinchDistance) {
        let currentDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        scale = initialScale * (currentDistance / initialPinchDistance);
        if (scale > 3) scale = 3; if (scale < 0.5) scale = 0.5; setTransform();
    }
}, {passive: false});

mainArea.addEventListener('touchend', function() { panning = false; initialPinchDistance = null; container.style.transition = 'transform 0.1s ease-out'; });

/* --- KHỞI TẠO TRANG --- */
async function init() {
    try {
        await loadSiteData();
    } catch (err) {
        document.body.innerHTML = '<div class="loading-hint">Không thể tải dữ liệu di tích. Vui lòng kiểm tra server và thử lại.<br>Unable to load site data. Please check the server and try again.</div>';
        console.error(err);
        return;
    }
    buildPins();
    buildGallery();
    applyLanguageContent();

    document.getElementById('lightbox-modal').addEventListener('wheel', function(e) {
        if (this.classList.contains('show')) {
            e.preventDefault();
            let step = (e.deltaY < 0) ? 0.1 : -0.1;
            zoomLightbox(step);
        }
    });
}

init();
