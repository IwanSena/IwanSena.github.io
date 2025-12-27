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
    
    // 2. Render UI Global
    renderNavSystem();
    updateLanguageUI();
    updateThemeUI();
    
    if(typeof lucide !== 'undefined') lucide.createIcons();

    // 3. LOGIKA PER HALAMAN
    // A. Halaman Home
    if (document.getElementById('contentArea')) {
        fetchDataForHome(); 
    }
    
    // B. Halaman News
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
        renderHomeFeed(); // Pastikan fungsi ini ada/lengkap di bawah
    } catch (e) { console.log("Gagal load data home"); }
}

async function fetchDataForNews() {
    try {
        const res = await fetch('index.json');
        const data = await res.json();
        // Filter kategori 'News' atau tag 'News'/'Berita'
        const newsItems = data.filter(item => 
            (item.category && item.category === 'News') || 
            (item.tags && (item.tags.includes('News') || item.tags.includes('Berita')))
        );
        renderNewsGrid(newsItems);
    } catch (e) { renderNewsGrid([]); }
}

// --- RENDER FUNGSI (BAGIAN INI YANG SAYA PERBAIKI UNTUK FOLDER POSTS) ---

function renderHomeFeed() {
    const container = document.getElementById('contentArea');
    if (!container) return;
    
    // Menampilkan 12 artikel terbaru di Home
    const feed = ARTICLES.slice(0, 12); 
    
    container.innerHTML = feed.map((post, i) => `
        <article class="mb-12 border-b border-slate-200 dark:border-white/10 pb-12 last:border-0 fade-in" style="animation-delay: ${i*0.1}s">
            <div class="grid md:grid-cols-2 gap-8">
                <div class="rounded-2xl overflow-hidden bg-slate-100 h-64">
                    <img src="${post.image || 'assets/img/placeholder.jpg'}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700">
                </div>
                <div class="flex flex-col justify-center">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 text-[10px] font-black uppercase tracking-widest">${post.category || 'UPDATE'}</span>
                        <span class="text-xs font-mono opacity-50">${post.date}</span>
                    </div>
                    <h2 class="text-3xl font-black mb-4 leading-tight hover:text-sky-600 transition-colors">
                        <a href="posts/${post.slug}.html">${post.title}</a>
                    </h2>
                    <p class="text-slate-600 dark:text-slate-400 mb-6 line-clamp-3">${post.excerpt}</p>
                    
                    <a href="posts/${post.slug}.html" class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:gap-4 transition-all text-sky-600">
                        Read System Log <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </a>
                </div>
            </div>
        </article>
    `).join('');
    
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function renderNewsGrid(items) {
    const container = document.getElementById('newsGrid');
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center opacity-50 font-mono py-10">NO NEWS REPORT YET.</p>';
        return;
    }

    container.innerHTML = items.map((post, i) => `
        <article class="group relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 hover:border-sky-500 transition-all shadow-lg fade-in" style="animation-delay: ${i*0.1}s">
            <div class="h-48 overflow-hidden">
                <img src="${post.image || 'assets/img/placeholder.jpg'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            </div>
            <div class="p-6">
                <span class="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-teal-400 mb-2 block">DEV REPORT #${i+1}</span>
                
                <h3 class="text-xl font-black mb-3 leading-tight dark:text-white">
                    <a href="posts/${post.slug}.html">${post.title}</a>
                </h3>
                
                <p class="text-sm opacity-70 line-clamp-3 mb-4">${post.excerpt}</p>
                
                <a href="posts/${post.slug}.html" class="text-xs font-bold uppercase tracking-widest decoration-sky-500 underline underline-offset-4">Read Report</a>
            </div>
        </article>
    `).join('');
    
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

// --- RENDER NAVIGASI ---
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

// --- UTILS ---
function toggleDrawer(open) {
    const overlay = document.getElementById('drawerOverlay');
    const drawer = document.getElementById('drawer');
    if(!overlay || !drawer) return;
    
    if(open) { 
        overlay.classList.remove('hidden'); 
        setTimeout(()=>overlay.classList.remove('opacity-0'),10); 
        drawer.classList.remove('-translate-x-full'); 
    } else { 
        overlay.classList.add('opacity-0'); 
        drawer.classList.add('-translate-x-full'); 
        setTimeout(()=>overlay.classList.add('hidden'),300); 
    }
}

function toggleTheme() {
    isDark = !isDark;
    if(isDark) { document.documentElement.classList.add('dark'); document.body.classList.add('dark-mode'); localStorage.setItem('theme','dark'); }
    else { document.documentElement.classList.remove('dark'); document.body.classList.remove('dark-mode'); localStorage.setItem('theme','light'); }
    updateThemeUI();
}

function updateThemeUI() {
    const icon = document.getElementById('themeIcon');
    if(icon && typeof lucide !== 'undefined') {
        icon.setAttribute('data-lucide', isDark ? 'moon' : 'sun');
        lucide.createIcons();
    }
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

// JALANKAN
init();
