// --- DATA ---
const ARTICLES = [
    { id: '1', title_en: 'Building Advanced APIs with Gemini SDK', title_id: 'Membangun API Canggih dengan Gemini SDK', excerpt: 'Deep dive into Generative AI integration in Node.js applications...', content: 'Generative AI is transforming how we build backend services. This guide explores the new Gemini 3 Flash model features including advanced reasoning and lower latency.', date: '2025-05-12', author: 'IwanSena', tags: ['AI', 'NodeJS'], category: 'Tutorial', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800' },
    { id: '2', title_en: 'Why Developers Should Watch Solo Leveling', title_id: 'Kenapa Dev Harus Nonton Solo Leveling', excerpt: 'Philosophy of leveling up applied to software engineering career...', content: 'Growth is constant. Like Sung Jin-Woo, a developer must constantly refine their skills through challenges.', date: '2025-05-10', author: 'IwanSena', tags: ['Anime', 'Career'], category: 'Opinion', image: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=800' },
    { id: '3', title_en: 'Review: Mech-Keyboard 2025', title_id: 'Review: Mech-Keyboard 2025', excerpt: 'Finding maximum comfort for fingers that live on the keyboard...', content: 'After 100,000 lines of code, here is the verdict on the latest magnetic switches.', date: '2025-05-08', author: 'IwanSena', tags: ['Hardware', 'Review'], category: 'Gear', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800' },
    { id: '4', title_en: 'Optimizing React 19', title_id: 'Optimasi React 19', excerpt: 'Dissecting new features of React 19 for seamless migration...', content: 'React 19 brings the compiler we all waited for.', date: '2025-05-05', author: 'IwanSena', tags: ['React', 'Frontend'], category: 'Update', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800' },
    { id: '5', title_en: 'Discord Bot for Wibu', title_id: 'Bot Discord untuk Wibu', excerpt: 'Building an anime release schedule bot using Python...', content: 'Automate your notifications for the next episode of One Piece using Discord.py.', date: '2025-05-01', author: 'IwanSena', tags: ['Python', 'Bot'], category: 'Project', image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800' },
    { id: '6', title_en: 'Clean Architecture 2025', title_id: 'Clean Architecture 2025', excerpt: 'Maintaining large scale applications with scalable patterns...', content: 'The key to longevity in software is separation of concerns.', date: '2025-04-28', author: 'IwanSena', tags: ['Backend', 'System'], category: 'Tutorial', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800' },
    { id: '7', title_en: 'Cybersecurity Basics', title_id: 'Dasar Keamanan Siber', excerpt: 'Protecting your digital assets from common web vulnerabilities...', content: 'Security is not an afterthought. It starts with your first line of code.', date: '2025-04-20', author: 'IwanSena', tags: ['Security', 'Web'], category: 'News', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800' }
];

const NAV_ITEMS = [
    { id: 'home', icon: 'user', label_en: 'Home', label_id: 'Beranda' },
    { id: 'news', icon: 'rss', label_en: 'News', label_id: 'Berita' },
    { id: 'blog', icon: 'book-open', label_en: 'Blog', label_id: 'Blog' },
    { id: 'projects', icon: 'code', label_en: 'Projects', label_id: 'Proyek' },
    { id: 'shop', icon: 'shopping-bag', label_en: 'Store', label_id: 'Toko' }
];

// --- STATE ---
let currentLang = 'EN';
let searchQuery = '';
let currentPage = 1;
let isDark = false;
const perPage = 6;
let selectedArticle = null;

// --- DOM ELEMENTS ---
const contentArea = document.getElementById('contentArea');
const navLinksContainer = document.getElementById('navLinksContainer');
const trendingList = document.getElementById('trendingList');
const tagsCloud = document.getElementById('tagsCloud');
const searchInput = document.getElementById('searchInput');
const scrollProgress = document.getElementById('scroll-progress');
const backToTop = document.getElementById('backToTop');

// --- INITIALIZATION ---
function init() {
    // Check Dark Mode
    if(localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        isDark = true;
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-mode');
    }
    updateThemeUI();

    // Event Listeners
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1;
        selectedArticle = null;
        render();
    });

    window.addEventListener('scroll', handleScroll);

    // Initial Render
    render();
    renderSidebar();
    lucide.createIcons();
}

// --- CORE LOGIC ---
function toggleTheme() {
    isDark = !isDark;
    if(isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
    updateThemeUI();
}

function updateThemeUI() {
    const icon = document.getElementById('themeIcon');
    if(isDark) {
        icon.setAttribute('data-lucide', 'moon');
    } else {
        icon.setAttribute('data-lucide', 'sun');
    }
    lucide.createIcons();
}

function toggleLang() {
    currentLang = currentLang === 'EN' ? 'ID' : 'EN';
    document.getElementById('langText').innerText = currentLang === 'ID' ? 'EN' : 'ID';
    render();
    renderSidebar(); 
    lucide.createIcons();
}

function toggleDrawer(open) {
    const overlay = document.getElementById('drawerOverlay');
    const drawer = document.getElementById('drawer');
    if(open) {
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        drawer.classList.remove('-translate-x-full');
    } else {
        overlay.classList.add('opacity-0');
        drawer.classList.add('-translate-x-full');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

function handleScroll() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollProgress.style.width = scrolled + "%";

    if (winScroll > 400) {
        backToTop.classList.remove('opacity-0', 'pointer-events-none');
    } else {
        backToTop.classList.add('opacity-0', 'pointer-events-none');
    }
}

function resetHome() {
    selectedArticle = null;
    searchQuery = '';
    searchInput.value = '';
    currentPage = 1;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- RENDERING ---
function render() {
    contentArea.innerHTML = '';
    
    if (selectedArticle) {
        renderArticleDetail(selectedArticle);
        lucide.createIcons();
        return;
    }

    const filtered = ARTICLES.filter(a => {
        const title = currentLang === 'EN' ? a.title_en : a.title_id;
        return title.toLowerCase().includes(searchQuery.toLowerCase()) || 
               a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    if (currentPage === 1 && !searchQuery) {
        const featured = ARTICLES[0];
        const title = currentLang === 'EN' ? featured.title_en : featured.title_id;
        contentArea.innerHTML += `
            <div class="mb-20 fade-in">
                <h2 class="text-[10px] font-mono font-black uppercase tracking-[0.4em] mb-6 text-sky-600 dark:text-teal-400 flex items-center gap-2">
                    <i data-lucide="zap" class="w-4 h-4 fill-current"></i> Featured Transmissions
                </h2>
                <div onclick="viewArticle('${featured.id}')" class="relative group h-[300px] md:h-[450px] rounded-[3rem] overflow-hidden cursor-pointer border-4 border-white/5 shadow-2xl">
                    <img src="${featured.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-6 md:p-12 flex flex-col justify-end">
                        <div class="space-y-4">
                            <span class="bg-sky-500 text-white text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest inline-block">${featured.category}</span>
                            <h3 class="text-2xl md:text-5xl text-white font-black leading-tight max-w-3xl group-hover:text-sky-300 transition-colors">${title}</h3>
                            <p class="text-white/70 text-xs md:text-sm max-w-xl line-clamp-2 hidden sm:block">${featured.excerpt}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    contentArea.innerHTML += `
        <div class="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-white/10 mb-10 fade-in">
            <h2 class="text-2xl md:text-3xl font-black flex items-center gap-3 italic dark:text-white">
                <i data-lucide="layers" class="w-6 h-6 md:w-8 md:h-8 text-sky-600 dark:text-teal-400"></i> 
                ${searchQuery ? 'SEARCH_RESULTS' : 'TRANSMISSIONS_FEED'}
            </h2>
            <div class="hidden sm:block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-[0.2em]">${filtered.length} DATA PACKETS</div>
        </div>
    `;

    const totalPages = Math.ceil(filtered.length / perPage);
    const start = (currentPage - 1) * perPage;
    const pageItems = filtered.slice(start, start + perPage);

    if(pageItems.length === 0) {
        contentArea.innerHTML += `<div class="py-20 text-center text-slate-500 font-mono font-bold uppercase tracking-widest">NO_DATA_MATCHES_QUERY</div>`;
    } else {
        const listContainer = document.createElement('div');
        listContainer.className = 'grid gap-12';
        
        pageItems.forEach((article, idx) => {
            const title = currentLang === 'EN' ? article.title_en : article.title_id;
            const html = `
                <article class="group flex flex-col md:flex-row gap-8 p-6 md:p-8 rounded-[2.5rem] border transition-all manga-border bg-white border-slate-100 shadow-sm dark:bg-slate-900/40 dark:border-white/5 dark:shadow-xl fade-in" style="animation-delay: ${idx * 0.1}s">
                    <div class="w-full md:w-64 h-48 md:h-56 rounded-[1.8rem] shrink-0 overflow-hidden border border-white/5 relative">
                        <img src="${article.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                    </div>
                    <div class="flex flex-col flex-1 py-1">
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${article.tags.map(t => `<span class="px-4 py-1.5 rounded-full text-[9px] font-black font-mono uppercase tracking-widest bg-sky-500/10 text-sky-700 dark:bg-teal-500/10 dark:text-teal-400">#${t}</span>`).join('')}
                        </div>
                        <h3 class="text-2xl font-black mb-4 leading-tight group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 transition-colors">${title}</h3>
                        <p class="text-sm leading-relaxed mb-6 font-medium line-clamp-2 text-slate-700 dark:text-slate-400">${article.excerpt}</p>
                        <div class="mt-auto pt-6 flex items-center justify-between border-t border-slate-100 dark:border-white/10">
                            <div class="flex items-center gap-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">
                                <span class="text-sky-600 dark:text-teal-400">${article.date}</span>
                                <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> 5 MIN</span>
                            </div>
                            <button onclick="viewArticle('${article.id}')" class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all px-4 py-2 rounded-xl text-sky-600 hover:bg-sky-50 dark:text-teal-400 dark:hover:bg-teal-500/10 group/btn">
                                ${currentLang === 'EN' ? 'READ' : 'BACA'} <i data-lucide="arrow-right" class="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform"></i>
                            </button>
                        </div>
                    </div>
                </article>
            `;
            listContainer.innerHTML += html;
        });
        contentArea.appendChild(listContainer);
    }

    if (totalPages > 1) {
        let paginationHTML = `<div class="pt-20 flex flex-wrap items-center justify-center gap-3">`;
        
        paginationHTML += `
            <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled style="opacity:0.2"' : ''} class="flex items-center gap-2 px-6 py-3 rounded-2xl border text-[10px] font-black uppercase transition-all bg-white border-slate-200 text-sky-700 hover:bg-sky-50 shadow-sm dark:bg-slate-800 dark:border-white/10 dark:text-teal-400 dark:hover:bg-teal-500/20">
                <i data-lucide="chevron-left" class="w-4 h-4"></i> PREV
            </button>
        `;
        
        for(let i = 1; i <= totalPages; i++) {
            const activeClass = i === currentPage 
                ? 'bg-sky-600 border-sky-600 text-white shadow-lg dark:bg-teal-500 dark:border-teal-500 dark:shadow-teal-500/30' 
                : 'bg-white border-slate-200 text-slate-400 hover:bg-sky-50 dark:bg-slate-900 dark:border-white/5 dark:text-slate-500 dark:hover:border-teal-500/40';
            paginationHTML += `<button onclick="changePage(${i})" class="w-12 h-12 rounded-2xl border text-xs font-black font-mono transition-all ${activeClass}">${i}</button>`;
        }

        paginationHTML += `
            <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled style="opacity:0.2"' : ''} class="flex items-center gap-2 px-6 py-3 rounded-2xl border text-[10px] font-black uppercase transition-all bg-white border-slate-200 text-sky-700 hover:bg-sky-50 shadow-sm dark:bg-slate-800 dark:border-white/10 dark:text-teal-400 dark:hover:bg-teal-500/20">
                NEXT <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
        `;

        paginationHTML += `</div>`;
        contentArea.innerHTML += paginationHTML;
    }

    lucide.createIcons();
}

function viewArticle(id) {
    selectedArticle = ARTICLES.find(a => a.id === id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
}

function renderArticleDetail(article) {
    const title = currentLang === 'EN' ? article.title_en : article.title_id;
    contentArea.innerHTML = `
        <div class="space-y-8 fade-in">
            <button onclick="resetHome()" class="flex items-center gap-2 text-sky-600 dark:text-teal-400 font-black text-xs uppercase tracking-widest hover:-translate-x-1 transition-transform group">
                <i data-lucide="arrow-left" class="w-4 h-4 group-hover:-translate-x-1 transition-transform"></i> BACK TO FEED
            </button>
            <div class="overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white/5">
                <img src="${article.image}" class="w-full h-auto md:h-[450px] object-cover">
            </div>
            <div class="space-y-8 bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-inner">
                <h1 class="text-4xl md:text-5xl font-black leading-tight text-slate-900 dark:text-white">${title}</h1>
                <div class="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest border-y border-slate-200 dark:border-white/10 py-6">
                    <span class="flex items-center gap-2"><i data-lucide="user" class="w-3 h-3"></i> BY ${article.author}</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span class="text-sky-600 dark:text-teal-400">${article.date}</span>
                </div>
                <div class="text-lg leading-relaxed space-y-8 text-slate-700 dark:text-slate-300">
                    <p class="font-bold italic opacity-90 text-xl border-l-4 border-teal-500 pl-6 bg-teal-500/5 py-4 rounded-r-2xl">${article.excerpt}</p>
                    <p class="first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-teal-500">${article.content}</p>
                    <p>In this digital age, staying updated with high-performance architectures is not just an advantage; it is a necessity. Our exploration into modern system designs focuses on reliability, scalability, and maintainability across distributed environments.</p>
                </div>
            </div>
        </div>
    `;
}

function changePage(page) {
    currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
}

function renderSidebar() {
    navLinksContainer.innerHTML = NAV_ITEMS.map(item => `
        <button onclick="resetHome(); toggleDrawer(false)" class="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-500/10 group transition-all text-left">
            <i data-lucide="${item.icon}" class="w-5 h-5 text-sky-600 dark:text-teal-400"></i>
            <span class="font-bold text-sm text-slate-700 dark:text-slate-300 group-hover:text-sky-600 transition-colors">
                ${currentLang === 'EN' ? item.label_en : item.label_id}
            </span>
        </button>
    `).join('');

    trendingList.innerHTML = ARTICLES.slice(0, 4).map((post, idx) => `
        <button onclick="viewArticle('${post.id}')" class="flex gap-5 group text-left w-full items-start">
            <span class="text-4xl font-black transition-all font-mono leading-none text-slate-200 group-hover:text-sky-600/20 dark:text-slate-800 dark:group-hover:text-teal-500/30">${String(idx + 1).padStart(2, '0')}</span>
            <div class="space-y-1">
                <h5 class="text-sm font-black line-clamp-2 leading-tight group-hover:text-sky-600 dark:text-slate-200 dark:group-hover:text-sky-400 transition-colors">${currentLang === 'EN' ? post.title_en : post.title_id}</h5>
                <span class="text-[9px] font-mono text-slate-400 uppercase tracking-widest">${post.date}</span>
            </div>
        </button>
    `).join('');

    const allTags = [...new Set(ARTICLES.flatMap(a => a.tags))].sort();
    tagsCloud.innerHTML = allTags.map(tag => `
        <button onclick="searchQuery='${tag}'; currentPage=1; render(); window.scrollTo({top:0,behavior:'smooth'})" class="px-5 py-2.5 rounded-xl border text-[10px] font-black font-mono uppercase transition-all bg-slate-50 border-slate-200 text-slate-600 hover:bg-sky-600 hover:text-white hover:border-sky-600 dark:bg-slate-800 dark:border-white/5 dark:text-slate-400 dark:hover:text-teal-400 dark:hover:border-teal-500/50">
            ${tag}
        </button>
    `).join('');

    lucide.createIcons();
}

// Start
init();
