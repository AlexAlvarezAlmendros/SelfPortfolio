// Client-side interactions ported from the original dc-runtime logic.
// Runs on every page (Astro does full reloads between routes by default).

document.documentElement.classList.add('js');

/* ----------------------------- fit-to-width text ----------------------------- */
function fitText() {
  const els = Array.from(
    document.querySelectorAll<HTMLElement>('[data-fit]'),
  ).filter((e) => e.offsetParent !== null);
  const groups: Record<string, HTMLElement[]> = {};
  let ready = true;
  els.forEach((el) => {
    el.style.fontSize = '100px';
    el.style.width = '';
    const avail = el.clientWidth;
    if (avail < 60) {
      ready = false;
      return;
    }
    el.style.width = 'max-content';
    const cw = el.scrollWidth;
    el.style.width = '';
    const max = parseFloat(el.getAttribute('data-max') || '') || 300;
    const fit = cw > 0 ? Math.min(max, (avail / cw) * 100 * 0.99) : max;
    (el as HTMLElement & { _fit?: number })._fit = fit;
    const g = el.getAttribute('data-fit-group') || `s${Math.random()}`;
    (groups[g] = groups[g] || []).push(el);
  });
  Object.keys(groups).forEach((g) => {
    const arr = groups[g];
    const s = Math.min(...arr.map((e) => (e as HTMLElement & { _fit?: number })._fit ?? 300));
    arr.forEach((e) => {
      e.style.fontSize = `${s.toFixed(1)}px`;
    });
  });
  if (!ready) setTimeout(fitText, 120);
}

function fitAndReveal() {
  fitText();
  // Reveal the headings once they are sized (see global.css .fonts-fitted rule).
  document.documentElement.classList.add('fonts-fitted');
}

function scheduleFit() {
  fitText();
  requestAnimationFrame(fitText);
  if (document.fonts && document.fonts.ready) {
    // Fit with the real font metrics, then reveal — no double jump.
    document.fonts.ready.then(fitAndReveal);
    // Fallback in case the font load hangs: reveal anyway shortly after.
    setTimeout(fitAndReveal, 400);
  } else {
    fitAndReveal();
  }
  setTimeout(fitText, 220);
}

/* ------------------------------ scroll reveal ------------------------------ */
function setupReveal() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.1 },
  );
  els.forEach((el) => io.observe(el));
}

/* --------------------------------- clock --------------------------------- */
function startClock() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-clock]'));
  if (!els.length) return;
  const tick = () => {
    let txt: string;
    try {
      txt = new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Europe/Madrid',
        hour12: false,
      });
    } catch {
      txt = new Date().toLocaleTimeString('en-GB', { hour12: false });
    }
    els.forEach((el) => {
      el.textContent = txt;
    });
  };
  tick();
  setInterval(tick, 1000);
}

/* ------------------------------ mobile menu ------------------------------ */
function setupMenu() {
  const btn = document.querySelector<HTMLElement>('[data-menu-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-mobile-nav]');
  if (!btn || !panel) return;
  const root = document.documentElement;

  const setOpen = (open: boolean) => {
    root.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    // Lock background scroll while the menu is open.
    document.body.style.overflow = open ? 'hidden' : '';
  };

  btn.addEventListener('click', () => setOpen(!root.classList.contains('menu-open')));
  // Close when navigating or pressing Escape.
  panel.querySelectorAll('a[href]').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) setOpen(false);
  });
  // Close if the viewport grows back to desktop.
  window.addEventListener('resize', () => {
    if (window.innerWidth > 680 && root.classList.contains('menu-open')) setOpen(false);
  });
}

/* ------------------------------- scramble -------------------------------- */
const CHARS = 'ABCDEFGHIJKLMNPQRSTUVWXYZ#$%&_/<>0123456789@.';
function scramble(el: HTMLElement) {
  const final = el.getAttribute('data-text') || '';
  if (!final || el.dataset.animating) return;
  el.dataset.animating = '1';
  const sup = el.querySelector('sup');
  const supHTML = sup ? sup.outerHTML : '';
  let frame = 0;
  const total = 9;
  const step = () => {
    let out = '';
    const reveal = Math.floor((frame / total) * final.length);
    for (let i = 0; i < final.length; i++) {
      const c = final[i];
      if (c === ' ' || c === '@' || c === '.') out += c;
      else if (i < reveal) out += c;
      else out += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    const first = el.childNodes[0];
    if (first && first.nodeType === 3) first.textContent = out;
    else el.innerHTML = out + supHTML;
    frame++;
    if (frame <= total) setTimeout(step, 28);
    else {
      if (supHTML) el.innerHTML = final + supHTML;
      else el.textContent = final;
      delete el.dataset.animating;
    }
  };
  step();
}

/* --------------------------- floating preview ---------------------------- */
function setupPreview() {
  const p = document.getElementById('cursor-preview');
  const label = document.getElementById('cursor-preview-label');
  if (!p) return;
  let curKey = '';
  document.addEventListener('mousemove', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-preview]');
    if (el) {
      const img = el.getAttribute('data-img') || '';
      const pat = el.getAttribute('data-pattern') || '';
      const lbl = el.getAttribute('data-label') || 'preview';
      const key = img || pat;
      if (curKey !== key) {
        if (img) {
          // Real screenshot of the article header (also used as the social/share image).
          p.style.backgroundImage = `url("${img}")`;
          p.style.backgroundSize = 'cover';
          p.style.backgroundPosition = 'top center';
        } else {
          p.style.backgroundImage = '';
          p.style.background = pat;
        }
        curKey = key;
      }
      if (label) label.textContent = `// ${lbl}`;
      p.style.opacity = '1';
      p.style.left = `${e.clientX + 28}px`;
      p.style.top = `${e.clientY - 10}px`;
    } else {
      p.style.opacity = '0';
    }
  });
}

/* --------------------------------- init ---------------------------------- */
function init() {
  scheduleFit();
  setupReveal();
  startClock();
  setupMenu();
  setupPreview();
  document.addEventListener('mouseover', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-scramble]');
    if (t) scramble(t);
  });
  // Only re-fit when the viewport WIDTH changes. On mobile, scrolling shows/hides
  // the URL bar, which fires `resize` with a new height but the same width; refitting
  // there resizes the headings mid-scroll and makes the page jump.
  let lastFitWidth = window.innerWidth;
  const refitOnWidthChange = () => {
    if (window.innerWidth === lastFitWidth) return;
    lastFitWidth = window.innerWidth;
    fitText();
  };
  window.addEventListener('resize', refitOnWidthChange);
  if (window.ResizeObserver) new ResizeObserver(refitOnWidthChange).observe(document.documentElement);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
