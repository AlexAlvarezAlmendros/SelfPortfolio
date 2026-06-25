export const defaultLang = 'es';

export const languages = { es: 'ES', en: 'EN' } as const;
export type Lang = keyof typeof languages;

// UI strings shared across pages.
export const ui = {
  es: {
    'available': 'DISPONIBLE',
    'stat.role': 'ROL',
    'stat.roleValue': 'FULLSTACK DEV',
    'stat.base': 'BASE',
    'stat.exp': 'EXP',
    'hero.lead':
      'Desarrollador Fullstack obsesionado con la web, las arquitecturas limpias y la IA aplicada. Construyo producto que escala y que la gente disfruta usar.',
    'cta.primary': 'CONTACTAR',
    's1.title': 'PERFIL',
    'bio1':
      'Más de cinco años construyendo soluciones web y móviles con React, Blazor, NodeJS y .NET 8.',
    'bio2':
      'He colaborado con Experian, Bella Aurora Labs y Capitole, enviando aplicaciones escalables e intuitivas bajo metodología Scrum.',
    'bio3':
      'Ubicado en Barcelona y disponible en remoto, siempre abierto a retos que empujen mis límites técnicos y de producto.',
    's2.title': 'EXPERIENCIA',
    's3.title': 'STACK',
    's4.title': 'PROYECTOS',
    'contact.kicker': 'CONTACTO',
    'contact.title': 'CONSTRUYAMOS ALGO',
    'blog.kicker': '// DEVLOGS',
    'blog.title': 'Blog & Devlogs',
    'blog.lead':
      'Notas técnicas, decisiones de arquitectura y lo que aprendo mientras construyo.',
    'back.blog': 'Volver al blog',
    'back.home': 'Volver al inicio',
    'thanks': '// gracias por leer',
    'more.devlogs': 'Más devlogs',
    'visit.site': 'VISITAR',
    'view.repo': 'VER REPO',
    'screenshot': 'captura',
    'role': 'ROL',
    'stack': 'STACK',
    'overview': 'Resumen',
    'key.features': 'Características',
    'next.project': 'Siguiente',
    'footer': 'Diseñado & desarrollado por Alex Alvarez · © 2026',
    'nav.index': 'INDEX',
    'nav.work': 'WORK',
    'nav.log': 'LOG',
    'nav.info': 'INFO',
    'meta.home.title': 'Alex Alvarez Almendros · Programador Fullstack .NET, React e IA',
    'meta.home.desc':
      'Programador Fullstack con +5 años en .NET, React, JavaScript y Astro. Desarrollo web, automatización de procesos e implementación de IA. Disponible en remoto.',
    'meta.blog.title': 'Blog & Devlogs | Alex Alvarez Almendros',
    'meta.blog.desc':
      'Notas técnicas, decisiones de arquitectura y aprendizajes sobre React, .NET, bases de datos y LLMOps.',
  },
  en: {
    'available': 'OPEN TO WORK',
    'stat.role': 'ROLE',
    'stat.roleValue': 'FULLSTACK DEV',
    'stat.base': 'BASE',
    'stat.exp': 'EXP',
    'hero.lead':
      'Fullstack developer obsessed with the web, clean architectures and applied AI. I build product that scales and that people enjoy using.',
    'cta.primary': 'GET IN TOUCH',
    's1.title': 'PROFILE',
    'bio1':
      '5+ years building web and mobile solutions with React, Blazor, NodeJS and .NET 8.',
    'bio2':
      'I’ve worked with Experian, Bella Aurora Labs and Capitole, shipping scalable, intuitive apps under Scrum.',
    'bio3':
      'Based in Barcelona and available remote, always open to challenges that push my technical and product limits.',
    's2.title': 'EXPERIENCE',
    's3.title': 'STACK',
    's4.title': 'WORK',
    'contact.kicker': 'CONTACT',
    'contact.title': 'LET’S BUILD',
    'blog.kicker': '// DEVLOGS',
    'blog.title': 'Blog & Devlogs',
    'blog.lead':
      'Technical notes, architecture decisions and what I learn while building.',
    'back.blog': 'Back to blog',
    'back.home': 'Back home',
    'thanks': '// thanks for reading',
    'more.devlogs': 'More devlogs',
    'visit.site': 'VISIT SITE',
    'view.repo': 'VIEW REPO',
    'screenshot': 'screenshot',
    'role': 'ROLE',
    'stack': 'STACK',
    'overview': 'Overview',
    'key.features': 'Key features',
    'next.project': 'Next',
    'footer': 'Designed & built by Alex Alvarez · © 2026',
    'nav.index': 'INDEX',
    'nav.work': 'WORK',
    'nav.log': 'LOG',
    'nav.info': 'INFO',
    'meta.home.title': 'Alex Alvarez Almendros · Fullstack Developer .NET, React & AI',
    'meta.home.desc':
      'Fullstack developer, 5+ years in .NET, React, JavaScript and Astro. Web development, process automation and AI implementation. Available remote.',
    'meta.blog.title': 'Blog & Devlogs | Alex Alvarez Almendros',
    'meta.blog.desc':
      'Technical notes, architecture decisions and learnings about React, .NET, databases and LLMOps.',
  },
} as const;

export type UIKey = keyof (typeof ui)['es'];

// Soft skills (translated).
export const soft: Record<Lang, string[]> = {
  es: [
    'Aprendizaje Continuo',
    'Resolución de Problemas',
    'Trabajo en Equipo',
    'Comunicación Efectiva',
    'Proactividad',
  ],
  en: [
    'Continuous Learning',
    'Problem Solving',
    'Teamwork',
    'Effective Communication',
    'Proactivity',
  ],
};

// Technical stack (language-independent names + short category tag).
export const skills: { name: string; cat: string }[] = [
  { name: 'C#', cat: 'core' },
  { name: '.NET', cat: 'backend' },
  { name: 'React', cat: 'frontend' },
  { name: 'Astro', cat: 'frontend' },
  { name: 'Blazor', cat: 'frontend' },
  { name: 'NodeJS', cat: 'backend' },
  { name: 'JavaScript', cat: 'lang' },
  { name: 'SQL/NoSQL', cat: 'data' },
  { name: 'REST', cat: 'api' },
  { name: 'IoT/N8N', cat: 'auto' },
  { name: 'UX/UI', cat: 'design' },
];

export type Job = { period: string; role: string; company: string; tags: string[] };

// Work experience (some fields translated).
export const experience: Record<Lang, Job[]> = {
  es: [
    { period: 'SEP 2024 — HOY', role: 'Fullstack Developer', company: 'Capitole Consulting', tags: ['.NET', 'React', 'Blazor', 'NodeJS'] },
    { period: 'MAY 2024 — SEP 2024', role: 'Fullstack Web Developer', company: 'Bella Aurora Labs S.A.', tags: ['.NET 8', 'Blazor', 'LLMOps'] },
    { period: 'JUN 2023 — MAY 2024', role: 'Fullstack Developer', company: 'DAITEC Engineering', tags: ['.NET', 'SQL', 'IoT'] },
    { period: 'OCT 2022 — ABR 2023', role: 'Profesor de Programación', company: 'Adecco', tags: ['Unity 3D', 'C#', 'VR/AR'] },
    { period: 'DIC 2020 — SEP 2022', role: '.NET / Web Developer', company: 'SECPHO', tags: ['React', 'Express', 'NodeJS'] },
    { period: 'ENE 2018 — ABR 2018', role: 'Frontend Dev (Prácticas)', company: 'iTailored App&Web', tags: ['HTML', 'CSS', 'JS'] },
  ],
  en: [
    { period: 'SEP 2024 — NOW', role: 'Fullstack Developer', company: 'Capitole Consulting', tags: ['.NET', 'React', 'Blazor', 'NodeJS'] },
    { period: 'MAY 2024 — SEP 2024', role: 'Fullstack Web Developer', company: 'Bella Aurora Labs S.A.', tags: ['.NET 8', 'Blazor', 'LLMOps'] },
    { period: 'JUN 2023 — MAY 2024', role: 'Fullstack Developer', company: 'DAITEC Engineering', tags: ['.NET', 'SQL', 'IoT'] },
    { period: 'OCT 2022 — APR 2023', role: 'Programming Teacher', company: 'Adecco', tags: ['Unity 3D', 'C#', 'VR/AR'] },
    { period: 'DEC 2020 — SEP 2022', role: '.NET / Web Developer', company: 'SECPHO', tags: ['React', 'Express', 'NodeJS'] },
    { period: 'JAN 2018 — APR 2018', role: 'Frontend Dev (Intern)', company: 'iTailored App&Web', tags: ['HTML', 'CSS', 'JS'] },
  ],
};
