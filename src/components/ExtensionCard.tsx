import { useState } from 'react';
import { ExternalLink, Share2, Globe, Copy, Check, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import type { Extension, SiteStatus } from '@/types';
import { LANGUAGE_NAMES, LANGUAGE_FLAGS } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ExtensionCardProps {
  extension: Extension;
  siteStatus: SiteStatus;
  isAuthenticated: boolean;
  onShare: (name: string) => void;
  onCheckStatus: (url: string) => void;
}

export function ExtensionCard({
  extension,
  siteStatus,
  isAuthenticated,
  onShare,
  onCheckStatus,
}: ExtensionCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showNsfw, setShowNsfw] = useState(false);

  const mainSource = extension.sources[0];
  const allLanguages = [...new Set([extension.lang, ...extension.sources.map(s => s.lang)])];
  const isNsfw = extension.nsfw === 1;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-[#22c55e]';
      case 'offline':
        return 'bg-[#ef4444]';
      default:
        return 'bg-[#f59e0b]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      default:
        return 'Checking...';
    }
  };

  // NSFW blur effect
  if (isNsfw && !showNsfw) {
    return (
      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ef4444]/50 to-[#f59e0b]/50 rounded-2xl opacity-50 blur" />
        <div className="relative glass rounded-2xl p-5">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="w-10 h-10 text-[#ef4444] mb-3" />
            <h3 className="font-semibold text-[#f8fafc] mb-1">
              {extension.name.replace('Tachiyomi: ', '')}
            </h3>
            <span className="px-2 py-0.5 text-xs bg-[#ef4444]/20 text-[#ef4444] rounded mb-4">
              NSFW Content
            </span>
            <p className="text-sm text-[#94a3b8] mb-4">
              This extension contains adult content
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNsfw(true)}
              className="border-[#ef4444]/50 text-[#ef4444] hover:bg-[#ef4444]/10"
            >
              <Eye className="w-4 h-4 mr-2" />
              Show Content
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TooltipProvider>
        <div className={`group relative ${isNsfw ? 'nsfw-card' : ''}`}>
          {/* Glow Effect */}
          <div className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-500 ${
            isNsfw ? 'bg-gradient-to-r from-[#ef4444] to-[#f59e0b]' : 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]'
          }`} />
          
          <div className={`relative glass rounded-2xl p-5 hover:bg-[#1a1a1a] transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1 ${
            isNsfw ? 'border-[#ef4444]/30' : ''
          }`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#f8fafc] truncate pr-2 group-hover:text-gradient transition-all">
                  {extension.name.replace('Tachiyomi: ', '')}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-[#64748b] font-mono">
                    v{extension.version}
                  </span>
                  {isNsfw && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-[#ef4444]/20 text-[#ef4444] rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      NSFW
                    </span>
                  )}
                </div>
              </div>
              
              {/* Status Indicator */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onCheckStatus(mainSource.baseUrl)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#1f1f1f] hover:bg-[#2a2a2a] transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(siteStatus.status)} ${siteStatus.status === 'online' ? 'status-online' : ''}`} />
                    <span className="text-[10px] text-[#94a3b8] hidden sm:inline">
                      {getStatusText(siteStatus.status)}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to check status</p>
                  {siteStatus.responseTime && (
                    <p className="text-xs text-[#94a3b8]">
                      Response: {siteStatus.responseTime}ms
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Languages */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {allLanguages.slice(0, 3).map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#1f1f1f] text-[#94a3b8] rounded-full border border-[#2a2a2a]"
                >
                  <span>{LANGUAGE_FLAGS[lang] || '🏳️'}</span>
                  <span className="hidden sm:inline">{LANGUAGE_NAMES[lang] || lang}</span>
                </span>
              ))}
              {allLanguages.length > 3 && (
                <span className="px-2 py-0.5 text-xs bg-[#1f1f1f] text-[#64748b] rounded-full">
                  +{allLanguages.length - 3}
                </span>
              )}
            </div>

            {/* Main Source Link */}
            {mainSource && (
              <div className="mb-4 p-2 bg-[#1f1f1f] rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#6366f1] flex-shrink-0" />
                  <a
                    href={mainSource.baseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#94a3b8] hover:text-[#6366f1] transition-colors truncate flex-1"
                  >
                    {mainSource.baseUrl}
                  </a>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(mainSource.baseUrl)}
                        className="w-6 h-6 text-[#64748b] hover:text-[#f8fafc]"
                      >
                        {copiedUrl === mainSource.baseUrl ? (
                          <Check className="w-3 h-3 text-[#22c55e]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy link</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="flex-1 text-xs text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#2a2a2a]"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                View Sources
              </Button>
              
              {isAuthenticated && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onShare(extension.name)}
                      className="text-[#94a3b8] hover:text-[#6366f1] hover:bg-[#6366f1]/10"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share with community</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {isNsfw && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNsfw(false)}
                      className="text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Hide NSFW content</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className={`max-w-2xl bg-[#141414] border-[#2a2a2a] text-[#f8fafc] max-h-[90vh] overflow-y-auto ${isNsfw ? 'border-[#ef4444]/30' : ''}`}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3 flex-wrap">
              {extension.name}
              {isNsfw && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-[#ef4444]/20 text-[#ef4444] rounded">
                  <AlertTriangle className="w-3 h-3" />
                  NSFW
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Info */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#1f1f1f] rounded-lg text-center">
                <div className="text-xs text-[#64748b] mb-1">Version</div>
                <div className="text-sm font-mono text-[#f8fafc]">{extension.version}</div>
              </div>
              <div className="p-3 bg-[#1f1f1f] rounded-lg text-center">
                <div className="text-xs text-[#64748b] mb-1">Sources</div>
                <div className="text-sm font-mono text-[#f8fafc]">{extension.sources.length}</div>
              </div>
              <div className="p-3 bg-[#1f1f1f] rounded-lg text-center">
                <div className="text-xs text-[#64748b] mb-1">Languages</div>
                <div className="text-sm font-mono text-[#f8fafc]">{allLanguages.length}</div>
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#94a3b8]">Supported Languages</h4>
              <div className="flex flex-wrap gap-2">
                {allLanguages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#1f1f1f] text-[#f8fafc] rounded-lg border border-[#2a2a2a]"
                  >
                    <span className="text-lg">{LANGUAGE_FLAGS[lang] || '🏳️'}</span>
                    <span>{LANGUAGE_NAMES[lang] || lang}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#94a3b8]">Sources ({extension.sources.length})</h4>
              <div className="space-y-2">
                {extension.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#1f1f1f] rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#f8fafc]">{source.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-[#2a2a2a] text-[#94a3b8] rounded">
                        {LANGUAGE_FLAGS[source.lang]} {LANGUAGE_NAMES[source.lang] || source.lang}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#6366f1] flex-shrink-0" />
                      <a
                        href={source.baseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#94a3b8] hover:text-[#6366f1] transition-colors truncate flex-1"
                      >
                        {source.baseUrl}
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(source.baseUrl)}
                        className="w-7 h-7 text-[#64748b] hover:text-[#f8fafc]"
                      >
                        {copiedUrl === source.baseUrl ? (
                          <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="w-7 h-7 text-[#64748b] hover:text-[#6366f1]"
                      >
                        <a href={source.baseUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {isAuthenticated && (
                <Button
                  onClick={() => {
                    onShare(extension.name);
                    setShowDetails(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e0] hover:to-[#7c4fe8] text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share with Community
                </Button>
              )}
              {isNsfw && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNsfw(false);
                    setShowDetails(false);
                  }}
                  className="border-[#ef4444]/50 text-[#ef4444] hover:bg-[#ef4444]/10"
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
