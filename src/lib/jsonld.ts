import type { Lang } from '../i18n/ui';

const PERSON_ID = 'https://alexalvarez.dev/#person';

export function personNode() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Alex Alvarez Almendros',
    url: 'https://alexalvarez.dev/',
    image: 'https://alexalvarez.dev/og-image.png',
    jobTitle: 'Fullstack Developer',
    email: 'alexalmendrosal@gmail.com',
    description:
      'Desarrollador Fullstack con más de 5 años construyendo soluciones web y móviles con React, Blazor, NodeJS y .NET 8.',
    address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' },
    worksFor: { '@type': 'Organization', name: 'Capitole Consulting' },
    knowsAbout: ['C#', '.NET', 'React', 'Blazor', 'Node.js', 'TypeScript', 'SQL', 'Auth0', 'IoT', 'LLMOps'],
    knowsLanguage: ['es', 'en'],
    sameAs: [
      'https://github.com/AlexAlvarezAlmendros',
      'https://www.linkedin.com/in/alexalvarezalmendros/',
    ],
  };
}

export function homeJsonLd(lang: Lang, url: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      personNode(),
      {
        '@type': 'WebSite',
        '@id': 'https://alexalvarez.dev/#website',
        url,
        name: 'Alex Alvarez Almendros — Fullstack Developer',
        inLanguage: lang,
        author: { '@id': PERSON_ID },
      },
    ],
  };
}

export function articleJsonLd(opts: {
  lang: Lang;
  url: string;
  title: string;
  description: string;
  date: Date;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.title,
    description: opts.description,
    inLanguage: opts.lang,
    datePublished: opts.date.toISOString(),
    mainEntityOfPage: opts.url,
    image: 'https://alexalvarez.dev/og-image.png',
    author: personNode(),
  };
}
