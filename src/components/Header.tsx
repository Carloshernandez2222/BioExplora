import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Leaf, Menu, Moon, Palette as PaletteIcon, Sun, X } from 'lucide-react';
import { useActiveSection } from '../lib/hooks';
import { PALETTES, useTheme } from '../lib/theme';
import { scrollToId } from '../lib/utils';
import { btnIcon } from './ui';

export const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'especies', label: 'Especies' },
  { id: 'curiosidades', label: 'Curiosidades' },
  { id: 'trivia', label: 'Trivia' },
  { id: 'galeria', label: 'Galería' },
  { id: 'mapa', label: 'Mapa' },
  { id: 'afiches', label: 'Afiches' },
  { id: 'evaluaciones', label: 'Evaluaciones' },
  { id: 'encuesta', label: 'Encuesta' },
];
const NAV_IDS = NAV_LINKS.map((l) => l.id);
// En pantallas medianas solo caben los primeros enlaces; el resto va en "Más".
const PRIMARY_COUNT = 5;

function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, ref]);
}

export default function Header() {
  const active = useActiveSection(NAV_IDS);
  const { palette, setPalette, theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLLIElement>(null);

  useDismiss(paletteOpen, () => setPaletteOpen(false), paletteRef);
  useDismiss(moreOpen, () => setMoreOpen(false), moreRef);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    setMoreOpen(false);
    scrollToId(id);
    history.replaceState(null, '', `#${id}`);
  };

  const solid = scrolled || menuOpen;
  const linkCls = (isActive: boolean) =>
    `block rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
      isActive
        ? 'bg-primary text-on-primary'
        : solid
          ? 'text-text hover:bg-surface-2'
          : 'text-white/90 hover:bg-white/15 hover:text-white'
    }`;
  const secondary = NAV_LINKS.slice(PRIMARY_COUNT);
  const moreActive = secondary.some((l) => l.id === active);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          solid ? 'border-b border-line bg-surface/95 shadow-sm backdrop-blur' : 'bg-transparent'
        }`}
      >
        <nav aria-label="Principal" className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <a href="#inicio" onClick={go('inicio')} className="flex min-w-0 shrink items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-accent">
              <Leaf className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 leading-tight">
              <span
                className={`block font-display text-base font-extrabold sm:text-lg ${solid ? 'text-text' : 'text-white'}`}
              >
                BioExplora <span className={solid ? 'text-ink' : 'text-accent'}>Colombia</span>
              </span>
              <span className={`block truncate text-[11px] ${solid ? 'text-muted' : 'text-white/80'}`}>
                Especies endémicas de nuestra tierra
              </span>
            </span>
          </a>

          {/* Pantallas medianas: enlaces principales + "Más" */}
          <ul className="ml-auto hidden items-center gap-0.5 lg:flex xl:hidden">
            {NAV_LINKS.slice(0, PRIMARY_COUNT).map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={go(l.id)}
                  aria-current={active === l.id ? 'true' : undefined}
                  className={linkCls(active === l.id)}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="relative" ref={moreRef}>
              <button
                type="button"
                aria-expanded={moreOpen}
                aria-haspopup="true"
                onClick={() => setMoreOpen((v) => !v)}
                className={`${linkCls(moreActive)} inline-flex items-center gap-1`}
              >
                Más <ChevronDown className="h-4 w-4" aria-hidden />
              </button>
              {moreOpen && (
                <ul className="animate-fade-up absolute right-0 mt-2 w-48 rounded-2xl border border-line bg-surface p-2 shadow-xl">
                  {secondary.map((l) => (
                    <li key={l.id}>
                      <a
                        href={`#${l.id}`}
                        onClick={go(l.id)}
                        aria-current={active === l.id ? 'true' : undefined}
                        className={`block rounded-xl px-3 py-2.5 text-sm font-medium ${
                          active === l.id ? 'bg-primary text-on-primary' : 'text-text hover:bg-surface-2'
                        }`}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>

          {/* Pantallas grandes: todos los enlaces */}
          <ul className="ml-auto hidden items-center gap-0.5 xl:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={go(l.id)}
                  aria-current={active === l.id ? 'true' : undefined}
                  className={linkCls(active === l.id)}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2 lg:ml-2">
            <div className="relative hidden sm:block" ref={paletteRef}>
              <button
                type="button"
                className={btnIcon}
                aria-label="Cambiar paleta de colores"
                aria-expanded={paletteOpen}
                aria-haspopup="true"
                onClick={() => setPaletteOpen((v) => !v)}
              >
                <PaletteIcon className="h-5 w-5" aria-hidden />
              </button>
              {paletteOpen && (
                <div
                  role="menu"
                  className="animate-fade-up absolute right-0 mt-2 w-60 rounded-2xl border border-line bg-surface p-2 shadow-xl"
                >
                  <p className="px-3 py-2 text-xs font-semibold text-muted uppercase">Paleta de colores</p>
                  {PALETTES.map((p) => (
                    <button
                      key={p.id}
                      role="menuitemradio"
                      aria-checked={palette === p.id}
                      type="button"
                      onClick={() => {
                        setPalette(p.id);
                        setPaletteOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-text hover:bg-surface-2"
                    >
                      <span className="flex -space-x-1">
                        {p.colores.map((c) => (
                          <span
                            key={c}
                            className="h-4 w-4 rounded-full border-2 border-surface"
                            style={{ background: c }}
                          />
                        ))}
                      </span>
                      <span className="flex-1 font-medium">{p.nombre}</span>
                      {palette === p.id && <Check className="h-4 w-4 text-ink" aria-hidden />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className={btnIcon.replace('inline-flex', 'hidden sm:inline-flex')}
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
            </button>
            <button
              type="button"
              className={btnIcon.replace('inline-flex', 'inline-flex lg:hidden')}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </nav>
      </header>

      {/* fuera del <header>: su backdrop-filter recortaría un hijo con position: fixed */}
      {menuOpen && (
        <div
          id="menu-movil"
          className="animate-fade-up fixed inset-x-0 top-16 bottom-0 z-[65] overflow-y-auto bg-surface lg:hidden"
        >
          <ul className="flex flex-col gap-1 px-4 py-6">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={go(l.id)}
                  aria-current={active === l.id ? 'true' : undefined}
                  className={`block rounded-2xl px-5 py-3.5 font-display text-xl font-bold ${
                    active === l.id ? 'bg-primary text-on-primary' : 'text-text hover:bg-surface-2'
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          {/* En pantallas pequeñas, la paleta y el modo viven aquí (en el encabezado se ocultan) */}
          <div className="mx-4 mb-8 space-y-4 rounded-2xl bg-surface-2 p-5 sm:hidden">
            <p className="text-sm font-semibold text-muted uppercase">Apariencia</p>
            <div role="radiogroup" aria-label="Paleta de colores" className="grid gap-2">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={palette === p.id}
                  onClick={() => setPalette(p.id)}
                  className={`flex min-h-12 items-center gap-3 rounded-xl border-2 px-4 text-left text-text ${
                    palette === p.id ? 'border-primary bg-surface' : 'border-transparent'
                  }`}
                >
                  <span className="flex -space-x-1">
                    {p.colores.map((c) => (
                      <span
                        key={c}
                        className="h-4 w-4 rounded-full border-2 border-surface"
                        style={{ background: c }}
                      />
                    ))}
                  </span>
                  <span className="flex-1 font-medium">{p.nombre}</span>
                  {palette === p.id && <Check className="h-4 w-4 text-ink" aria-hidden />}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl border-2 border-line bg-surface px-4 font-medium text-text"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
              {theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
