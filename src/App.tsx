import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, X, Shield, AlertTriangle, User, LogOut } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SourceCard } from './components/SourceCard';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { LANGUAGE_NAMES, LANGUAGE_FLAGS } from './types';
import './App.css';

// No API needed - using localStorage and direct JSON loading

interface Extension {
  name: string;
  pkg: string;
  apk: string;
  lang: string;
  code: number;
  version: string;
  nsfw: number;
  sources: { name: string; lang: string; id: string; baseUrl: string }[];
}

interface UserData {
  id: string;
  username: string;
}

function App() {
  // Data states
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [statuses, setStatuses] = useState<Record<string, any>>({});
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  // Shares are handled locally
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    languages: [] as string[],
    contentType: 'all' as 'all' | 'sfw' | 'nsfw',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Load extensions from JSON file
  useEffect(() => {
    fetch('/data/extensions.json')
      .then(res => res.json())
      .then(data => {
        setExtensions(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load extensions');
        setLoading(false);
      });
  }, []);

  // Load cached statuses from localStorage
  useEffect(() => {
    const cached = localStorage.getItem('scanhub_statuses');
    if (cached) {
      setStatuses(JSON.parse(cached));
    }
  }, []);

  // Load user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('scanhub_user');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }
  }, []);

  // Save user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('scanhub_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Calculate stats
  const stats = useMemo(() => {
    const sfw = extensions.filter(e => e.nsfw === 0).length;
    const nsfw = extensions.filter(e => e.nsfw === 1).length;
    return { total: extensions.length, sfw, nsfw };
  }, [extensions]);

  // Calculate language counts
  const languageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    extensions.forEach(ext => {
      counts[ext.lang] = (counts[ext.lang] || 0) + 1;
      ext.sources.forEach(src => {
        counts[src.lang] = (counts[src.lang] || 0) + 1;
      });
    });
    return counts;
  }, [extensions]);

  // Get all unique languages
  const languages = useMemo(() => {
    const langs = new Set<string>();
    extensions.forEach(ext => {
      langs.add(ext.lang);
      ext.sources.forEach(s => langs.add(s.lang));
    });
    return Array.from(langs).sort();
  }, [extensions]);

  // Filter extensions
  const filteredExtensions = useMemo(() => {
    let result = [...extensions];

    // Content type filter
    if (activeFilters.contentType === 'sfw') {
      result = result.filter(e => e.nsfw === 0);
    } else if (activeFilters.contentType === 'nsfw') {
      result = result.filter(e => e.nsfw === 1);
    }

    // Language filter
    if (activeFilters.languages.length > 0) {
      result = result.filter(ext =>
        activeFilters.languages.includes(ext.lang) ||
        ext.sources.some(s => activeFilters.languages.includes(s.lang))
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ext =>
        ext.name.toLowerCase().includes(query) ||
        ext.sources.some(s =>
          s.name.toLowerCase().includes(query) ||
          s.baseUrl.toLowerCase().includes(query)
        )
      );
    }

    // Sort by name
    result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [extensions, activeFilters, searchQuery]);

  // Paginated results
  const paginatedExtensions = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredExtensions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredExtensions, page]);

  const totalPages = Math.ceil(filteredExtensions.length / ITEMS_PER_PAGE);

  // Check status for a URL (client-side only)
  const checkStatus = useCallback(async (url: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const startTime = Date.now();
      await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      }).catch(() => null);
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      const status = {
        url,
        status: responseTime < 5000 ? 'online' : 'offline',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
      
      setStatuses(prev => {
        const updated = { ...prev, [url]: status };
        localStorage.setItem('scanhub_statuses', JSON.stringify(updated));
        return updated;
      });
      return status;
    } catch {
      const status = {
        url,
        status: 'offline',
        lastChecked: new Date().toISOString(),
      };
      setStatuses(prev => {
        const updated = { ...prev, [url]: status };
        localStorage.setItem('scanhub_statuses', JSON.stringify(updated));
        return updated;
      });
      return status;
    }
  }, []);

  // Handle welcome screen start
  const handleStart = useCallback((filters: { search: string; languages: string[]; contentType: 'all' | 'sfw' | 'nsfw' }) => {
    setSearchQuery(filters.search);
    setActiveFilters({
      languages: filters.languages,
      contentType: filters.contentType,
    });
    setShowWelcome(false);
  }, []);

  // Toggle language filter
  const toggleLanguage = useCallback((lang: string) => {
    setActiveFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
    setPage(1);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilters({ languages: [], contentType: 'all' });
    setPage(1);
  }, []);

  // Login (local only)
  const handleLogin = useCallback((username: string) => {
    const user = {
      id: `user-${Date.now()}`,
      username,
      joinedAt: new Date().toISOString(),
    };
    setCurrentUser(user);
    toast.success(`Welcome, ${username}!`);
  }, []);

  // Logout
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('scanhub_user');
    toast.info('Logged out');
  }, []);

  // Share extension (mock)
  const handleShare = useCallback((name: string) => {
    if (!currentUser) {
      toast.error('Please login to share');
      return;
    }
    toast.success(`Shared ${name}!`);
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-[#1f1f1f] rounded-full" />
            <div className="absolute inset-0 border-4 border-t-[#6366f1] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[#94a3b8]">Loading...</p>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ style: { background: '#141414', color: '#f8fafc', border: '1px solid #2a2a2a' } }} />
        <WelcomeScreen
          languages={languages}
          extensionsCount={languageCounts}
          totalSfw={stats.sfw}
          totalNsfw={stats.nsfw}
          onStart={handleStart}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Toaster position="top-right" toastOptions={{ style: { background: '#141414', color: '#f8fafc', border: '1px solid #2a2a2a' } }} />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <button
              onClick={() => setShowWelcome(true)}
              className="flex items-center gap-2 text-[#f8fafc] font-bold text-xl"
            >
              <span className="text-gradient">ScanHub</span>
            </button>

            {/* Search */}
            <div className="flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <Input
                type="text"
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-10 bg-[#141414] border-[#2a2a2a] text-[#f8fafc] rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-[#2a2a2a] ${showFilters ? 'bg-[#6366f1]/20 text-[#6366f1]' : 'text-[#94a3b8]'}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {(activeFilters.languages.length > 0 || activeFilters.contentType !== 'all') && (
                <span className="ml-2 w-5 h-5 rounded-full bg-[#6366f1] text-white text-xs flex items-center justify-center">
                  {activeFilters.languages.length + (activeFilters.contentType !== 'all' ? 1 : 0)}
                </span>
              )}
            </Button>

            {/* User */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#94a3b8] hidden sm:inline">{currentUser.username}</span>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-[#94a3b8]">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  const username = prompt('Enter username:');
                  if (username) handleLogin(username);
                }}
                className="border-[#2a2a2a] text-[#94a3b8]"
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>

          {/* Active Filters Bar */}
          {(activeFilters.languages.length > 0 || activeFilters.contentType !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {activeFilters.contentType !== 'all' && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                  activeFilters.contentType === 'sfw'
                    ? 'bg-[#22c55e]/20 text-[#22c55e]'
                    : 'bg-[#ef4444]/20 text-[#ef4444]'
                }`}>
                  {activeFilters.contentType === 'sfw' ? '✅ SFW Only' : '🔞 NSFW Only'}
                  <button onClick={() => setActiveFilters(p => ({ ...p, contentType: 'all' }))}>
                    <X className="w-3 h-3 ml-1" />
                  </button>
                </span>
              )}
              {activeFilters.languages.map(lang => (
                <span key={lang} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-[#6366f1]/20 text-[#6366f1]">
                  {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang] || lang}
                  <button onClick={() => toggleLanguage(lang)}>
                    <X className="w-3 h-3 ml-1" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearFilters}
                className="text-xs text-[#64748b] hover:text-[#ef4444]"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-b border-[#1f1f1f] bg-[#0f0f0f]">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Content Type */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-[#94a3b8] mb-2">Content Type</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFilters(p => ({ ...p, contentType: 'all' }))}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    activeFilters.contentType === 'all'
                      ? 'bg-[#6366f1] text-white'
                      : 'bg-[#1f1f1f] text-[#94a3b8] hover:bg-[#2a2a2a]'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setActiveFilters(p => ({ ...p, contentType: 'sfw' }))}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    activeFilters.contentType === 'sfw'
                      ? 'bg-[#22c55e] text-white'
                      : 'bg-[#1f1f1f] text-[#94a3b8] hover:bg-[#2a2a2a]'
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-1" />
                  SFW ({stats.sfw})
                </button>
                <button
                  onClick={() => setActiveFilters(p => ({ ...p, contentType: 'nsfw' }))}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    activeFilters.contentType === 'nsfw'
                      ? 'bg-[#ef4444] text-white'
                      : 'bg-[#1f1f1f] text-[#94a3b8] hover:bg-[#2a2a2a]'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  NSFW ({stats.nsfw})
                </button>
              </div>
            </div>

            {/* Languages */}
            <div>
              <h4 className="text-sm font-medium text-[#94a3b8] mb-2">Languages</h4>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      activeFilters.languages.includes(lang)
                        ? 'bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]'
                        : 'bg-[#1f1f1f] text-[#94a3b8] hover:bg-[#2a2a2a]'
                    }`}
                  >
                    {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang] || lang}
                    <span className="ml-1 text-[#64748b]">({languageCounts[lang] || 0})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[#94a3b8]">
            Showing <span className="text-[#f8fafc] font-medium">{filteredExtensions.length}</span> sources
          </p>
          <p className="text-[#64748b] text-sm">
            Page {page} of {totalPages}
          </p>
        </div>

        {/* Grid */}
        {paginatedExtensions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedExtensions.map(ext => (
              <SourceCard
                key={ext.pkg}
                extension={ext}
                siteStatus={statuses[ext.sources[0]?.baseUrl] || null}
                isAuthenticated={!!currentUser}
                onShare={handleShare}
                onCheckStatus={checkStatus}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#1f1f1f] flex items-center justify-center">
              <Search className="w-10 h-10 text-[#64748b]" />
            </div>
            <h3 className="text-xl font-semibold text-[#f8fafc] mb-2">No sources found</h3>
            <p className="text-[#94a3b8] mb-4">Try adjusting your filters</p>
            <Button onClick={clearFilters} variant="outline" className="border-[#2a2a2a]">
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-[#2a2a2a] text-[#94a3b8]"
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm ${
                    page === pageNum
                      ? 'bg-[#6366f1] text-white'
                      : 'bg-[#1f1f1f] text-[#94a3b8] hover:bg-[#2a2a2a]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="border-[#2a2a2a] text-[#94a3b8]"
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
