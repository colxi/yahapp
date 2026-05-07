import { useEffect } from 'react';
import { useThemeStore } from '../providers/theme-store';

export function ThemeInit() {
  const resolved = useThemeStore((s) => s.resolved);
  const setSystemPrefers = useThemeStore((s) => s._setSystemPrefers);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = (e: MediaQueryListEvent) => setSystemPrefers(e.matches ? 'light' : 'dark');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [setSystemPrefers]);

  return null;
}
