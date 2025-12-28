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
    renderStaticPagesLinks(); // Render link footer (DMCA, dll)
    updateLanguageUI();
    updateThemeUI();
    
    if(typeof lucide !== 'undefined') lucide.createIcons();

    // 3. LOGIKA PER HALAMAN
    if (document.getElementById('contentArea')) fetchDataForHome(); 
    if (document.getElementById('newsGrid')) fetchDataForNews();
}

// --- FETCH DATA (SSG) ---
async function fetchDataForHome() {
    try {
        const res = await fetch('index.json'); // Ambil database
        const data = await res.json();
        ARTICLES = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        renderHomeFeed();
    } catch (e) { console.error("Gagal load index.json", e); }
}

async function fetchDataForNews() {
    try {
        const res = await fetch('index.json');
        const data = await res.json();
        // Filter: Hanya yang kategorinya News, atau punya tag News/Berita
        const newsItems = data.filter(item => 
            (item.category && item.category === 'News') || 
            (item.tags && (item.tags.includes('News') || item.tags.includes('Berita')))
        );
        renderNewsGrid(newsItems);
    } catch (e) { renderNewsGrid([]); }
}

// --- RENDER FUNGSI (LOGIKA TAMPILAN BARU) ---

function renderHomeFeed() {
    const container = document.getElementById('contentArea');
    if (!container) return;
    
    const feed = ARTICLES.slice(0, 12); // Tampilkan 12 artikel terbaru
    
    container.innerHTML = feed.map((post, i) => `
        <article class="mb-12 border-b border-slate-200 dark:border-white/10 pb-12 last:border-0 fade-in" style="animation-delay: ${i*0.1}s">
            <div class="grid md:grid-cols-2 gap-8">
                <div class="rounded-2xl overflow-hidden bg-slate-100 h-64 border border-slate-200 dark:border-white/5">
                    <img src="${post.image || 'assets/img/placeholder.jpg'}" 
                         onerror="this.src='https://placehold.co/600x400?text=No+Image'"
                         class="w-full h-full object-cover hover:scale-105 transition-transform duration-700">
                </div>

                <div class="flex flex-col justify-center">
                    <div class="flex flex-wrap items-center gap-2 mb-4">
                        <span class="px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-500/20">
                            ${post.category || 'UPDATE'}
                        </span>
                        
                        <span class="text-xs font-mono opacity-50 mr-2 flex items-center gap-1">
                            <i data-lucide="calendar" class="w-3 h-3"></i> ${post.date}
                        </span>
                        
                        ${post.tags ? post.tags.slice(0,3).map(tag => `
                            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded uppercase">#${tag}</span>
                        `).join('') : ''}
                    </div>

                    <h2 class="text-3xl font-black mb-4 leading-tight hover:text-sky-600 transition-colors">
                        <a href="posts/${post.slug}.html">${post.title}</a>
                    </h2>

                    <p class="text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                        ${post.excerpt}
                    </p>
                    
                    <a href="posts/${post.slug}.html" class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:gap-4 transition-all text-sky-600 group">
                        BACA SELENGKAPNYA <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
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
        container.innerHTML = '<div class="col-span-full text-center py-20 opacity-50 font-mono border-2 border-dashed border-slate-200 rounded-3xl">NO NEWS REPORT YET.</div>';
        return;
    }

    container.innerHTML = items.map((post, i) => `
        <article class="group relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 hover:border-sky-500 transition-all shadow-lg fade-in flex flex-col h-full" style="animation-delay: ${i*0.1}s">
            <div class="h-48 overflow-hidden shrink-0 relative">
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                <img src="${post.image || 'assets/img/placeholder.jpg'}" 
                     onerror="this.src='https://placehold.co/600x400?text=News'"
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                <span class="absolute bottom-3 left-4 z-20 text-white text-[10px] font-black uppercase tracking-widest bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                    ${post.date}
                </span>
            </div>
            <div class="p-6 flex flex-col flex-1">
                <div class="mb-auto">
                    <span class="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-teal-400 mb-2 block">
                        NEWS REPORT
                    </span>
                    <h3 class="text-xl font-black mb-3 leading-tight dark:text-white group-hover:text-sky-500 transition-colors">
                        <a href="posts/${post.slug}.html">${post.title}</a>
                    </h3>
                    <p class="text-sm opacity-70 line-clamp-3 mb-4">${post.excerpt}</p>
                </div>
                <a href="posts/${post.slug}.html" class="text-xs font-bold uppercase tracking-widest decoration-sky-500 underline underline-offset-4 mt-4 inline-block">
                    Read Report
                </a>
            </div>
        </article>
    `).join('');
    
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

// --- RENDER NAVIGASI UTAMA ---
function renderNavSystem() {
    const container = document.getElementById('navLinksContainer');
    // Navigasi Utama tetap di Root
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

// --- RENDER LINK STATIS (DMCA, Privacy, dll) ---
// Ini untuk persiapan folder 'pages/'
function renderStaticPagesLinks() {
    const footerLinks = document.getElementById('footerStaticLinks');
    if(footerLinks) {
        // Asumsi: File-file ini nanti Anda buat di folder 'pages/'
        footerLinks.innerHTML = `
            <a href="pages/dmca.html" class="hover:text-sky-500 transition-colors">DMCA</a> • 
            <a href="pages/privacy.html" class="hover:text-sky-500 transition-colors">Privacy</a> • 
            <a href="pages/terms.html" class="hover:text-sky-500 transition-colors">Terms</a>
        `;
    }
}

// --- UTILS (Drawer, Theme, Lang) ---
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
