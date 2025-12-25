// --- KONFIGURASI GLOBAL ---
let ARTICLES = [];
let isDark = false;
let currentLang = 'EN';

// --- KAMUS BAHASA ---
const TRANSLATIONS = {
    EN: {
        nav: { home: 'Home', news: 'News', blog: 'Blog', projects: 'Projects', shop: 'Store' },
        ui: { 
            search: 'Search...', lang: 'ID', mode: 'MODE', 
            sub: 'Subscribe for updates', join: 'TRANSMIT',
            rights: 'ALL SYSTEMS GO.'
        },
        footer: { uplink: 'UPLINK', grid: 'SOCIAL MATRIX' }
    },
    ID: {
        nav: { home: 'Beranda', news: 'Berita', blog: 'Blog', projects: 'Proyek', shop: 'Toko' },
        ui: { 
            search: 'Cari...', lang: 'EN', mode: 'TEMA', 
            sub: 'Langganan update', join: 'KIRIM',
            rights: 'SISTEM AKTIF.'
        },
        footer: { uplink: 'JARINGAN', grid: 'MATRIKS SOSIAL' }
    }
};

// --- INIT UTAMA ---
function init() {
    // 1. Cek Dark Mode
    if(localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        isDark = true;
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-mode');
    }
    
    // 2. Render UI Global (Navigasi & Bahasa)
    renderNavSystem();
    updateLanguageUI();
    updateThemeUI();
    lucide.createIcons();

    // 3. LOGIKA PER HALAMAN (ROUTER SEDERHANA)
    const path = window.location.pathname;

    // A. Halaman Home (index.html)
    if (document.getElementById('contentArea')) {
        fetchDataForHome(); 
    }
    
    // B. Halaman News (news.html)
    if (document.getElementById('newsGrid')) {
        fetchDataForNews();
    }
}

// --- LOGIKA HOME & NEWS (SSG DATA) ---
async function fetchDataForHome() {
    try {
        const res = await fetch('index.json');
        const data = await res.json();
        ARTICLES = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        renderHomeFeed();
    } catch (e) { console.log("Mode Dummy Home"); }
}

async function fetchDataForNews() {
    try {
        const res = await fetch('index.json');
        const data = await res.json();
        // Filter khusus kategori 'News' atau tag 'News'
        const newsItems = data.filter(item => 
            item.category === 'News' || item.tags.includes('News') || item.tags.includes('Berita')
        );
        renderNewsGrid(newsItems);
    } catch (e) { renderNewsGrid([]); } // Render kosong jika error
}

// --- RENDER FUNGSI ---
function renderHomeFeed() {
    // Logika render Home sama seperti sebelumnya (disingkat biar fokus ke file baru)
    // Code ini akan memanggil renderMainContent() yang ada di versi sebelumnya
    // (Anda bisa paste ulang fungsi renderMainContent dari script lama di sini jika perlu)
    // Untuk mempersingkat, pastikan di index.html memanggil logika render yang sesuai.
}

function renderNewsGrid(items) {
    const container = document.getElementById('newsGrid');
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = '<p class="col-span-2 text-center opacity-50 font-mono">NO NEWS REPORT YET.</p>';
        return;
    }

    container.innerHTML = items.map((post, i) => `
        <article class="group relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 hover:border-sky-500 transition-all shadow-lg fade-in" style="animation-delay: ${i*0.1}s">
            <div class="h-48 overflow-hidden">
                <img src="${post.image || 'https://via.placeholder.com/600x400'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            </div>
            <div class="p-6">
                <span class="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-teal-400 mb-2 block">DEV REPORT #${i+1}</span>
                <h3 class="text-xl font-black mb-3 leading-tight dark:text-white"><a href="article.html?slug=${post.slug}">${post.title}</a></h3>
                <p class="text-sm opacity-70 line-clamp-3 mb-4">${post.excerpt}</p>
                <a href="article.html?slug=${post.slug}" class="text-xs font-bold uppercase tracking-widest decoration-sky-500 underline underline-offset-4">Read Report</a>
            </div>
        </article>
    `).join('');
    lucide.createIcons();
}

// --- RENDER NAVIGASI (LINK ARAHAN) ---
function renderNavSystem() {
    const container = document.getElementById('navLinksContainer');
    const links = [
        { id: 'home', icon: 'home', path: 'index.html' },
        { id: 'news', icon: 'rss', path: 'news.html' },       
        { id: 'blog', icon: 'book-open', path: 'blog.html' }, 
        { id: 'projects', icon: 'code', path: 'projects.html' },
        { id: 'shop', icon: 'shopping-bag', path: 'store.html' } 
    ];
    
    if(container) {
        const t = TRANSLATIONS[currentLang];
        container.innerHTML = links.map(l => `
            <a href="${l.path}" class="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-500/10 group transition-all text-left ${window.location.pathname.includes(l.path) ? 'bg-sky-500/5 text-sky-600' : ''}">
                <i data-lucide="${l.icon}" class="w-5 h-5 text-sky-600 dark:text-teal-400"></i>
                <span class="font-bold text-sm text-slate-700 dark:text-slate-300 group-hover:text-sky-600 transition-colors">
                    ${t.nav[l.id] || l.id.toUpperCase()}
                </span>
            </a>
        `).join('');
    }
}

// --- UTILS (Tema, Bahasa, Drawer) ---
// (Copy-Paste fungsi toggleTheme, toggleLang, toggleDrawer, updateLanguageUI dari script V3.0 sebelumnya di sini)
// Pastikan fungsi-fungsi utilitas dasar itu tetap ada.
function toggleDrawer(open) {
    const overlay = document.getElementById('drawerOverlay');
    const drawer = document.getElementById('drawer');
    if(open) { overlay.classList.remove('hidden'); setTimeout(()=>overlay.classList.remove('opacity-0'),10); drawer.classList.remove('-translate-x-full'); }
    else { overlay.classList.add('opacity-0'); drawer.classList.add('-translate-x-full'); setTimeout(()=>overlay.classList.add('hidden'),300); }
}

function toggleTheme() {
    isDark = !isDark;
    if(isDark) { document.documentElement.classList.add('dark'); document.body.classList.add('dark-mode'); localStorage.setItem('theme','dark'); }
    else { document.documentElement.classList.remove('dark'); document.body.classList.remove('dark-mode'); localStorage.setItem('theme','light'); }
    updateThemeUI();
}

function updateThemeUI() {
    const icon = document.getElementById('themeIcon');
    if(icon) icon.setAttribute('data-lucide', isDark ? 'moon' : 'sun');
    lucide.createIcons();
}

function toggleLang() {
    currentLang = currentLang === 'EN' ? 'ID' : 'EN';
    updateLanguageUI();
    renderNavSystem(); 
}

function updateLanguageUI() {
    const t = TRANSLATIONS[currentLang];
    const langText = document.getElementById('langText');
    if(langText) langText.innerText = t.ui.lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const keys = key.split('.');
        if(keys.length === 2 && t[keys[0]] && t[keys[0]][keys[1]]) {
            el.innerText = t[keys[0]][keys[1]];
        }
    });
}

/* ===============================
   FOOTER ACTIVE LINK HANDLER
================================ */

document.querySelectorAll('.footer-links a').forEach(link => {
  link.addEventListener('click', function () {
    document.querySelectorAll('.footer-links a')
      .forEach(l => l.classList.remove('active'));

    this.classList.add('active');
  });
});


// Start
init();
