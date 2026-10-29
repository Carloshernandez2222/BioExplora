import { useEffect, useState } from 'react';
import { load, save } from './storage';

export type Palette = 'selva' | 'caribe' | 'paramo';
export type Theme = 'light' | 'dark';

export const PALETTES: { id: Palette; nombre: string; colores: string[] }[] = [
  { id: 'selva', nombre: 'Selva Esmeralda', colores: ['#1B5E3F', '#2ECC71', '#1ABC9C', '#F5A623'] },
  { id: 'caribe', nombre: 'Atardecer Caribe', colores: ['#B5441B', '#FF7F50', '#F4A259', '#F2C14E'] },
  { id: 'paramo', nombre: 'Páramo Andino', colores: ['#3D5468', '#9B8EC4', '#7D9A5B', '#C9A227'] },
];

export function useTheme() {
  const [palette, setPalette] = useState<Palette>(
    () => (document.documentElement.getAttribute('data-palette') as Palette) || load<Palette>('palette', 'selva'),
  );
  const [theme, setTheme] = useState<Theme>(
    () => (document.documentElement.getAttribute('data-theme') as Theme) || 'light',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette);
    save('palette', palette);
  }, [palette]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    save('theme', theme);
  }, [theme]);

  return { palette, setPalette, theme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) };
}
