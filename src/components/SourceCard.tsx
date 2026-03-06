import { useState, useCallback } from 'react';
import { ExternalLink, Copy, Check, RefreshCw, Globe, AlertTriangle, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import type { Extension } from '@/types';
import { LANGUAGE_NAMES, LANGUAGE_FLAGS } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SourceCardProps {
  extension: Extension;
  siteStatus: { status: string; lastChecked?: string; responseTime?: number } | null;
  isAuthenticated: boolean;
  onShare: (name: string) => void;
  onCheckStatus: (url: string) => Promise<any>;
}

export function SourceCard({
  extension,
  siteStatus,
  isAuthenticated: _isAuthenticated,
  onShare: _onShare,
  onCheckStatus,
}: SourceCardProps) {
  const [showNsfw, setShowNsfw] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [checking, setChecking] = useState<Record<string, boolean>>({});
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, any>>({});

  const isNsfw = extension.nsfw === 1;
  const allLanguages = [...new Set([extension.lang, ...extension.sources.map(s => s.lang)])];

  const handleCopy = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }, []);

  const handleCheckStatus = useCallback(async (url: string) => {
    setChecking(prev => ({ ...prev, [url]: true }));
    const status = await onCheckStatus(url);
    setLocalStatuses(prev => ({ ...prev, [url]: status }));
    setChecking(prev => ({ ...prev, [url]: false }));
  }, [onCheckStatus]);

  const getStatus = (url: string) => {
    return localStatuses[url] || siteStatus;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-[#22c55e]';
      case 'offline':
        return 'bg-[#ef4444]';
      default:
        return 'bg-[#64748b]';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  // NSFW Blur Screen
  if (isNsfw && !showNsfw) {
    return (
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ef4444]/30 to-[#f59e0b]/30 rounded-2xl" />
        <div className="relative glass rounded-2xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-[#ef4444] mx-auto mb-4" />
          <h3 className="font-semibold text-[#f8fafc] mb-2">
            {extension.name.replace('Tachiyomi: ', '')}
          </h3>
          <span className="inline-block px-3 py-1 text-xs bg-[#ef4444]/20 text-[#ef4444] rounded-full mb-4">
            NSFW Content
          </span>
          <p className="text-sm text-[#94a3b8] mb-6">
            This source contains adult content
          </p>
          <Button
            variant="outline"
            onClick={() => setShowNsfw(true)}
            className="border-[#ef4444]/50 text-[#ef4444] hover:bg-[#ef4444]/10"
          >
            <Eye className="w-4 h-4 mr-2" />
            Show Content
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`group relative ${isNsfw ? 'nsfw-card' : ''}`}>
        {/* Glow Effect */}
        <div className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity ${
          isNsfw ? 'bg-gradient-to-r from-[#ef4444] to-[#f59e0b]' : 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]'
        }`} />

        <div className={`relative glass rounded-2xl overflow-hidden transition-all hover:bg-[#161616] ${
          isNsfw ? 'border border-[#ef4444]/20' : ''
        }`}>
          {/* Header */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#f8fafc] truncate">
                  {extension.name.replace('Tachiyomi: ', '')}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-[#64748b]">v{extension.version}</span>
                  {isNsfw && (
                    <span className="px-2 py-0.5 text-[10px] bg-[#ef4444]/20 text-[#ef4444] rounded">
                      NSFW
                    </span>
                  )}
                </div>
              </div>

              {isNsfw && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNsfw(false)}
                  className="w-8 h-8 text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10"
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Languages */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {allLanguages.slice(0, 3).map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#1f1f1f] text-[#94a3b8] rounded-full"
                >
                  <span>{LANGUAGE_FLAGS[lang] || '🏳️'}</span>
                  <span className="hidden sm:inline">{LANGUAGE_NAMES[lang] || lang}</span>
                </span>
              ))}
              {allLanguages.length > 3 && (
                <span className="px-2 py-0.5 text-xs text-[#64748b]">
                  +{allLanguages.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Sources List */}
          <div className="border-t border-[#1f1f1f]">
            {extension.sources.slice(0, expanded ? undefined : 2).map((source, idx) => {
              const status = getStatus(source.baseUrl);
              const isChecking = checking[source.baseUrl];

              return (
                <div
                  key={idx}
                  className="p-3 border-b border-[#1f1f1f] last:border-b-0 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-medium text-sm text-[#f8fafc] truncate">
                      {source.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-[#1f1f1f] text-[#64748b] rounded">
                      {LANGUAGE_FLAGS[source.lang]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#6366f1] flex-shrink-0" />
                    <a
                      href={source.baseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#94a3b8] hover:text-[#6366f1] transition-colors truncate flex-1"
                    >
                      {source.baseUrl}
                    </a>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between mt-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleCheckStatus(source.baseUrl)}
                          disabled={isChecking}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(status?.status)} ${status?.status === 'online' ? 'animate-pulse' : ''}`} />
                          <span className={status?.status === 'online' ? 'text-[#22c55e]' : status?.status === 'offline' ? 'text-[#ef4444]' : 'text-[#64748b]'}>
                            {isChecking ? 'Checking...' : getStatusText(status?.status)}
                          </span>
                          {status?.responseTime && (
                            <span className="text-[#64748b]">({status.responseTime}ms)</span>
                          )}
                          <RefreshCw className={`w-3 h-3 ml-1 text-[#64748b] ${isChecking ? 'animate-spin' : ''}`} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to check status</p>
                      </TooltipContent>
                    </Tooltip>

                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
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
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy link</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
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
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open site</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expand/Collapse */}
          {extension.sources.length > 2 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-2 text-xs text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-1"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  +{extension.sources.length - 2} more sources
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
