// --- KONFIGURASI GLOBAL ---
let ARTICLES = []; // Data akan diisi dari index.json
let filteredArticles = [];
let currentPage = 1;
const perPage = 6;
let isDark = false;
let searchQuery = '';

// --- DOM ELEMENTS ---
const contentArea = document.getElementById('contentArea');
const navLinksContainer = document.getElementById('navLinksContainer');
const trendingList = document.getElementById('trendingList');
const searchInput = document.getElementById('searchInput');
const scrollProgress = document.getElementById('scroll-progress');
const backToTop = document.getElementById('backToTop');

// --- INIT ---
function init() {
    // 1. Cek Dark Mode
    if(localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        isDark = true;
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-mode');
    }
    updateThemeUI();

    // 2. Fetch Data dari index.json (CPanel Upam Logic)
    fetchData();

    // 3. Event Listeners
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1;
        filterAndRender();
    });
    window.addEventListener('scroll', handleScroll);
}

// --- LOGIKA FETCH DATA (SSG) ---
async function fetchData() {
    try {
        // Mengambil file index.json yang di-upload ekstensi
        const response = await fetch('index.json');
        
        if (!response.ok) throw new Error("Index not found");
        
        const rawData = await response.json();
        
        // CPanel Upam biasanya memberi data: { title, slug, date, tags, ... }
        // Kita simpan ke variabel global, urutkan dari terbaru
        ARTICLES = rawData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Render Awal
        filterAndRender();
        renderSidebar();
        
    } catch (error) {
        console.error("Gagal memuat artikel:", error);
        contentArea.innerHTML = `
            <div class="text-center py-20">
                <h3 class="text-xl font-black text-slate-400 mb-2">DATABASE OFFLINE</h3>
                <p class="text-sm font-mono text-slate-500">File 'index.json' belum ditemukan. Silakan upload artikel via CPanel Upam.</p>
            </div>
        `;
    }
}

// --- FILTERING & RENDERING ---
function filterAndRender() {
    // Filter berdasarkan search
    filteredArticles = ARTICLES.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (a.tags && a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    renderList();
}

function renderList() {
    contentArea.innerHTML = '';

    // Header Feed
    contentArea.innerHTML += `
        <div class="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-white/10 mb-10 fade-in">
            <h2 class="text-2xl md:text-3xl font-black flex items-center gap-3 italic dark:text-white">
                <i data-lucide="layers" class="w-6 h-6 md:w-8 md:h-8 text-sky-600 dark:text-teal-400"></i> 
                ${searchQuery ? 'SEARCH RESULTS' : 'TRANSMISSIONS FEED'}
            </h2>
            <div class="hidden sm:block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-[0.2em]">${filteredArticles.length} LOGS</div>
        </div>
    `;

    if(filteredArticles.length === 0) {
        contentArea.innerHTML += `<div class="py-20 text-center text-slate-500 font-mono font-bold uppercase tracking-widest">NO DATA FOUND</div>`;
        lucide.createIcons();
        return;
    }

    // Pagination Logic
    const totalPages = Math.ceil(filteredArticles.length / perPage);
    const start = (currentPage - 1) * perPage;
    const pageItems = filteredArticles.slice(start, start + perPage);

    // Grid Container
    const listContainer = document.createElement('div');
    listContainer.className = 'grid gap-12';

    // Render Items
    pageItems.forEach((post, idx) => {
        // Fallback Image jika tidak ada
        const imgUrl = post.image || `https://via.placeholder.com/600x400?text=${encodeURIComponent(post.title)}`;
        const tagsHtml = post.tags ? post.tags.map(t => `<span class="px-4 py-1.5 rounded-full text-[9px] font-black font-mono uppercase tracking-widest bg-sky-500/10 text-sky-700 dark:bg-teal-500/10 dark:text-teal-400">#${t}</span>`).join('') : '';

        // Disini kita arahkan ke 'article.html?slug=...' sesuai standar CPanel Upam
        const linkUrl = `article.html?slug=${post.slug}`;

        const html = `
            <article class="group flex flex-col md:flex-row gap-8 p-6 md:p-8 rounded-[2.5rem] border transition-all manga-border bg-white border-slate-100 shadow-sm dark:bg-slate-900/40 dark:border-white/5 dark:shadow-xl fade-in" style="animation-delay: ${idx * 0.1}s">
                <div class="w-full md:w-64 h-48 md:h-56 rounded-[1.8rem] shrink-0 overflow-hidden border border-white/5 relative">
                    <img src="${imgUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                </div>
                <div class="flex flex-col flex-1 py-1">
                    <div class="flex flex-wrap gap-2 mb-4">${tagsHtml}</div>
                    <h3 class="text-2xl font-black mb-4 leading-tight group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 transition-colors">
                        <a href="${linkUrl}">${post.title}</a>
                    </h3>
                    <div class="mt-auto pt-6 flex items-center justify-between border-t border-slate-100 dark:border-white/10">
                        <div class="flex items-center gap-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">
                            <span class="text-sky-600 dark:text-teal-400">${post.date}</span>
                        </div>
                        <a href="${linkUrl}" class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all px-4 py-2 rounded-xl text-sky-600 hover:bg-sky-50 dark:text-teal-400 dark:hover:bg-teal-500/10 group/btn">
                            READ LOG <i data-lucide="arrow-right" class="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
        listContainer.innerHTML += html;
    });
    contentArea.appendChild(listContainer);

    // Pagination Controls (Tetap sama seperti request awal)
    if (totalPages > 1) {
        renderPagination(totalPages);
    }
    
    lucide.createIcons();
}

function renderPagination(totalPages) {
    let html = `<div class="pt-20 flex flex-wrap items-center justify-center gap-3">`;
    // Prev
    html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled style="opacity:0.2"' : ''} class="flex items-center gap-2 px-6 py-3 rounded-2xl border text-[10px] font-black uppercase transition-all bg-white border-slate-200 text-sky-700 hover:bg-sky-50 shadow-sm dark:bg-slate-800 dark:border-white/10 dark:text-teal-400 dark:hover:bg-teal-500/20"><i data-lucide="chevron-left" class="w-4 h-4"></i> PREV</button>`;
    // Numbers
    for(let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'bg-sky-600 border-sky-600 text-white shadow-lg dark:bg-teal-500 dark:border-teal-500 dark:shadow-teal-500/30' : 'bg-white border-slate-200 text-slate-400 hover:bg-sky-50 dark:bg-slate-900 dark:border-white/5 dark:text-slate-500 dark:hover:border-teal-500/40';
        html += `<button onclick="changePage(${i})" class="w-12 h-12 rounded-2xl border text-xs font-black font-mono transition-all ${activeClass}">${i}</button>`;
    }
    // Next
    html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled style="opacity:0.2"' : ''} class="flex items-center gap-2 px-6 py-3 rounded-2xl border text-[10px] font-black uppercase transition-all bg-white border-slate-200 text-sky-700 hover:bg-sky-50 shadow-sm dark:bg-slate-800 dark:border-white/10 dark:text-teal-400 dark:hover:bg-teal-500/20">NEXT <i data-lucide="chevron-right" class="w-4 h-4"></i></button>`;
    html += `</div>`;
    contentArea.innerHTML += html;
}

function changePage(page) {
    currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderList();
}

function renderSidebar() {
    // Navigasi statis
    const navItems = [
        { icon: 'home', label: 'Home' },
        { icon: 'rss', label: 'Updates' }
    ];
    navLinksContainer.innerHTML = navItems.map(item => `
        <button onclick="window.location.href='index.html'" class="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-500/10 group transition-all text-left">
            <i data-lucide="${item.icon}" class="w-5 h-5 text-sky-600 dark:text-teal-400"></i>
            <span class="font-bold text-sm text-slate-700 dark:text-slate-300 group-hover:text-sky-600 transition-colors">${item.label}</span>
        </button>
    `).join('');

    // Recent Logs (Ambil 4 teratas dari fetch data)
    trendingList.innerHTML = ARTICLES.slice(0, 4).map((post, idx) => `
        <a href="article.html?slug=${post.slug}" class="flex gap-5 group text-left w-full items-start">
            <span class="text-4xl font-black transition-all font-mono leading-none text-slate-200 group-hover:text-sky-600/20 dark:text-slate-800 dark:group-hover:text-teal-500/30">${String(idx + 1).padStart(2, '0')}</span>
            <div class="space-y-1">
                <h5 class="text-sm font-black line-clamp-2 leading-tight group-hover:text-sky-600 dark:text-slate-200 dark:group-hover:text-sky-400 transition-colors">${post.title}</h5>
                <span class="text-[9px] font-mono text-slate-400 uppercase tracking-widest">${post.date}</span>
            </div>
        </a>
    `).join('');
    
    lucide.createIcons();
}

// UI Utilities
function toggleDrawer(open) {
    const overlay = document.getElementById('drawerOverlay');
    const drawer = document.getElementById('drawer');
    if(open) { overlay.classList.remove('hidden'); setTimeout(() => overlay.classList.remove('opacity-0'), 10); drawer.classList.remove('-translate-x-full'); }
    else { overlay.classList.add('opacity-0'); drawer.classList.add('-translate-x-full'); setTimeout(() => overlay.classList.add('hidden'), 300); }
}

function toggleTheme() {
    isDark = !isDark;
    if(isDark) { document.documentElement.classList.add('dark'); document.body.classList.add('dark-mode'); localStorage.setItem('theme', 'dark'); }
    else { document.documentElement.classList.remove('dark'); document.body.classList.remove('dark-mode'); localStorage.setItem('theme', 'light'); }
    updateThemeUI();
}

function updateThemeUI() {
    const icon = document.getElementById('themeIcon');
    if(isDark) icon.setAttribute('data-lucide', 'moon');
    else icon.setAttribute('data-lucide', 'sun');
    lucide.createIcons();
}

function handleScroll() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollProgress.style.width = scrolled + "%";
    if (winScroll > 400) backToTop.classList.remove('opacity-0', 'pointer-events-none');
    else backToTop.classList.add('opacity-0', 'pointer-events-none');
}

// Start
init();
window.onload = function() { lucide.createIcons(); };
