'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { useEffect } from 'react';

import { useConfigStore } from '@/lib/store/use-config';

export const ThemeSwitcher = () => {
  const storedTheme = useConfigStore((state) => state.theme);
  const segment = useSelectedLayoutSegment();

  useEffect(() => {
    document.body.classList.forEach((className) => {
      if (className.match(/^theme.*/)) {
        document.body.classList.remove(className);
      }
    });

    const theme = segment === 'themes' ? storedTheme : null;
    if (theme) {
      return document.body.classList.add(`theme-${theme}`);
    }
  }, [segment, storedTheme]);

  return null;
};
