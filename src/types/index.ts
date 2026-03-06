export interface ExtensionSource {
  name: string;
  lang: string;
  id: string;
  baseUrl: string;
}

export interface Extension {
  name: string;
  pkg: string;
  apk: string;
  lang: string;
  code: number;
  version: string;
  nsfw: number;
  sources: ExtensionSource[];
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  sharedExtensions: string[];
  joinedAt: string;
}

export interface SharedExtension {
  id: string;
  extensionName: string;
  sharedBy: string;
  sharedAt: string;
  message?: string;
}

export interface SiteStatus {
  url: string;
  status: 'online' | 'offline' | 'checking';
  lastChecked: string;
  responseTime?: number;
}

export interface UserSubmittedSite {
  id: string;
  name: string;
  url: string;
  language: string;
  submittedBy: string;
  submittedAt: string;
  status: SiteStatus;
}

export type LanguageCode = 
  | 'af' | 'all' | 'ar' | 'az' | 'be' | 'bg' | 'bn' | 'br' | 'ca' | 'ceb' | 'co' | 'cs' | 'cv'
  | 'da' | 'de' | 'el' | 'en' | 'eo' | 'es' | 'es-419' | 'et' | 'eu' | 'fa' | 'fi' | 'fil' | 'fr'
  | 'ga' | 'he' | 'hi' | 'hr' | 'hu' | 'id' | 'is' | 'it' | 'ja' | 'jv' | 'ka' | 'kk' | 'kn' | 'ko'
  | 'kr' | 'la' | 'lmo' | 'lt' | 'lv' | 'ml' | 'mn' | 'mo' | 'ms' | 'my' | 'ne' | 'nl' | 'no'
  | 'none' | 'other' | 'pa' | 'pl' | 'pt' | 'pt-BR' | 'ro' | 'ru' | 'sk' | 'sl' | 'sq' | 'sr'
  | 'sv' | 'ta' | 'te' | 'th' | 'tl' | 'tr' | 'uk' | 'ur' | 'uz' | 'vec' | 'vi' | 'zh' | 'zh-Hans'
  | 'zh-Hant' | 'zh-tw';

export const LANGUAGE_NAMES: Record<string, string> = {
  'af': 'Afrikaans',
  'all': 'All Languages',
  'ar': 'Arabic',
  'az': 'Azerbaijani',
  'be': 'Belarusian',
  'bg': 'Bulgarian',
  'bn': 'Bengali',
  'br': 'Breton',
  'ca': 'Catalan',
  'ceb': 'Cebuano',
  'co': 'Corsican',
  'cs': 'Czech',
  'cv': 'Chuvash',
  'da': 'Danish',
  'de': 'German',
  'el': 'Greek',
  'en': 'English',
  'eo': 'Esperanto',
  'es': 'Spanish',
  'es-419': 'Spanish (Latin America)',
  'et': 'Estonian',
  'eu': 'Basque',
  'fa': 'Persian',
  'fi': 'Finnish',
  'fil': 'Filipino',
  'fr': 'French',
  'ga': 'Irish',
  'he': 'Hebrew',
  'hi': 'Hindi',
  'hr': 'Croatian',
  'hu': 'Hungarian',
  'id': 'Indonesian',
  'is': 'Icelandic',
  'it': 'Italian',
  'ja': 'Japanese',
  'jv': 'Javanese',
  'ka': 'Georgian',
  'kk': 'Kazakh',
  'kn': 'Kannada',
  'ko': 'Korean',
  'kr': 'Kanuri',
  'la': 'Latin',
  'lmo': 'Lombard',
  'lt': 'Lithuanian',
  'lv': 'Latvian',
  'ml': 'Malayalam',
  'mn': 'Mongolian',
  'mo': 'Moldavian',
  'ms': 'Malay',
  'my': 'Burmese',
  'ne': 'Nepali',
  'nl': 'Dutch',
  'no': 'Norwegian',
  'none': 'None',
  'other': 'Other',
  'pa': 'Punjabi',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'pt-BR': 'Portuguese (Brazil)',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'sq': 'Albanian',
  'sr': 'Serbian',
  'sv': 'Swedish',
  'ta': 'Tamil',
  'te': 'Telugu',
  'th': 'Thai',
  'tl': 'Tagalog',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'ur': 'Urdu',
  'uz': 'Uzbek',
  'vec': 'Venetian',
  'vi': 'Vietnamese',
  'zh': 'Chinese',
  'zh-Hans': 'Chinese (Simplified)',
  'zh-Hant': 'Chinese (Traditional)',
  'zh-tw': 'Chinese (Taiwan)',
};

export const LANGUAGE_FLAGS: Record<string, string> = {
  'af': '🇿🇦', 'all': '🌐', 'ar': '🇸🇦', 'az': '🇦🇿', 'be': '🇧🇾', 'bg': '🇧🇬', 'bn': '🇧🇩', 'br': '🇫🇷',
  'ca': '🇪🇸', 'ceb': '🇵🇭', 'co': '🇫🇷', 'cs': '🇨🇿', 'cv': '🇷🇺', 'da': '🇩🇰', 'de': '🇩🇪', 'el': '🇬🇷',
  'en': '🇺🇸', 'eo': '🌍', 'es': '🇪🇸', 'es-419': '🌎', 'et': '🇪🇪', 'eu': '🇪🇸', 'fa': '🇮🇷', 'fi': '🇫🇮',
  'fil': '🇵🇭', 'fr': '🇫🇷', 'ga': '🇮🇪', 'he': '🇮🇱', 'hi': '🇮🇳', 'hr': '🇭🇷', 'hu': '🇭🇺', 'id': '🇮🇩',
  'is': '🇮🇸', 'it': '🇮🇹', 'ja': '🇯🇵', 'jv': '🇮🇩', 'ka': '🇬🇪', 'kk': '🇰🇿', 'kn': '🇮🇳', 'ko': '🇰🇷',
  'kr': '🇳🇬', 'la': '🏛️', 'lmo': '🇮🇹', 'lt': '🇱🇹', 'lv': '🇱🇻', 'ml': '🇮🇳', 'mn': '🇲🇳', 'mo': '🇲🇩',
  'ms': '🇲🇾', 'my': '🇲🇲', 'ne': '🇳🇵', 'nl': '🇳🇱', 'no': '🇳🇴', 'none': '❓', 'other': '📋', 'pa': '🇮🇳',
  'pl': '🇵🇱', 'pt': '🇵🇹', 'pt-BR': '🇧🇷', 'ro': '🇷🇴', 'ru': '🇷🇺', 'sk': '🇸🇰', 'sl': '🇸🇮', 'sq': '🇦🇱',
  'sr': '🇷🇸', 'sv': '🇸🇪', 'ta': '🇮🇳', 'te': '🇮🇳', 'th': '🇹🇭', 'tl': '🇵🇭', 'tr': '🇹🇷', 'uk': '🇺🇦',
  'ur': '🇵🇰', 'uz': '🇺🇿', 'vec': '🇮🇹', 'vi': '🇻🇳', 'zh': '🇨🇳', 'zh-Hans': '🇨🇳', 'zh-Hant': '🇹🇼', 'zh-tw': '🇹🇼',
};
