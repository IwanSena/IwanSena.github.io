// --- KONFIGURASI GLOBAL ---
let ARTICLES = [];
let filteredArticles = [];
let currentPage = 1;
const perPage = 6;
let isDark = false;
let currentLang = 'EN';
let searchQuery = '';

// --- KAMUS BAHASA (TRANSLATIONS) ---
const TRANSLATIONS = {
    EN: {
        nav: { home: 'Home', news: 'News', blog: 'Blog', projects: 'Projects', shop: 'Store' },
        ui: { 
            search: 'Search logs...', lang: 'ID', read: 'READ', sidebar: 'NAV SYSTEM', 
            mode: 'MODE', trending: 'POPULAR', meta: 'TAGS', sub: 'Subscribe for updates', 
            join: 'TRANSMIT', bio: 'Fullstack Architect', desc: 'Crafting digital experiences with high-performance code.',
            back: 'Back to Feed', featured: 'Featured Transmissions', total: 'DATA PACKETS'
        },
        footer: { uplink: 'UPLINK', grid: 'SOCIAL MATRIX', rights: 'ALL SYSTEMS GO.' }
    },
    ID: {
        nav: { home: 'Beranda', news: 'Berita', blog: 'Blog', projects: 'Proyek', shop: 'Toko' },
        ui: { 
            search: 'Cari artikel...', lang: 'EN', read: 'BACA', sidebar: 'NAVIGASI', 
            mode: 'TEMA', trending: 'POPULER', meta: 'LABEL', sub: 'Langganan update', 
            join: 'KIRIM', bio: 'Arsitek Fullstack', desc: 'Membangun pengalaman digital dengan kode berperforma tinggi.',
            back: 'Kembali', featured: 'Artikel Unggulan', total: 'DATA ARTIKEL'
        },
        footer: { uplink: 'JARINGAN', grid: 'MATRIKS SOSIAL', rights: 'SISTEM AKTIF.' }
    }
};

// Data Dummy (Jika index.json belum ada)
const DUMMY_DATA = [
    { title: 'System Ready: Waiting for Deployment', date: '2025-12-18', tags: ['System'], excerpt: 'Sistem website berhasil di-deploy. Silakan upload artikel via CPanel Upam.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800', slug: '#' }
];

// --- INIT ---
function init() {
    // 1. Cek Dark Mode
    if(localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        isDark = true;
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-mode');
    }
    
    // 2. Fetch Data
    fetchData();

    // 3. Render Static UI (NAVIGASI LENGKAP)
    renderNavSystem();

    // 4. Update Bahasa
    updateLanguageUI();

    // 5. Event Listeners
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            currentPage = 1;
            renderMainContent();
        });
    }
    window.addEventListener('scroll', handleScroll);
}

// --- LOGIKA UTAMA ---
async function fetchData() {
    try {
        const response = await fetch('index.json');
        if (!response.ok) throw new Error("Index Missing");
        const data = await response.json();
        ARTICLES = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) {
        console.log("Mode Dummy Aktif");
        ARTICLES = DUMMY_DATA;
    }
    renderMainContent();
    renderWidgets();
}

function renderMainContent() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = '';
    
    // Filter
    filteredArticles = ARTICLES.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (a.tags && a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    const t = TRANSLATIONS[currentLang];

    // Header
    contentArea.innerHTML += `
        <div class="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-white/10 mb-10 fade-in">
            <h2 class="text-2xl md:text-3xl font-black flex items-center gap-3 italic dark:text-white">
                <i data-lucide="layers" class="w-6 h-6 md:w-8 md:h-8 text-sky-600 dark:text-teal-400"></i> 
                ${searchQuery ? 'SEARCH RESULTS' : 'TRANSMISSIONS'}
            </h2>
            <div class="hidden sm:block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-[0.2em]">${filteredArticles.length} ${t.ui.total}</div>
        </div>
    `;

    if(filteredArticles.length === 0) {
        contentArea.innerHTML += `<div class="py-20 text-center text-slate-500 font-mono font-bold uppercase tracking-widest">NO DATA FOUND</div>`;
        lucide.createIcons();
        return;
    }

    // Pagination
    const totalPages = Math.ceil(filteredArticles.length / perPage);
    const start = (currentPage - 1) * perPage;
    const items = filteredArticles.slice(start, start + perPage);
    const grid = document.createElement('div');
    grid.className = 'grid gap-12';

    items.forEach((post, idx) => {
        const imgUrl = post.image || `https://via.placeholder.com/800x600?text=${encodeURIComponent(post.title)}`;
        const tags = post.tags ? post.tags.slice(0,3).map(t => `<span class="px-4 py-1.5 rounded-full text-[9px] font-black font-mono uppercase tracking-widest bg-sky-500/10 text-sky-700 dark:bg-teal-500/10 dark:text-teal-400">#${t}</span>`).join('') : '';
        const link = post.slug === '#' ? '#' : `article.html?slug=${post.slug}`;

        grid.innerHTML += `
            <article class="group flex flex-col md:flex-row gap-8 p-6 md:p-8 rounded-[2.5rem] border transition-all manga-border bg-white border-slate-100 shadow-sm dark:bg-slate-900/40 dark:border-white/5 dark:shadow-xl fade-in" style="animation-delay: ${idx * 0.1}s">
                <div class="w-full md:w-64 h-48 md:h-56 rounded-[1.8rem] shrink-0 overflow-hidden border border-white/5 relative">
                    <img src="${imgUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                </div>
                <div class="flex flex-col flex-1 py-1">
                    <div class="flex flex-wrap gap-2 mb-4">${tags}</div>
                    <h3 class="text-2xl font-black mb-4 leading-tight group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 transition-colors">
                        <a href="${link}">${post.title}</a>
                    </h3>
                    <div class="mt-auto pt-6 flex items-center justify-between border-t border-slate-100 dark:border-white/10">
                        <div class="flex items-center gap-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">
                            <span class="text-sky-600 dark:text-teal-400">${post.date || 'TODAY'}</span>
                        </div>
                        <a href="${link}" class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all px-4 py-2 rounded-xl text-sky-600 hover:bg-sky-50 dark:text-teal-400 dark:hover:bg-teal-500/10 group/btn">
                            ${t.ui.read} <i data-lucide="arrow-right" class="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
    });
    contentArea.appendChild(grid);

    // Pagination Buttons
    if(totalPages > 1) {
        let pagHtml = `<div class="pt-20 flex flex-wrap items-center justify-center gap-3">`;
        pagHtml += `<button onclick="changePage(${currentPage-1})" ${currentPage===1?'disabled style="opacity:0.5"':''} class="px-6 py-3 rounded-2xl border font-black uppercase bg-white dark:bg-slate-800 dark:border-white/10 dark:text-teal-400">PREV</button>`;
        for(let i=1; i<=totalPages; i++) {
            const active = i===currentPage ? 'bg-sky-600 text-white dark:bg-teal-500' : 'bg-white dark:bg-slate-900 dark:text-slate-500';
            pagHtml += `<button onclick="changePage(${i})" class="w-12 h-12 rounded-2xl border font-black ${active}">${i}</button>`;
        }
        pagHtml += `<button onclick="changePage(${currentPage+1})" ${currentPage===totalPages?'disabled style="opacity:0.5"':''} class="px-6 py-3 rounded-2xl border font-black uppercase bg-white dark:bg-slate-800 dark:border-white/10 dark:text-teal-400">NEXT</button>`;
        pagHtml += `</div>`;
        contentArea.innerHTML += pagHtml;
    }
    lucide.createIcons();
}

// --- RENDER NAVIGASI LENGKAP (INI BAGIAN PENTINGNYA) ---
function renderNavSystem() {
    const container = document.getElementById('navLinksContainer');
    
    // DEFINISI MENU NAVIGASI (Sesuaikan Link Disini)
    const links = [
        { id: 'home', icon: 'home', path: 'index.html' },
        { id: 'news', icon: 'rss', path: '#' },       // Link Berita
        { id: 'blog', icon: 'book-open', path: '#' }, // Link Blog
        { id: 'projects', icon: 'code', path: 'https://github.com/iwansena' },
        { id: 'shop', icon: 'shopping-bag', path: '#' } // Link Toko
    ];
    
    // Render ke HTML
    const t = TRANSLATIONS[currentLang];
    container.innerHTML = links.map(l => `
        <a href="${l.path}" onclick="toggleDrawer(false)" class="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-500/10 group transition-all text-left">
            <i data-lucide="${l.icon}" class="w-5 h-5 text-sky-600 dark:text-teal-400"></i>
            <span class="font-bold text-sm text-slate-700 dark:text-slate-300 group-hover:text-sky-600 transition-colors">
                ${t.nav[l.id] || l.id.toUpperCase()}
            </span>
        </a>
    `).join('');
    
    lucide.createIcons();
}

function renderWidgets() {
    const trendingList = document.getElementById('trendingList');
    const tagsCloud = document.getElementById('tagsCloud');
    
    if(trendingList) {
        const popular = ARTICLES.slice(0, 4);
        trendingList.innerHTML = popular.map((p, i) => `
            <a href="${p.slug==='#'?'#':'article.html?slug='+p.slug}" class="flex gap-5 group text-left w-full items-start">
                <span class="text-4xl font-black font-mono text-slate-200 dark:text-slate-800">${String(i+1).padStart(2,'0')}</span>
                <div class="space-y-1">
                    <h5 class="text-sm font-black line-clamp-2 group-hover:text-sky-600 dark:text-slate-200 transition-colors">${p.title}</h5>
                    <span class="text-[9px] font-mono text-slate-400 uppercase tracking-widest">${p.date || '-'}</span>
                </div>
            </a>
        `).join('');
    }

    if(tagsCloud) {
        const allTags = [...new Set(ARTICLES.flatMap(a => a.tags || []))].slice(0, 8);
        tagsCloud.innerHTML = allTags.map(tag => `
            <button onclick="document.getElementById('searchInput').value='${tag}'; searchQuery='${tag}'; renderMainContent()" class="px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase bg-slate-50 dark:bg-slate-800 dark:border-white/5 dark:text-slate-400 hover:bg-sky-600 hover:text-white transition-all">
                ${tag}
            </button>
        `).join('');
    }
    lucide.createIcons();
}

// --- FUNGSI UTILITAS ---
function toggleLang() {
    currentLang = currentLang === 'EN' ? 'ID' : 'EN';
    updateLanguageUI();
    renderNavSystem(); // Re-render navigasi agar bahasa berubah
    renderMainContent(); // Re-render konten utama
}

function updateLanguageUI() {
    const t = TRANSLATIONS[currentLang];
    
    // Update Tombol Bahasa
    const langText = document.getElementById('langText');
    if(langText) langText.innerText = t.ui.lang;

    // Update Elemen Statis dengan Atribut data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const keys = key.split('.');
        if(keys.length === 2 && t[keys[0]] && t[keys[0]][keys[1]]) {
            el.innerText = t[keys[0]][keys[1]];
        }
    });

    // Update Placeholder Search
    const searchInput = document.getElementById('searchInput');
    if(searchInput) searchInput.placeholder = t.ui.search;
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

function toggleDrawer(open) {
    const overlay = document.getElementById('drawerOverlay');
    const drawer = document.getElementById('drawer');
    if(open) { overlay.classList.remove('hidden'); setTimeout(()=>overlay.classList.remove('opacity-0'),10); drawer.classList.remove('-translate-x-full'); }
    else { overlay.classList.add('opacity-0'); drawer.classList.add('-translate-x-full'); setTimeout(()=>overlay.classList.add('hidden'),300); }
}

function changePage(p) {
    currentPage = p;
    window.scrollTo({top:0, behavior:'smooth'});
    renderMainContent();
}

function handleScroll() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTop = document.getElementById('backToTop');
    
    if(scrollProgress) scrollProgress.style.width = scrolled + "%";
    if(backToTop) {
        if (winScroll > 400) backToTop.classList.remove('opacity-0', 'pointer-events-none');
        else backToTop.classList.add('opacity-0', 'pointer-events-none');
    }
}

// Start
init();
window.onload = function() { lucide.createIcons(); }
