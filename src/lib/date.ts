import type { Lang } from '../i18n/ui';

const MONTHS: Record<Lang, string[]> = {
  es: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
};

/** es → "12 JUN 2026", en → "JUN 12 2026". */
export function formatDate(date: Date, lang: Lang): string {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mon = MONTHS[lang][date.getUTCMonth()];
  const yyyy = date.getUTCFullYear();
  return lang === 'es' ? `${dd} ${mon} ${yyyy}` : `${mon} ${dd} ${yyyy}`;
}
