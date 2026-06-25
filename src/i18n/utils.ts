import { ui, defaultLang, type Lang, type UIKey } from './ui';

/** Extract the active language from a URL pathname (`/en/...` → 'en', else default). */
export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  if (seg === 'en') return 'en';
  return defaultLang;
}

/** Returns a `t(key)` function bound to a language, falling back to the default language. */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/**
 * Localize an internal path. Spanish is served at the root, English under `/en`.
 * `localizePath('/blog', 'en')` → `/en/blog`; `localizePath('/', 'en')` → `/en`.
 */
export function localizePath(path: string, lang: Lang): string {
  const clean = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  if (lang === 'es') return clean;
  return clean === '/' ? '/en' : `/en${clean}`;
}

/** The opposite language, for the language switcher. */
export function altLang(lang: Lang): Lang {
  return lang === 'es' ? 'en' : 'es';
}
