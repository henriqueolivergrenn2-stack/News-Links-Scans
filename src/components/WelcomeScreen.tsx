import { useState } from 'react';
import { Search, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LANGUAGE_NAMES, LANGUAGE_FLAGS } from '@/types';

interface WelcomeScreenProps {
  languages: string[];
  extensionsCount: Record<string, number>;
  totalSfw: number;
  totalNsfw: number;
  onStart: (filters: {
    search: string;
    languages: string[];
    contentType: 'all' | 'sfw' | 'nsfw';
  }) => void;
}

export function WelcomeScreen({
  languages,
  extensionsCount,
  totalSfw,
  totalNsfw,
  onStart,
}: WelcomeScreenProps) {
  const [search, setSearch] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [contentType, setContentType] = useState<'all' | 'sfw' | 'nsfw'>('all');
  const [step, setStep] = useState(1);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const handleStart = () => {
    onStart({ search, languages: selectedLanguages, contentType });
  };

  // Get top languages by count
  const topLanguages = [...languages]
    .sort((a, b) => (extensionsCount[b] || 0) - (extensionsCount[a] || 0))
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <Zap className="w-10 h-10 text-[#6366f1]" />
              <div className="absolute inset-0 bg-[#6366f1] rounded-full blur-xl opacity-50 animate-pulse" />
            </div>
            <span className="text-3xl font-bold text-[#f8fafc]">
              Scan<span className="text-gradient">Hub</span>
            </span>
          </div>
          <p className="text-[#94a3b8] text-lg">
            Discover and share manga scan sources
          </p>
        </div>

        {step === 1 && (
          <div className="glass rounded-3xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-[#f8fafc] mb-6 text-center">
              What are you looking for?
            </h2>

            {/* Content Type Selection */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => setContentType('all')}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  contentType === 'all'
                    ? 'border-[#6366f1] bg-[#6366f1]/10'
                    : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                }`}
              >
                <div className="text-3xl mb-2">📚</div>
                <div className="font-semibold text-[#f8fafc]">All</div>
                <div className="text-sm text-[#64748b]">Everything</div>
              </button>

              <button
                onClick={() => setContentType('sfw')}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  contentType === 'sfw'
                    ? 'border-[#22c55e] bg-[#22c55e]/10'
                    : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                }`}
              >
                <div className="text-3xl mb-2">✅</div>
                <div className="font-semibold text-[#22c55e]">SFW</div>
                <div className="text-sm text-[#64748b]">Safe Content</div>
              </button>

              <button
                onClick={() => setContentType('nsfw')}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  contentType === 'nsfw'
                    ? 'border-[#ef4444] bg-[#ef4444]/10'
                    : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                }`}
              >
                <div className="text-3xl mb-2">🔞</div>
                <div className="font-semibold text-[#ef4444]">NSFW</div>
                <div className="text-sm text-[#64748b]">Adult Content</div>
              </button>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#f8fafc]">
                  {totalSfw + totalNsfw}
                </div>
                <div className="text-xs text-[#94a3b8]">Total Sources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#22c55e]">{totalSfw}</div>
                <div className="text-xs text-[#94a3b8]">SFW</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#ef4444]">{totalNsfw}</div>
                <div className="text-xs text-[#94a3b8]">NSFW</div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e0] hover:to-[#7c4fe8] text-white px-8"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="glass rounded-3xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-[#f8fafc] mb-2 text-center">
              Select Languages
            </h2>
            <p className="text-[#94a3b8] text-center mb-6">
              Or skip to see all languages
            </p>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
              <Input
                type="text"
                placeholder="Search languages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 bg-[#141414] border-[#2a2a2a] text-[#f8fafc] rounded-xl h-12"
              />
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6 max-h-[400px] overflow-y-auto p-2">
              {topLanguages
                .filter(lang =>
                  search === '' ||
                  LANGUAGE_NAMES[lang]?.toLowerCase().includes(search.toLowerCase()) ||
                  lang.toLowerCase().includes(search.toLowerCase())
                )
                .map((lang) => (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedLanguages.includes(lang)
                        ? 'border-[#6366f1] bg-[#6366f1]/10'
                        : 'border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#1f1f1f]'
                    }`}
                  >
                    <span className="text-2xl">{LANGUAGE_FLAGS[lang] || '🏳️'}</span>
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-sm text-[#f8fafc] truncate">
                        {LANGUAGE_NAMES[lang] || lang}
                      </div>
                    </div>
                    <span className="text-xs text-[#64748b]">
                      {extensionsCount[lang] || 0}
                    </span>
                  </button>
                ))}
            </div>

            {/* Selected Count */}
            {selectedLanguages.length > 0 && (
              <div className="text-center mb-4">
                <span className="text-sm text-[#94a3b8]">
                  {selectedLanguages.length} language{selectedLanguages.length > 1 ? 's' : ''} selected
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="text-[#94a3b8]"
              >
                Back
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleStart}
                  className="border-[#2a2a2a] text-[#f8fafc]"
                >
                  Skip & Show All
                </Button>
                <Button
                  onClick={handleStart}
                  className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e0] hover:to-[#7c4fe8] text-white"
                >
                  Start Exploring
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
