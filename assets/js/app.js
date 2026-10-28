/**
 * K.S. Chandra Research Archive - Interactive Dashboard Application
 * Created and Hosted by K.S.Chandra 2026.
 */

// Application State
const state = {
  articles: typeof ARTICLES_DATA !== 'undefined' ? ARTICLES_DATA : (window.ARTICLES_DATA || []),
  searchQuery: '',
  selectedCategory: 'all',
  selectedYear: 'all',
  sortBy: 'year-desc',
  viewMode: 'grid', // 'grid' | 'list'
  activeReaderArticle: null,
  activeCitationArticle: null,
  sessionDownloadedArticleId: sessionStorage.getItem('chandra_downloaded_article_id') || null,
  sessionDownloadedArticleTitle: sessionStorage.getItem('chandra_downloaded_article_title') || null
};

// Immediately ensure all modals are closed
closeAllModals();

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
  closeAllModals();
  initUI();
  renderArticles();
  renderCitationsMasterList();
  updateSessionBanner();
  setupEventListeners();
});

// Initialize UI Elements & Counters
function initUI() {
  const countEl = document.getElementById('stat-total-articles');
  if (countEl) countEl.textContent = state.articles.length;

  const pagesCount = state.articles.reduce((acc, a) => acc + (a.page_count || 0), 0);
  const pagesEl = document.getElementById('stat-total-pages');
  if (pagesEl) pagesEl.textContent = `${pagesCount}+`;

  const years = [...new Set(state.articles.map(a => a.year))].sort();
  const yearsEl = document.getElementById('stat-years-span');
  if (yearsEl && years.length) {
    yearsEl.textContent = `${years[0]} - ${years[years.length - 1]}`;
  }

  const categories = [...new Set(state.articles.map(a => a.category))];
  const catEl = document.getElementById('stat-categories-count');
  if (catEl) catEl.textContent = categories.length;
}

// Event Listeners Setup
function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderArticles();
    });
  }

  // Clear search
  const clearSearchBtn = document.getElementById('clear-search-btn');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      state.searchQuery = '';
      renderArticles();
    });
  }

  // Category filter pills
  document.querySelectorAll('.category-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('active', 'bg-slate-900', 'text-white'));
      document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.add('bg-white', 'text-slate-700'));
      btn.classList.add('active', 'bg-slate-900', 'text-white');
      btn.classList.remove('bg-white', 'text-slate-700');
      state.selectedCategory = btn.dataset.category;
      renderArticles();
    });
  });

  // Year filter select
  const yearSelect = document.getElementById('year-filter-select');
  if (yearSelect) {
    yearSelect.addEventListener('change', (e) => {
      state.selectedYear = e.target.value;
      renderArticles();
    });
  }

  // Sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderArticles();
    });
  }

  // View mode toggles
  const gridViewBtn = document.getElementById('grid-view-btn');
  const listViewBtn = document.getElementById('list-view-btn');
  if (gridViewBtn && listViewBtn) {
    gridViewBtn.addEventListener('click', () => {
      state.viewMode = 'grid';
      gridViewBtn.classList.add('bg-slate-200', 'text-slate-900');
      listViewBtn.classList.remove('bg-slate-200', 'text-slate-900');
      renderArticles();
    });
    listViewBtn.addEventListener('click', () => {
      state.viewMode = 'list';
      listViewBtn.classList.add('bg-slate-200', 'text-slate-900');
      gridViewBtn.classList.remove('bg-slate-200', 'text-slate-900');
      renderArticles();
    });
  }

  // Reset Session button in banner
  const resetSessionBtn = document.getElementById('btn-reset-session');
  if (resetSessionBtn) {
    resetSessionBtn.addEventListener('click', resetSessionState);
  }

  // Reset Session button in limit modal
  const modalResetSessionBtn = document.getElementById('btn-modal-reset-session');
  if (modalResetSessionBtn) {
    modalResetSessionBtn.addEventListener('click', () => {
      closeModal('session-limit-modal');
      resetSessionState();
    });
  }

  // Citation agreement checkbox
  const agreeCheckbox = document.getElementById('citation-agree-checkbox');
  const confirmDownloadBtn = document.getElementById('btn-confirm-download');
  if (agreeCheckbox && confirmDownloadBtn) {
    agreeCheckbox.addEventListener('change', () => {
      confirmDownloadBtn.disabled = !agreeCheckbox.checked;
      if (agreeCheckbox.checked) {
        confirmDownloadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      } else {
        confirmDownloadBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    });

    confirmDownloadBtn.addEventListener('click', executeDownload);
  }

  // Citation tabs (Standard, APA, Chicago, BibTeX)
  document.querySelectorAll('.citation-tab-btn').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.citation-tab-btn').forEach(t => {
        t.classList.remove('border-amber-600', 'text-amber-800', 'font-semibold');
        t.classList.add('border-transparent', 'text-slate-500');
      });
      tab.classList.add('border-amber-600', 'text-amber-800', 'font-semibold');
      tab.classList.remove('border-transparent', 'text-slate-500');

      const format = tab.dataset.format;
      switchCitationFormat(format);
    });
  });

  // Keyboard shortcut to close modals on Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
}

// Filter and Sort Logic
function getFilteredArticles() {
  return state.articles.filter(article => {
    // Search filter
    if (state.searchQuery) {
      const q = state.searchQuery;
      const matchTitle = (article.title || '').toLowerCase().includes(q);
      const matchAuthors = (article.authors || []).some(a => a.toLowerCase().includes(q));
      const matchJournal = (article.journal || '').toLowerCase().includes(q);
      const matchAbstract = (article.abstract || '').toLowerCase().includes(q);
      const matchKeywords = (article.keywords || []).some(k => k.toLowerCase().includes(q));
      const matchYear = String(article.year).includes(q);
      const matchCategory = (article.category || '').toLowerCase().includes(q);
      if (!(matchTitle || matchAuthors || matchJournal || matchAbstract || matchKeywords || matchYear || matchCategory)) {
        return false;
      }
    }

    // Category filter
    if (state.selectedCategory !== 'all') {
      if ((article.category || '').toLowerCase() !== state.selectedCategory.toLowerCase()) {
        return false;
      }
    }

    // Year filter
    if (state.selectedYear !== 'all') {
      if (String(article.year) !== state.selectedYear) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    switch (state.sortBy) {
      case 'year-desc':
        return b.year - a.year || (a.title || '').localeCompare(b.title || '');
      case 'year-asc':
        return a.year - b.year || (a.title || '').localeCompare(b.title || '');
      case 'title-asc':
        return (a.title || '').localeCompare(b.title || '');
      case 'title-desc':
        return (b.title || '').localeCompare(a.title || '');
      case 'pages-desc':
        return (b.page_count || 0) - (a.page_count || 0);
      default:
        return 0;
    }
  });
}

// Render Articles Grid or List
function renderArticles() {
  const container = document.getElementById('articles-container');
  const resultsCountEl = document.getElementById('results-count');
  const emptyStateEl = document.getElementById('empty-state');
  if (!container) return;

  const filtered = getFilteredArticles();

  if (resultsCountEl) {
    resultsCountEl.textContent = `Showing ${filtered.length} of ${state.articles.length} articles`;
  }

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyStateEl) emptyStateEl.classList.remove('hidden');
    return;
  } else {
    if (emptyStateEl) emptyStateEl.classList.add('hidden');
  }

  if (state.viewMode === 'grid') {
    container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    container.innerHTML = filtered.map(article => createArticleGridCard(article)).join('');
  } else {
    container.className = 'flex flex-col space-y-4';
    container.innerHTML = filtered.map(article => createArticleListRow(article)).join('');
  }
}

// Generate Grid Card HTML
function createArticleGridCard(article) {
  const isDownloaded = state.sessionDownloadedArticleId === article.id;
  const isSessionLocked = state.sessionDownloadedArticleId && !isDownloaded;
  const badgeClass = getBadgeClass(article.category_badge);

  return `
    <div class="article-card group" data-id="${article.id}">
      <!-- Thumbnail & Header Banner -->
      <div class="card-thumbnail-wrapper relative cursor-pointer" onclick="openReaderModal('${article.id}')" title="Click to read article">
        <img src="${article.thumbnail_sm || article.thumbnail}" alt="${article.title}" loading="lazy" class="w-full h-full object-cover" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'250\\' fill=\\'%231e293b\\'><rect width=\\'100%\\' height=\\'100%\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23f59e0b\\' font-size=\\'18\\' font-family=\\'serif\\' text-anchor=\\'middle\\'>K.S. Chandra Research</text></svg>'">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/20 group-hover:from-slate-950/90 transition-all flex items-end p-4">
          <div class="w-full flex items-center justify-between text-white text-xs">
            <span class="inline-flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path></svg>
              <span>${article.page_count} Pages</span>
            </span>
            <span class="bg-amber-600/90 backdrop-blur-sm text-white font-semibold px-2.5 py-1 rounded-full text-xs">
              ${article.year}
            </span>
          </div>
        </div>
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/40">
          <span class="bg-white/95 text-slate-900 px-4 py-2 rounded-lg font-medium text-xs shadow-lg flex items-center space-x-2">
            <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            <span>Read Online</span>
          </span>
        </div>
      </div>

      <!-- Card Body -->
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <!-- Category & Period -->
          <div class="flex flex-wrap items-center gap-1.5 mb-2.5">
            <span class="badge-category ${badgeClass}">
              ${article.category_badge}
            </span>
            <span class="text-[11px] text-slate-500 font-medium">
              • ${(article.period || '').split('(')[0]}
            </span>
          </div>

          <!-- Title -->
          <h3 class="text-base font-bold text-slate-900 leading-snug group-hover:text-amber-800 transition-colors mb-2 cursor-pointer line-clamp-2" onclick="openReaderModal('${article.id}')">
            ${article.title}
          </h3>

          <!-- Authors -->
          <p class="text-xs text-slate-600 font-medium mb-2 flex items-center space-x-1">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
            <span class="truncate">${(article.authors || []).join(', ')}</span>
          </p>

          <!-- Journal / Publisher Citation Info -->
          <div class="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-3 text-xs text-slate-600">
            <div class="font-semibold text-slate-800 truncate">${article.journal}</div>
            <div class="text-[11px] text-slate-500 flex justify-between mt-1">
              <span>pp. ${article.pages}</span>
              <span>${article.issn ? `ISSN: ${article.issn}` : `ISBN: ${article.isbn || 'N/A'}`}</span>
            </div>
          </div>

          <!-- Abstract excerpt -->
          <p class="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
            ${article.abstract}
          </p>
        </div>

        <!-- Action Buttons Footer -->
        <div class="pt-3 border-t border-slate-100 flex flex-col space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <button onclick="openReaderModal('${article.id}')" class="inline-flex items-center justify-center px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition shadow-sm">
              <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              Read Online
            </button>
            <button onclick="openCitationModal('${article.id}')" class="inline-flex items-center justify-center px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition">
              <svg class="w-3.5 h-3.5 mr-1.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
              Cite Article
            </button>
          </div>

          <!-- Download Button with Session Logic Indicator -->
          ${renderDownloadButton(article, isDownloaded, isSessionLocked)}
        </div>
      </div>
    </div>
  `;
}

// Generate List Row HTML
function createArticleListRow(article) {
  const isDownloaded = state.sessionDownloadedArticleId === article.id;
  const isSessionLocked = state.sessionDownloadedArticleId && !isDownloaded;
  const badgeClass = getBadgeClass(article.category_badge);

  return `
    <div class="article-card p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" data-id="${article.id}">
      <div class="flex items-start space-x-4 flex-1">
        <div class="w-20 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer hidden sm:block" onclick="openReaderModal('${article.id}')">
          <img src="${article.thumbnail_sm || article.thumbnail}" alt="${article.title}" class="w-full h-full object-cover">
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="badge-category ${badgeClass}">
              ${article.category_badge}
            </span>
            <span class="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              ${article.year}
            </span>
            <span class="text-xs text-slate-500">
              ${article.page_count} Pages • ${article.file_size}
            </span>
          </div>
          <h3 class="text-base font-bold text-slate-900 hover:text-amber-800 transition-colors cursor-pointer truncate" onclick="openReaderModal('${article.id}')">
            ${article.title}
          </h3>
          <p class="text-xs text-slate-600 font-medium mb-1 truncate">
            ${(article.authors || []).join(', ')} — <span class="italic text-slate-500">${article.journal}</span> (pp. ${article.pages})
          </p>
          <p class="text-xs text-slate-500 line-clamp-1">
            ${article.abstract}
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        <button onclick="openReaderModal('${article.id}')" class="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition flex items-center">
          <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          Read
        </button>
        <button onclick="openCitationModal('${article.id}')" class="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition flex items-center">
          <svg class="w-3.5 h-3.5 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
          Cite
        </button>
        <div class="w-36">
          ${renderDownloadButton(article, isDownloaded, isSessionLocked, true)}
        </div>
      </div>
    </div>
  `;
}

// Render Download Button with dynamic state
function renderDownloadButton(article, isDownloaded, isSessionLocked, compact = false) {
  if (isDownloaded) {
    return `
      <button onclick="triggerDirectDownload('${article.id}')" class="w-full inline-flex items-center justify-center px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-medium transition" title="Already downloaded in this session. You can re-download this article.">
        <svg class="w-3.5 h-3.5 mr-1 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
        <span>${compact ? 'Downloaded' : 'Downloaded (Re-download)'}</span>
      </button>
    `;
  }

  if (isSessionLocked) {
    return `
      <button onclick="showSessionLimitModal('${article.id}')" class="w-full inline-flex items-center justify-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200 rounded-lg text-xs font-medium transition cursor-pointer" title="Download quota reached for this session (Limit: 1 article). Click for details.">
        <svg class="w-3.5 h-3.5 mr-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
        <span>${compact ? 'Limit Reached' : 'Session Limit (1 Article)'}</span>
      </button>
    `;
  }

  return `
    <button onclick="initiateDownload('${article.id}')" class="w-full inline-flex items-center justify-center px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold transition shadow-sm">
      <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
      <span>Download PDF</span>
    </button>
  `;
}

// Badge styling helper
function getBadgeClass(badge) {
  const map = {
    'Architecture': 'badge-architecture',
    'Iconography': 'badge-iconography',
    'Iron Age': 'badge-iron-age',
    'Trade & Culture': 'badge-trade-culture',
    'Archaeoastronomy': 'badge-archaeoastronomy',
    'Conservation': 'badge-conservation',
    'Prehistory': 'badge-prehistory'
  };
  return map[badge] || 'badge-architecture';
}

// Session State Banner Handler
function updateSessionBanner() {
  const banner = document.getElementById('session-status-banner');
  const bannerText = document.getElementById('session-status-text');
  const resetBtn = document.getElementById('btn-reset-session');
  if (!banner || !bannerText) return;

  if (state.sessionDownloadedArticleId) {
    banner.classList.add('download-used');
    banner.classList.remove('bg-blue-50', 'border-blue-500');
    bannerText.innerHTML = `
      <span class="font-bold text-amber-900">Session Limit Active:</span>
      You have downloaded <span class="font-semibold text-amber-950 underline decoration-amber-500">"${state.sessionDownloadedArticleTitle || 'one article'}"</span> during this session.
      Downloads are restricted to 1 article per session. You may continue reading all articles online or reset session below.
    `;
    if (resetBtn) resetBtn.classList.remove('hidden');
  } else {
    banner.classList.remove('download-used');
    banner.classList.add('bg-blue-50', 'border-blue-500');
    bannerText.innerHTML = `
      <span class="font-bold text-blue-900">Open Scholarly Access:</span>
      All 8 research papers are free to read online. Downloads are limited to <strong>1 article per session</strong> with mandatory citation agreement.
    `;
    if (resetBtn) resetBtn.classList.add('hidden');
  }
}

// Initiate Download Flow
function initiateDownload(articleId) {
  const article = state.articles.find(a => a.id === articleId);
  if (!article) return;

  // Check if session has already used its 1 download
  if (state.sessionDownloadedArticleId && state.sessionDownloadedArticleId !== articleId) {
    showSessionLimitModal(articleId);
    return;
  }

  // If this article was already downloaded in this session, allow direct re-download
  if (state.sessionDownloadedArticleId === articleId) {
    triggerDirectDownload(articleId);
    return;
  }

  // Open Citation Agreement Modal
  openCitationModal(articleId, true);
}

// Trigger file download directly
function triggerDirectDownload(articleId) {
  const article = state.articles.find(a => a.id === articleId);
  if (!article) return;

  const downloadUrl = `articles/${encodeURIComponent(article.file_name)}`;
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = article.file_name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Downloading: ${article.title}`);
}

// Execute Download from Agreement Modal
function executeDownload() {
  if (!state.activeCitationArticle) return;
  const article = state.activeCitationArticle;

  // Verify checkbox
  const agreeCheckbox = document.getElementById('citation-agree-checkbox');
  if (!agreeCheckbox || !agreeCheckbox.checked) {
    alert('Please check the agreement box indicating your consent to properly cite this research.');
    return;
  }

  // Record session state
  state.sessionDownloadedArticleId = article.id;
  state.sessionDownloadedArticleTitle = article.title;
  sessionStorage.setItem('chandra_downloaded_article_id', article.id);
  sessionStorage.setItem('chandra_downloaded_article_title', article.title);

  // Trigger download
  triggerDirectDownload(article.id);

  // Close modal
  closeModal('citation-modal');

  // Update banners & re-render cards to reflect lock
  updateSessionBanner();
  renderArticles();

  showToast('Citation agreement confirmed. PDF download started!', 'success');
}

// Reset Session State (Test/Administrative feature)
function resetSessionState() {
  sessionStorage.removeItem('chandra_downloaded_article_id');
  sessionStorage.removeItem('chandra_downloaded_article_title');
  state.sessionDownloadedArticleId = null;
  state.sessionDownloadedArticleTitle = null;

  updateSessionBanner();
  renderArticles();
  showToast('Session has been reset. You may now download another article.', 'info');
}

// Show Session Limit Exceeded Modal
function showSessionLimitModal(attemptedArticleId) {
  const attemptedArticle = state.articles.find(a => a.id === attemptedArticleId);
  const downloadedArticle = state.articles.find(a => a.id === state.sessionDownloadedArticleId);

  const titleEl = document.getElementById('limit-modal-downloaded-title');
  if (titleEl && downloadedArticle) {
    titleEl.textContent = `"${downloadedArticle.title}"`;
  }

  const attemptedTitleEl = document.getElementById('limit-modal-attempted-title');
  if (attemptedTitleEl && attemptedArticle) {
    attemptedTitleEl.textContent = `"${attemptedArticle.title}"`;
  }

  const readAttemptedBtn = document.getElementById('btn-read-attempted');
  if (readAttemptedBtn && attemptedArticle) {
    readAttemptedBtn.onclick = () => {
      closeModal('session-limit-modal');
      openReaderModal(attemptedArticle.id);
    };
  }

  openModal('session-limit-modal');
}

// Open Citation / Agreement Modal
function openCitationModal(articleId, isDownloadMode = false) {
  const article = state.articles.find(a => a.id === articleId);
  if (!article) return;

  state.activeCitationArticle = article;

  const modalTitle = document.getElementById('citation-modal-title');
  const modalSub = document.getElementById('citation-modal-subtitle');
  const agreementSection = document.getElementById('citation-agreement-section');
  const agreeCheckbox = document.getElementById('citation-agree-checkbox');
  const confirmDownloadBtn = document.getElementById('btn-confirm-download');
  const closeOnlyBtn = document.getElementById('btn-citation-close');

  if (modalTitle) modalTitle.textContent = article.title;
  if (modalSub) {
    modalSub.textContent = `${(article.authors || []).join(', ')} • ${article.journal} (${article.year})`;
  }

  // Populate citation texts
  document.getElementById('citation-text-original').textContent = article.citation_original;
  document.getElementById('citation-text-apa').textContent = article.citation_apa;
  document.getElementById('citation-text-chicago').textContent = article.citation_chicago;
  document.getElementById('citation-text-bibtex').textContent = article.citation_bibtex;

  // Reset tab to Original / Standard
  document.querySelectorAll('.citation-tab-btn').forEach((t, i) => {
    if (i === 0) {
      t.classList.add('border-amber-600', 'text-amber-800', 'font-semibold');
      t.classList.remove('border-transparent', 'text-slate-500');
    } else {
      t.classList.remove('border-amber-600', 'text-amber-800', 'font-semibold');
      t.classList.add('border-transparent', 'text-slate-500');
    }
  });
  switchCitationFormat('original');

  if (isDownloadMode) {
    if (agreementSection) agreementSection.classList.remove('hidden');
    if (confirmDownloadBtn) confirmDownloadBtn.classList.remove('hidden');
    if (closeOnlyBtn) closeOnlyBtn.classList.add('hidden');
    if (agreeCheckbox) agreeCheckbox.checked = false;
    if (confirmDownloadBtn) {
      confirmDownloadBtn.disabled = true;
      confirmDownloadBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
  } else {
    if (agreementSection) agreementSection.classList.add('hidden');
    if (confirmDownloadBtn) confirmDownloadBtn.classList.add('hidden');
    if (closeOnlyBtn) closeOnlyBtn.classList.remove('hidden');
  }

  openModal('citation-modal');
}

// Switch citation tab views
function switchCitationFormat(format) {
  const formats = ['original', 'apa', 'chicago', 'bibtex'];
  formats.forEach(f => {
    const el = document.getElementById(`citation-box-${f}`);
    if (el) {
      if (f === format) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });
}

// Copy active citation to clipboard
function copyCitation(format = null) {
  if (!state.activeCitationArticle) return;
  const article = state.activeCitationArticle;

  let textToCopy = article.citation_original;
  if (format === 'apa') textToCopy = article.citation_apa;
  else if (format === 'chicago') textToCopy = article.citation_chicago;
  else if (format === 'bibtex') textToCopy = article.citation_bibtex;
  else {
    const visibleBox = document.querySelector('.citation-content-box:not(.hidden)');
    if (visibleBox) {
      textToCopy = visibleBox.querySelector('pre, p').textContent;
    }
  }

  navigator.clipboard.writeText(textToCopy).then(() => {
    showToast('Citation copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy. Please manually select the text.', 'error');
  });
}

// Open Full Interactive Reader Modal
function openReaderModal(articleId) {
  const article = state.articles.find(a => a.id === articleId);
  if (!article) return;

  state.activeReaderArticle = article;

  document.getElementById('reader-title').textContent = article.title;
  document.getElementById('reader-meta').textContent = `${(article.authors || []).join(', ')} • ${article.journal} (${article.year}) • ${article.page_count} Pages`;
  document.getElementById('reader-abstract').textContent = article.abstract;
  document.getElementById('reader-region').textContent = article.region || 'Vidarbha, Maharashtra';
  document.getElementById('reader-period').textContent = article.period || 'Ancient / Medieval';
  document.getElementById('reader-citation').textContent = article.citation_original;

  // Keywords
  const kwContainer = document.getElementById('reader-keywords');
  if (kwContainer) {
    kwContainer.innerHTML = (article.keywords || []).map(kw => `
      <span class="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded border border-slate-200">
        ${kw}
      </span>
    `).join('');
  }

  // Highlights
  const hlContainer = document.getElementById('reader-highlights');
  if (hlContainer) {
    hlContainer.innerHTML = (article.highlights || []).map(hl => `
      <li class="flex items-start text-xs text-slate-600 mb-1.5">
        <svg class="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <span>${hl}</span>
      </li>
    `).join('');
  }

  // Reader Download Button
  const isDownloaded = state.sessionDownloadedArticleId === article.id;
  const isSessionLocked = state.sessionDownloadedArticleId && !isDownloaded;
  const dlBtnContainer = document.getElementById('reader-download-btn-container');
  if (dlBtnContainer) {
    dlBtnContainer.innerHTML = renderDownloadButton(article, isDownloaded, isSessionLocked);
  }

  // Iframe for PDF
  const iframe = document.getElementById('pdf-iframe');
  const pdfUrl = `articles/${encodeURIComponent(article.file_name)}#toolbar=1&navpanes=1&scrollbar=1`;
  if (iframe) {
    iframe.src = pdfUrl;
  }

  // Open in new tab link
  const openNewTabBtn = document.getElementById('btn-reader-newtab');
  if (openNewTabBtn) {
    openNewTabBtn.href = `articles/${encodeURIComponent(article.file_name)}`;
  }

  openModal('reader-modal');
}

// Toggle reader sidebar
function toggleReaderSidebar() {
  const sidebar = document.getElementById('reader-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('hidden');
  }
}

// Render Master Citations List at bottom of page
function renderCitationsMasterList() {
  const container = document.getElementById('master-citations-list');
  if (!container) return;

  container.innerHTML = state.articles.map((article, index) => `
    <div class="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm hover:border-slate-300 transition">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start space-x-3">
          <span class="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs shrink-0 mt-0.5">
            ${index + 1}
          </span>
          <div>
            <h4 class="font-bold text-slate-900 text-sm mb-1">
              ${article.title}
            </h4>
            <div class="p-3 bg-slate-50 border-l-2 border-amber-600 text-xs font-mono text-slate-700 rounded-r select-all mb-2 leading-relaxed">
              ${article.citation_original}
            </div>
            <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span class="font-medium text-slate-700">Authors:</span> ${(article.authors || []).join(', ')} |
              <span class="font-medium text-slate-700">Published:</span> ${article.journal} (${article.year}) |
              <span class="font-medium text-slate-700">Pages:</span> ${article.pages}
            </div>
          </div>
        </div>
        <button onclick="copySpecificCitation('${article.id}')" class="shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition flex items-center">
          <svg class="w-3.5 h-3.5 mr-1 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          Copy
        </button>
      </div>
    </div>
  `).join('');
}

// Copy Specific citation from master list
function copySpecificCitation(articleId) {
  const article = state.articles.find(a => a.id === articleId);
  if (!article) return;
  navigator.clipboard.writeText(article.citation_original).then(() => {
    showToast(`Citation copied for "${article.title.substring(0, 30)}..."`, 'success');
  });
}

// Export All Citations as BibTeX file
function exportAllBibtex() {
  const bibtex = state.articles.map(a => a.citation_bibtex).join('\n\n');
  const blob = new Blob([bibtex], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'KS_Chandra_Publications.bib';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('Exported all citations in BibTeX format!', 'success');
}

// Modal Management Helpers - Bulletproof visibility control
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.setProperty('display', 'flex', 'important');
    modal.classList.remove('hidden');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.setProperty('display', 'none', 'important');
    modal.classList.add('hidden');
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // If closing reader modal, clear iframe source to stop playback/memory
  if (id === 'reader-modal') {
    const iframe = document.getElementById('pdf-iframe');
    if (iframe) iframe.src = 'about:blank';
  }
}

function closeAllModals() {
  ['reader-modal', 'citation-modal', 'session-limit-modal'].forEach(id => {
    const m = document.getElementById(id);
    if (m) {
      m.style.setProperty('display', 'none', 'important');
      m.classList.add('hidden');
      m.classList.remove('open');
    }
  });
  document.body.style.overflow = '';
}

// Toast Notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast-notification');
  const toastText = document.getElementById('toast-text');
  const toastIcon = document.getElementById('toast-icon');
  if (!toast || !toastText) return;

  toastText.textContent = message;

  if (toastIcon) {
    if (type === 'success') {
      toastIcon.className = 'w-5 h-5 text-emerald-400';
    } else if (type === 'error') {
      toastIcon.className = 'w-5 h-5 text-rose-400';
    } else {
      toastIcon.className = 'w-5 h-5 text-amber-400';
    }
  }

  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3500);
}
