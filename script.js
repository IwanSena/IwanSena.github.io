let ARTICLES = [];
let isDark = localStorage.getItem('theme') === 'dark';
let currentLang = 'ID';

document.addEventListener('DOMContentLoaded', () => {
    if(isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-mode');
    }
    updateThemeUI();
    fetchData();
    renderNavSystem();
    renderStaticPagesLinks();
    
    if(typeof lucide !== 'undefined') lucide.createIcons();

    initGoogleTranslate();

    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }
});

async function fetchData() {
    try {
        const res = await fetch('index.json?v=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error("Gagal load database");
        
        const data = await res.json();
        ARTICLES = data.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (document.getElementById('contentArea')) renderHomeFeed(ARTICLES);
        if (document.getElementById('newsGrid')) renderNewsGrid(ARTICLES);
        if (document.getElementById('blogGrid')) renderDynamicList('blogGrid', 'blog', 'NO BLOG ARTICLES AVAILABLE.');
        if (document.getElementById('projectsGrid')) renderProjectsDynamic();
        if (document.getElementById('storeGrid')) renderStoreDynamic();
        
        renderSidebarWidgets();

    } catch (e) { 
        console.error(e);
        const container = document.getElementById('contentArea');
        if(container) container.innerHTML = '<div class="text-center opacity-50 py-10">DATABASE CONNECTION FAILED</div>';
    }
}


function normalizeSection(value) {
    return String(value || '').trim().toLowerCase();
}

function getSectionItems(items, section) {
    const target = normalizeSection(section);
    return items.filter(item => {
        if (item.status && normalizeSection(item.status) !== 'published') return false;
        if (Array.isArray(item.sections) && item.sections.length) {
            return item.sections.map(normalizeSection).includes(target);
        }
        // Backward compatibility for older posts.
        if (target === 'home') return true;
        if (target === 'blog') return !['news', 'project', 'projects', 'store'].includes(normalizeSection(item.category));
        if (target === 'news') return normalizeSection(item.category) === 'news' || (item.tags || []).some(t => ['news','berita'].includes(normalizeSection(t)));
        if (target === 'projects') return ['project','projects'].includes(normalizeSection(item.category)) || (item.tags || []).some(t => ['project','projects'].includes(normalizeSection(t)));
        if (target === 'store') return normalizeSection(item.category) === 'store' || (item.tags || []).some(t => ['store','product','produk'].includes(normalizeSection(t)));
        return false;
    }).sort((a,b) => new Date(b.date) - new Date(a.date));
}

function renderDynamicList(containerId, section, emptyText) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const items = getSectionItems(ARTICLES, section);
    if (!items.length) {
        container.innerHTML = '<div class="text-center py-20 opacity-50 font-mono text-xs">' + emptyText + '</div>';
        return;
    }
    container.innerHTML = items.map(post => `
        <a href="posts/${encodeURIComponent(post.slug)}.html" class="group flex items-center justify-between p-5 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:border-white/5 transition-all">
            <div>
                <div class="text-[10px] uppercase tracking-widest text-sky-600 dark:text-teal-400 font-black mb-2">${post.category || section.toUpperCase()}</div>
                <h3 class="font-bold text-lg text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-teal-400 transition-colors">${post.title || 'Untitled'}</h3>
                <span class="text-xs font-mono text-slate-400">${post.date || ''}${(post.tags || []).length ? ' • ' + post.tags.slice(0,2).join(' • ') : ''}</span>
                <p class="text-sm opacity-70 mt-2 line-clamp-2">${post.excerpt || ''}</p>
            </div>
            <i data-lucide="arrow-up-right" class="w-4 h-4 text-slate-300 group-hover:text-sky-600 transition-all shrink-0"></i>
        </a>`).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderProjectsDynamic() {
    const container = document.getElementById('projectsGrid');
    if (!container) return;
    const items = getSectionItems(ARTICLES, 'projects');
    if (!items.length) {
        container.innerHTML = '<div class="col-span-full text-center py-20 opacity-50 font-mono text-xs">NO PROJECTS AVAILABLE.</div>';
        return;
    }
    container.innerHTML = items.map(post => `
        <a href="posts/${encodeURIComponent(post.slug)}.html" class="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800">
            <img src="${post.image || 'assets/img/placeholder.jpg'}" onerror="this.src='https://placehold.co/400x600?text=Project'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <div><div class="text-[9px] uppercase tracking-widest text-teal-300 font-black mb-1">PROJECT</div><h3 class="text-white font-black text-lg leading-tight">${post.title || ''}</h3></div>
            </div>
        </a>`).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderStoreDynamic() {
    const container = document.getElementById('storeGrid');
    if (!container) return;
    const items = getSectionItems(ARTICLES, 'store');
    if (!items.length) {
        container.innerHTML = '<div class="col-span-full text-center py-20 opacity-50 font-mono text-xs">NO STORE ITEMS AVAILABLE.</div>';
        return;
    }
    container.innerHTML = items.map(post => `
        <article class="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all">
            <a href="posts/${encodeURIComponent(post.slug)}.html" class="h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 block">
                <img src="${post.image || 'assets/img/placeholder.jpg'}" onerror="this.src='https://placehold.co/600x400?text=Store'" class="w-full h-full object-cover">
            </a>
            <div><span class="text-[10px] font-mono text-sky-600 dark:text-teal-400 uppercase font-bold">STORE</span>
                <h3 class="font-black text-xl dark:text-white mt-1"><a href="posts/${encodeURIComponent(post.slug)}.html">${post.title || ''}</a></h3>
                <p class="text-sm mt-3 opacity-70 line-clamp-3">${post.excerpt || ''}</p>
            </div>
            <a href="posts/${encodeURIComponent(post.slug)}.html" class="mt-auto px-4 py-2 bg-slate-900 dark:bg-white dark:text-black text-white rounded-lg text-xs font-bold uppercase text-center">View Item</a>
        </article>`).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderHomeFeed(items) {
    const container = document.getElementById('contentArea');
    if (!container) return;
    
    const feed = getSectionItems(items, 'home').slice(0, 10); 
    
    if (feed.length === 0) {
        container.innerHTML = '<div class="text-center opacity-50 py-10 border-2 border-dashed border-slate-200 rounded-xl">DATA TIDAK DITEMUKAN</div>';
        return;
    }

    container.innerHTML = feed.map((post, i) => `
        <article class="mb-12 border-b border-slate-200 dark:border-white/10 pb-12 last:border-0 fade-in">
            <div class="grid md:grid-cols-2 gap-8">
                <div class="rounded-2xl overflow-hidden bg-slate-100 h-64 border border-slate-200 dark:border-white/5 relative group">
                    <img src="${post.image || 'assets/img/placeholder.jpg'}" 
                         onerror="this.src='https://placehold.co/600x400?text=No+Image'"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                    <div class="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        ${post.category || 'UPDATE'}
                    </div>
                </div>

                <div class="flex flex-col justify-center">
                    
                    <div class="flex flex-wrap items-center gap-2 mb-3">
                        <span class="text-xs font-mono opacity-60 flex items-center gap-1 mr-2">
                            <i data-lucide="calendar" class="w-3 h-3"></i> ${post.date}
                        </span>
                        
                        ${post.tags ? post.tags.slice(0, 3).map(tag => `
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-sky-50 text-sky-600 dark:bg-white/5 dark:text-sky-400 border border-sky-100 dark:border-white/5">
                                #${tag}
                            </span>
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

function handleSearch(keyword) {
    const term = keyword.toLowerCase();
    
    const filtered = ARTICLES.filter(item => 
        item.title.toLowerCase().includes(term) || 
        (item.excerpt && item.excerpt.toLowerCase().includes(term)) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term)))
    );
    
    if (document.getElementById('contentArea')) renderHomeFeed(filtered);
    if (document.getElementById('newsGrid')) renderNewsGrid(filtered);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderSidebarWidgets() {
    const popularContainer = document.getElementById('popularPosts');
    if (popularContainer && ARTICLES.length > 0) {
        const shuffled = [...ARTICLES].sort(() => 0.5 - Math.random()).slice(0, 5);
        
        popularContainer.innerHTML = shuffled.map(post => `
            <a href="posts/${post.slug}.html" class="flex gap-4 group mb-5 items-center">
                <div class="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-white/10">
                    <img src="${post.image || 'assets/img/placeholder.jpg'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform">
                </div>
                <div>
                    <h4 class="font-bold text-xs leading-snug group-hover:text-sky-500 transition-colors line-clamp-2 mb-1">
                        ${post.title}
                    </h4>
                    <span class="text-[10px] opacity-40 font-mono block">${post.date}</span>
                </div>
            </a>
        `).join('');
    }

    const tagsContainer = document.getElementById('tagsCloud');
    if (tagsContainer && ARTICLES.length > 0) {
        let allTags = [];
        ARTICLES.forEach(post => {
            if(post.tags) allTags = [...allTags, ...post.tags];
        });
        
        const uniqueTags = [...new Set(allTags.map(t => t.trim()))].slice(0, 15);
        
        tagsContainer.innerHTML = uniqueTags.map(tag => `
            <button onclick="const s=document.getElementById('searchInput'); if(s){s.value='${tag}'; handleSearch('${tag}')}" 
                    class="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase rounded-lg hover:bg-sky-500 hover:text-white transition-all shadow-sm mb-2 mr-1">
                #${tag}
            </button>
        `).join('');
    }
}

function renderNewsGrid(items) {
    const container = document.getElementById('newsGrid');
    if (!container) return;

    let displayItems = items;
    const searchBox = document.getElementById('searchInput');
    if (searchBox && searchBox.value === '') {
        displayItems = items.filter(item => 
            (item.category && item.category === 'News') || 
            (item.tags && (item.tags.includes('News') || item.tags.includes('Berita')))
        );
    }

    if (displayItems.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-20 opacity-50 font-mono">NO DATA AVAILABLE.</div>';
        return;
    }

    container.innerHTML = displayItems.map((post, i) => `
        <article class="group relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 hover:border-sky-500 transition-all shadow-lg fade-in flex flex-col h-full" style="animation-delay: ${i*0.1}s">
            <div class="h-48 overflow-hidden shrink-0 relative">
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                <img src="${post.image || 'assets/img/placeholder.jpg'}" onerror="this.src='https://placehold.co/600x400?text=News'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                <span class="absolute bottom-3 left-4 z-20 text-white text-[10px] font-black uppercase tracking-widest bg-black/50 px-2 py-1 rounded backdrop-blur-sm">${post.date}</span>
            </div>
            <div class="p-6 flex flex-col flex-1">
                <div class="mb-auto">
                    <span class="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-teal-400 mb-2 block">NEWS REPORT</span>
                    <h3 class="text-xl font-black mb-3 leading-tight dark:text-white group-hover:text-sky-500 transition-colors">
                        <a href="posts/${post.slug}.html">${post.title}</a>
                    </h3>
                    <p class="text-sm opacity-70 line-clamp-3 mb-4">${post.excerpt}</p>
                </div>
                <a href="posts/${post.slug}.html" class="text-xs font-bold uppercase tracking-widest decoration-sky-500 underline underline-offset-4 mt-4 inline-block">Read Report</a>
            </div>
        </article>
    `).join('');
    
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function initGoogleTranslate() {
    if (!document.getElementById('g_translate_script')) {
        const script = document.createElement('script');
        script.id = 'g_translate_script';
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(script);
    }
}

window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
        pageLanguage: 'id',
        includedLanguages: 'en,id,ja,ko,ar,zh-CN',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
};

function toggleLang() {
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
        combo.value = combo.value === 'en' ? 'id' : 'en';
        combo.dispatchEvent(new Event('change'));
        currentLang = combo.value.toUpperCase();
        updateLanguageUI();
    }
}

function renderNavSystem() {
    const container = document.getElementById('navLinksContainer');
    const links = [
        { id: 'Home', icon: 'home', path: 'index.html' },
        { id: 'News', icon: 'rss', path: 'news.html' },        
        { id: 'Blog', icon: 'book-open', path: 'blog.html' }, 
        { id: 'Projects', icon: 'code', path: 'projects.html' },
        { id: 'Store', icon: 'shopping-bag', path: 'store.html' } 
    ];
    
    if(container) {
        container.innerHTML = links.map(l => `
            <a href="${l.path}" class="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-500/10 group transition-all text-left ${window.location.pathname.includes(l.path) ? 'bg-sky-500/5 text-sky-600' : ''}">
                <i data-lucide="${l.icon}" class="w-5 h-5 text-sky-600 dark:text-teal-400"></i>
                <span class="font-bold text-sm text-slate-700 dark:text-slate-300 group-hover:text-sky-600 transition-colors">
                    ${l.id.toUpperCase()}
                </span>
            </a>
        `).join('');
    }
}

function renderStaticPagesLinks() {
    const footerLinks = document.getElementById('footerStaticLinks');
    if(footerLinks) {
        footerLinks.innerHTML = `
            <a href="pages/dmca.html" class="hover:text-sky-500 transition-colors">DMCA</a> • 
            <a href="pages/privacy.html" class="hover:text-sky-500 transition-colors">Privacy</a> • 
            <a href="pages/terms.html" class="hover:text-sky-500 transition-colors">Terms</a>
        `;
    }
}

function updateLanguageUI() {
    const langText = document.getElementById('langText');
    if(langText) langText.innerText = currentLang === 'ID' ? 'EN' : 'ID';
}

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
    if(isDark) { 
        document.documentElement.classList.add('dark'); 
        document.body.classList.add('dark-mode'); 
        localStorage.setItem('theme','dark'); 
    } else { 
        document.documentElement.classList.remove('dark'); 
        document.body.classList.remove('dark-mode'); 
        localStorage.setItem('theme','light'); 
    }
    updateThemeUI();
}

function updateThemeUI() {
    const icon = document.getElementById('themeIcon');
    if(icon && typeof lucide !== 'undefined') {
        icon.setAttribute('data-lucide', isDark ? 'moon' : 'sun');
        lucide.createIcons();
    }
}
