// ============================================
// Keiyoushi Extensions Directory - Vanilla JS
// ============================================

// Language data
const languageFlags = {
  'en': '🇺🇸', 'pt-BR': '🇧🇷', 'es': '🇪🇸', 'ja': '🇯🇵', 'id': '🇮🇩',
  'tr': '🇹🇷', 'ar': '🇸🇦', 'fr': '🇫🇷', 'zh': '🇨🇳', 'vi': '🇻🇳',
  'th': '🇹🇭', 'ru': '🇷🇺', 'it': '🇮🇹', 'ko': '🇰🇷', 'de': '🇩🇪',
  'all': '🌍', 'pt': '🇵🇹', 'pl': '🇵🇱', 'nl': '🇳🇱', 'uk': '🇺🇦',
  'cs': '🇨🇿', 'hu': '🇭🇺', 'ro': '🇷🇴', 'sv': '🇸🇪', 'fi': '🇫🇮',
  'da': '🇩🇰', 'no': '🇳🇴', 'el': '🇬🇷', 'he': '🇮🇱', 'hi': '🇮🇳'
};

const languageNames = {
  'en': 'English', 'pt-BR': 'Português (BR)', 'es': 'Español', 'ja': '日本語',
  'id': 'Bahasa Indonesia', 'tr': 'Türkçe', 'ar': 'العربية', 'fr': 'Français',
  'zh': '中文', 'vi': 'Tiếng Việt', 'th': 'ไทย', 'ru': 'Русский',
  'it': 'Italiano', 'ko': '한국어', 'de': 'Deutsch', 'all': 'All Languages'
};

const languagesList = [
  { code: 'en', name: 'English' },
  { code: 'pt-BR', name: 'Português (BR)' },
  { code: 'es', name: 'Español' },
  { code: 'ja', name: '日本語' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ar', name: 'العربية' },
  { code: 'fr', name: 'Français' },
  { code: 'zh', name: '中文' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'th', name: 'ไทย' },
  { code: 'ru', name: 'Русский' },
  { code: 'it', name: 'Italiano' },
  { code: 'ko', name: '한국어' },
  { code: 'de', name: 'Deutsch' },
  { code: 'all', name: 'All Languages' }
];

// App state
let allSources = [];
let filteredSources = [];
let currentPage = 1;
let itemsPerPage = 24;
let contentFilter = 'all';
let selectedLanguages = [];
let searchQuery = '';
let sortBy = 'name';
let statusCache = {};
let checkingIds = new Set();
let userPrefs = null;

// Storage keys
const STORAGE_STATUS = 'keiyoushi_status_v3';
const STORAGE_PREFS = 'keiyoushi_prefs_v3';

// ============================================
// Storage Functions
// ============================================
function loadStatusCache() {
  try {
    const data = localStorage.getItem(STORAGE_STATUS);
    statusCache = data ? JSON.parse(data) : {};
  } catch { statusCache = {}; }
}

function saveStatusCache() {
  try { localStorage.setItem(STORAGE_STATUS, JSON.stringify(statusCache)); } catch {}
}

function loadUserPrefs() {
  try {
    const data = localStorage.getItem(STORAGE_PREFS);
    userPrefs = data ? JSON.parse(data) : null;
  } catch { userPrefs = null; }
}

function saveUserPrefs() {
  try { localStorage.setItem(STORAGE_PREFS, JSON.stringify(userPrefs)); } catch {}
}

function clearStatusCache() {
  statusCache = {};
  try { localStorage.removeItem(STORAGE_STATUS); } catch {}
  renderCards();
}

// ============================================
// Welcome Screen
// ============================================
let tempContentFilter = 'all';
let tempSelectedLanguages = [];

function initWelcome() {
  const grid = document.getElementById('language-grid');
  grid.innerHTML = languagesList.map(lang => `
    <button onclick="toggleLanguage('${lang.code}')" id="lang-${lang.code}"
      class="p-4 rounded-xl border transition-all text-left flex items-center gap-3 bg-surface border-white/10 hover:bg-white/5">
      <span class="text-2xl">${languageFlags[lang.code] || '🏳️'}</span>
      <span class="font-medium text-sm">${lang.name}</span>
      <span class="ml-auto text-primary font-bold hidden" id="check-${lang.code}">✓</span>
    </button>
  `).join('');
}

function selectContent(filter) {
  tempContentFilter = filter;
  document.getElementById('step-1').classList.add('hidden');
  document.getElementById('step-2').classList.remove('hidden');
  document.getElementById('progress-2').classList.remove('bg-white/10');
  document.getElementById('progress-2').classList.add('bg-gradient-to-r', 'from-primary', 'to-secondary');
}

function goBack() {
  document.getElementById('step-2').classList.add('hidden');
  document.getElementById('step-1').classList.remove('hidden');
  document.getElementById('progress-2').classList.add('bg-white/10');
  document.getElementById('progress-2').classList.remove('bg-gradient-to-r', 'from-primary', 'to-secondary');
}

function toggleLanguage(code) {
  if (code === 'all') {
    tempSelectedLanguages = ['all'];
    languagesList.forEach(l => {
      document.getElementById(`lang-${l.code}`).classList.remove('bg-primary/20', 'border-primary');
      document.getElementById(`check-${l.code}`).classList.add('hidden');
    });
    document.getElementById('lang-all').classList.add('bg-primary/20', 'border-primary');
    document.getElementById('check-all').classList.remove('hidden');
  } else {
    const allBtn = document.getElementById('lang-all');
    const allCheck = document.getElementById('check-all');
    if (tempSelectedLanguages.includes('all')) {
      tempSelectedLanguages = [];
      allBtn.classList.remove('bg-primary/20', 'border-primary');
      allCheck.classList.add('hidden');
    }
    
    const btn = document.getElementById(`lang-${code}`);
    const check = document.getElementById(`check-${code}`);
    
    if (tempSelectedLanguages.includes(code)) {
      tempSelectedLanguages = tempSelectedLanguages.filter(l => l !== code);
      btn.classList.remove('bg-primary/20', 'border-primary');
      check.classList.add('hidden');
    } else {
      tempSelectedLanguages.push(code);
      btn.classList.add('bg-primary/20', 'border-primary');
      check.classList.remove('hidden');
    }
  }
  document.getElementById('selected-count').textContent = tempSelectedLanguages.length;
}

function skipLanguages() {
  tempSelectedLanguages = ['all'];
  finishWelcome();
}

function finishWelcome() {
  userPrefs = {
    contentFilter: tempContentFilter,
    languages: tempSelectedLanguages.length > 0 ? tempSelectedLanguages : ['all'],
    hasCompletedWelcome: true
  };
  saveUserPrefs();
  contentFilter = userPrefs.contentFilter;
  selectedLanguages = userPrefs.languages.includes('all') ? [] : userPrefs.languages;
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  initApp();
}

function resetPreferences() {
  userPrefs = null;
  try { localStorage.removeItem(STORAGE_PREFS); } catch {}
  location.reload();
}

// ============================================
// Data Loading
// ============================================
async function loadData() {
  try {
    const response = await fetch('data/sources.json');
    allSources = await response.json();
    applyFilters();
    updateStats();
    renderCards();
    renderPagination();
    renderLanguages();
  } catch (error) {
    console.error('Failed to load data:', error);
    document.getElementById('results-grid').innerHTML = `
      <div class="col-span-full text-center py-16">
        <div class="text-6xl mb-4">⚠️</div>
        <h3 class="text-xl font-semibold mb-2">Failed to load data</h3>
        <p class="text-gray-400">Please refresh the page</p>
      </div>
    `;
  }
}

// ============================================
// Filtering & Sorting
// ============================================
function applyFilters() {
  filteredSources = allSources.filter(source => {
    if (contentFilter === 'sfw' && source.nsfw) return false;
    if (contentFilter === 'nsfw' && !source.nsfw) return false;
    
    if (selectedLanguages.length > 0 && !selectedLanguages.includes('all')) {
      if (!source.language.some(l => selectedLanguages.includes(l))) return false;
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!source.name.toLowerCase().includes(q) && 
          !source.url.toLowerCase().includes(q) && 
          !source.id.includes(q)) return false;
    }
    
    return true;
  });
  
  filteredSources.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'version') return b.version.localeCompare(a.version);
    if (sortBy === 'language') return (a.language[0] || '').localeCompare(b.language[0] || '');
    return 0;
  });
  
  currentPage = 1;
  updateStats();
  renderCards();
  renderPagination();
  updateClearButton();
}

function updateStats() {
  const total = allSources.length;
  const nsfw = allSources.filter(s => s.nsfw).length;
  const sfw = total - nsfw;
  const filtered = filteredSources.length;
  
  document.getElementById('stat-total').textContent = total.toLocaleString();
  document.getElementById('stat-sfw').textContent = sfw.toLocaleString();
  document.getElementById('stat-nsfw').textContent = nsfw.toLocaleString();
  document.getElementById('stat-filtered').textContent = filtered.toLocaleString();
  document.getElementById('showing-count').textContent = filtered.toLocaleString();
  document.getElementById('total-count').textContent = total.toLocaleString();
  document.getElementById('footer-total').textContent = total.toLocaleString();
  document.getElementById('footer-filtered').textContent = filtered.toLocaleString();
}

function updateClearButton() {
  const hasFilters = searchQuery || selectedLanguages.length > 0 || contentFilter !== 'all';
  document.getElementById('clear-filters').classList.toggle('hidden', !hasFilters);
}

// ============================================
// Rendering
// ============================================
function renderCards() {
  const grid = document.getElementById('results-grid');
  const noResults = document.getElementById('no-results');
  
  if (filteredSources.length === 0) {
    grid.innerHTML = '';
    noResults.classList.remove('hidden');
    return;
  }
  
  noResults.classList.add('hidden');
  const start = (currentPage - 1) * itemsPerPage;
  const pageSources = filteredSources.slice(start, start + itemsPerPage);
  
  grid.innerHTML = pageSources.map(source => {
    const status = getStatus(source.id);
    const isChecking = checkingIds.has(source.id);
    const statusColor = status === 'online' ? 'bg-emerald-500' : status === 'offline' ? 'bg-red-500' : 'bg-gray-500';
    const statusText = status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Unknown';
    const statusTextColor = status === 'online' ? 'text-emerald-400' : status === 'offline' ? 'text-red-400' : 'text-gray-400';
    
    const langFlags = source.language.slice(0, 6).map(l => `<span class="text-lg" title="${l}">${languageFlags[l] || '🏳️'}</span>`).join('');
    const moreLangs = source.language.length > 6 ? `<span class="text-xs text-gray-500 px-1">+${source.language.length - 6}</span>` : '';
    
    const nsfwBadge = source.nsfw ? `<span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">NSFW</span>` : '';
    
    const contentSection = source.nsfw ? `
      <button onclick="showNSFW('${source.id}')" id="nsfw-btn-${source.id}" class="w-full py-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-medium transition-all flex items-center justify-center gap-2 border border-rose-500/30">
        <span>🔞</span> Show NSFW Content
      </button>
      <div id="content-${source.id}" class="hidden space-y-2">
        <code class="block w-full text-xs text-gray-400 bg-black/30 px-3 py-2.5 rounded-lg truncate font-mono">${source.url}</code>
        <div class="flex gap-2">
          <button onclick="copyUrl('${source.id}')" id="copy-${source.id}" class="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-all flex items-center justify-center gap-2">📋 Copy</button>
          <a href="${source.url}" target="_blank" rel="noopener noreferrer" class="flex-1 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium transition-all flex items-center justify-center gap-2">↗ Visit</a>
        </div>
      </div>
    ` : `
      <div class="space-y-2">
        <code class="block w-full text-xs text-gray-400 bg-black/30 px-3 py-2.5 rounded-lg truncate font-mono">${source.url}</code>
        <div class="flex gap-2">
          <button onclick="copyUrl('${source.id}')" id="copy-${source.id}" class="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-all flex items-center justify-center gap-2">📋 Copy</button>
          <a href="${source.url}" target="_blank" rel="noopener noreferrer" class="flex-1 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium transition-all flex items-center justify-center gap-2">↗ Visit</a>
        </div>
      </div>
    `;
    
    return `
      <div class="card-hover bg-surface rounded-xl border overflow-hidden ${source.nsfw ? 'border-rose-500/30' : 'border-white/10'}">
        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h3 class="font-semibold text-base truncate" title="${source.name}">${source.name}</h3>
                ${nsfwBadge}
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <span class="px-2 py-1 rounded-md bg-white/5 font-mono">v${source.version}</span>
                <span class="px-2 py-1 rounded-md bg-white/5 uppercase">${source.language[0] || 'all'}</span>
              </div>
            </div>
            <button onclick="checkStatus('${source.id}')" ${isChecking ? 'disabled' : ''}
              class="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${status === 'online' ? 'bg-emerald-500/10' : status === 'offline' ? 'bg-red-500/10' : 'bg-white/5'}">
              <span class="relative flex w-2.5 h-2.5">
                ${isChecking ? '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>' : ''}
                ${status === 'online' && !isChecking ? '<span class="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>' : ''}
                <span class="relative inline-flex rounded-full w-2.5 h-2.5 ${statusColor}"></span>
              </span>
              <span class="text-xs font-medium ${statusTextColor}">${isChecking ? 'Checking...' : statusText}</span>
            </button>
          </div>
        </div>
        <div class="px-4 pb-4">
          <div class="flex flex-wrap gap-1 mb-3">${langFlags}${moreLangs}</div>
          ${contentSection}
        </div>
      </div>
    `;
  }).join('');
}

function renderPagination() {
  const totalPages = Math.ceil(filteredSources.length / itemsPerPage);
  const pagination = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (currentPage <= 3) {
    pages = [1, 2, 3, 4, '...', totalPages];
  } else if (currentPage >= totalPages - 2) {
    pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  } else {
    pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }
  
  pagination.innerHTML = `
    <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}
      class="px-4 py-2 rounded-lg bg-surface hover:bg-white/10 disabled:opacity-50 transition-all border border-white/10">← Previous</button>
    <div class="flex items-center gap-1">
      ${pages.map(p => p === '...' ? '<span class="px-3 py-2 text-gray-500">...</span>' : `
        <button onclick="goToPage(${p})" class="min-w-[40px] px-3 py-2 rounded-lg transition-all ${currentPage === p ? 'bg-primary text-white font-medium' : 'bg-surface hover:bg-white/10 border border-white/10'}">${p}</button>
      `).join('')}
    </div>
    <button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}
      class="px-4 py-2 rounded-lg bg-surface hover:bg-white/10 disabled:opacity-50 transition-all border border-white/10">Next →</button>
  `;
}

function renderLanguages() {
  const langCount = {};
  allSources.forEach(s => s.language.forEach(l => langCount[l] = (langCount[l] || 0) + 1));
  
  const sortedLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]);
  
  document.getElementById('lang-list').innerHTML = sortedLangs.map(([code, count]) => `
    <button onclick="toggleLangFilterItem('${code}')" id="lang-filter-${code}"
      class="px-3 py-2 rounded-lg text-sm transition-all border flex items-center gap-2 bg-white/5 text-gray-300 border-white/10 hover:bg-white/10">
      <span>${languageFlags[code] || '🏳️'}</span>
      <span class="font-medium">${languageNames[code] || code}</span>
      <span class="text-xs opacity-60">(${count})</span>
    </button>
  `).join('');
}

// ============================================
// Actions
// ============================================
function handleSearch(value) {
  searchQuery = value;
  document.getElementById('clear-search').classList.toggle('hidden', !value);
  applyFilters();
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  searchQuery = '';
  document.getElementById('clear-search').classList.add('hidden');
  applyFilters();
}

function setContentFilter(filter) {
  contentFilter = filter;
  ['all', 'sfw', 'nsfw'].forEach(f => {
    const btn = document.getElementById(`filter-${f}`);
    if (f === filter) {
      btn.classList.remove('hover:bg-white/5', 'text-gray-300');
      btn.classList.add('bg-primary', 'text-white');
    } else {
      btn.classList.add('hover:bg-white/5', 'text-gray-300');
      btn.classList.remove('bg-primary', 'text-white');
    }
  });
  applyFilters();
}

function toggleLangFilter() {
  document.getElementById('lang-panel').classList.toggle('hidden');
}

function toggleLangFilterItem(code) {
  const btn = document.getElementById(`lang-filter-${code}`);
  if (selectedLanguages.includes(code)) {
    selectedLanguages = selectedLanguages.filter(l => l !== code);
    btn.classList.remove('bg-secondary/30', 'text-secondary', 'border-secondary/50');
    btn.classList.add('bg-white/5', 'text-gray-300', 'border-white/10');
  } else {
    selectedLanguages.push(code);
    btn.classList.add('bg-secondary/30', 'text-secondary', 'border-secondary/50');
    btn.classList.remove('bg-white/5', 'text-gray-300', 'border-white/10');
  }
  document.getElementById('lang-btn').innerHTML = `🌍 Languages ${selectedLanguages.length > 0 ? `<span class="ml-2 px-2 py-0.5 rounded-full bg-secondary text-white text-xs">${selectedLanguages.length}</span>` : ''}`;
  applyFilters();
}

function selectTopLanguages() {
  const langCount = {};
  allSources.forEach(s => s.language.forEach(l => langCount[l] = (langCount[l] || 0) + 1));
  const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([code]) => code);
  
  selectedLanguages = [];
  document.querySelectorAll('#lang-list button').forEach(btn => {
    btn.classList.remove('bg-secondary/30', 'text-secondary', 'border-secondary/50');
    btn.classList.add('bg-white/5', 'text-gray-300', 'border-white/10');
  });
  
  topLangs.forEach(code => {
    selectedLanguages.push(code);
    const btn = document.getElementById(`lang-filter-${code}`);
    if (btn) {
      btn.classList.add('bg-secondary/30', 'text-secondary', 'border-secondary/50');
      btn.classList.remove('bg-white/5', 'text-gray-300', 'border-white/10');
    }
  });
  
  document.getElementById('lang-btn').innerHTML = `🌍 Languages <span class="ml-2 px-2 py-0.5 rounded-full bg-secondary text-white text-xs">${selectedLanguages.length}</span>`;
  applyFilters();
}

function clearLanguages() {
  selectedLanguages = [];
  document.querySelectorAll('#lang-list button').forEach(btn => {
    btn.classList.remove('bg-secondary/30', 'text-secondary', 'border-secondary/50');
    btn.classList.add('bg-white/5', 'text-gray-300', 'border-white/10');
  });
  document.getElementById('lang-btn').innerHTML = '🌍 Languages';
  applyFilters();
}

function setSort(value) {
  sortBy = value;
  applyFilters();
}

function clearAllFilters() {
  searchQuery = '';
  document.getElementById('search-input').value = '';
  document.getElementById('clear-search').classList.add('hidden');
  setContentFilter('all');
  clearLanguages();
}

function goToPage(page) {
  const totalPages = Math.ceil(filteredSources.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderCards();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// Status Checking
// ============================================
function getStatus(id) {
  const cached = statusCache[id];
  if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
    return cached.status;
  }
  return 'unknown';
}

async function checkStatus(id) {
  if (checkingIds.has(id)) return;
  
  const source = allSources.find(s => s.id === id);
  if (!source) return;
  
  checkingIds.add(id);
  renderCards();
  
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 8000);
    await fetch(source.url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
    statusCache[id] = { status: 'online', timestamp: Date.now() };
  } catch {
    statusCache[id] = { status: 'offline', timestamp: Date.now() };
  }
  
  checkingIds.delete(id);
  saveStatusCache();
  renderCards();
}

async function checkAllStatus() {
  const btn = document.getElementById('check-all-btn');
  btn.innerHTML = '<span class="animate-spin">⟳</span> Checking...';
  btn.disabled = true;
  
  const start = (currentPage - 1) * itemsPerPage;
  const pageSources = filteredSources.slice(start, start + itemsPerPage);
  const toCheck = pageSources.filter(s => !statusCache[s.id] || Date.now() - statusCache[s.id].timestamp > 10 * 60 * 1000);
  
  for (let i = 0; i < toCheck.length; i += 3) {
    await Promise.all(toCheck.slice(i, i + 3).map(s => checkStatus(s.id)));
    await new Promise(r => setTimeout(r, 200));
  }
  
  btn.innerHTML = '<span>🌐</span> Check All';
  btn.disabled = false;
}

// ============================================
// NSFW & Copy
// ============================================
function showNSFW(id) {
  document.getElementById(`nsfw-btn-${id}`).classList.add('hidden');
  document.getElementById(`content-${id}`).classList.remove('hidden');
}

async function copyUrl(id) {
  const source = allSources.find(s => s.id === id);
  if (!source) return;
  
  try {
    await navigator.clipboard.writeText(source.url);
    const btn = document.getElementById(`copy-${id}`);
    const original = btn.innerHTML;
    btn.innerHTML = '✓ Copied!';
    btn.classList.add('bg-emerald-500/20', 'text-emerald-400');
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('bg-emerald-500/20', 'text-emerald-400');
    }, 2000);
  } catch {}
}

// ============================================
// Initialization
// ============================================
function initApp() {
  loadStatusCache();
  loadData();
}

// Start
document.addEventListener('DOMContentLoaded', function() {
  loadUserPrefs();
  initWelcome();
  
  if (userPrefs && userPrefs.hasCompletedWelcome) {
    contentFilter = userPrefs.contentFilter;
    selectedLanguages = userPrefs.languages.includes('all') ? [] : userPrefs.languages;
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    initApp();
  }
});
