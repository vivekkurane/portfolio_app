import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Adds `.in` to every `.rv` element as it scrolls into view. */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.rv');
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}

/** Typewriter that cycles through words. Reduced motion shows the first word statically. */
export function useTyped(words: string[]) {
  const [text, setText] = useState(prefersReducedMotion() ? words[0] : '');
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let wi = 0, ci = 0, del = false, timer: number;
    const tick = () => {
      const w = words[wi];
      setText(w.slice(0, ci));
      let delay = del ? 35 : 70;
      if (!del && ci === w.length) { del = true; delay = 1600; }
      else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
      else ci += del ? -1 : 1;
      timer = window.setTimeout(tick, delay);
    };
    tick();
    return () => clearTimeout(timer);
  }, [words]);
  return text;
}

/** Counts up to `n` once the element is visible. */
export function useCountUp(n: number) {
  const ref = useRef<HTMLElement>(null);
  const [val, setVal] = useState(prefersReducedMotion() ? n : 0);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) { setVal(n); return; }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now(), dur = 1200;
      const step = (t: number) => {
        const p = Math.min((t - start) / dur, 1);
        setVal(Math.round(n * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [n]);
  return [ref, val] as const;
}

type Theme = 'light' | 'dark';
const systemTheme = (): Theme => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

/** Light/dark theme with localStorage persistence (falls back to the system setting). */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try { const s = localStorage.getItem('theme'); if (s === 'light' || s === 'dark') return s; } catch { /* storage blocked */ }
    return systemTheme();
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))] as const;
}

/** Returns the id of the section currently in view (for nav highlighting). */
export function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState('');
  useEffect(() => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);
  return active;
}
