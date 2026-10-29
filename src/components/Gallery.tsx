import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import data from '../data/gallery.json';
import type { GalleryItem } from '../data/types';
import { useDialog } from '../lib/hooks';
import { Chip, Section, SectionHeader } from './ui';

const GALLERY = data as GalleryItem[];
type GalleryCategory = GalleryItem['category'];

const FILTROS: { id: GalleryCategory | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Ver Todas' },
  { id: 'Fauna', label: 'Fauna' },
  { id: 'Flora', label: 'Flora' },
  { id: 'Ecosistema', label: 'Ecosistema' },
];

function GalleryImg({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex aspect-[4/3] items-center justify-center bg-primary text-sm text-on-primary"
      >
        {alt}
      </div>
    );
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className="w-full" />;
}

export default function Gallery() {
  const [filtro, setFiltro] = useState<GalleryCategory | 'todas'>('todas');
  const [index, setIndex] = useState<number | null>(null);
  const items = useMemo(() => GALLERY.filter((g) => filtro === 'todas' || g.category === filtro), [filtro]);
  const close = useCallback(() => setIndex(null), []);
  useDialog(index !== null, close);

  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length)),
    [items.length],
  );
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % items.length)), [items.length]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, prev, next]);

  const touchX = useRef<number | null>(null);
  const item = index !== null ? items[index] : null;

  return (
    <Section id="galeria" ariaLabel="Galería">
      <SectionHeader
        eyebrow="Galería Inmersiva"
        title="Tesoros visuales de Colombia"
        subtitle="Haz clic en cualquier imagen para ampliarla y leer sobre su hábitat y características."
      />
      <div role="group" aria-label="Filtrar galería" className="mb-8 flex flex-wrap justify-center gap-2">
        {FILTROS.map((f) => (
          <Chip key={f.id} active={filtro === f.id} onClick={() => setFiltro(f.id)}>
            {f.label}
          </Chip>
        ))}
      </div>
      <div className="masonry">
        {items.map((g, i) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative block w-full overflow-hidden rounded-3xl border border-line bg-surface-2 text-left shadow-sm"
            aria-label={`Ampliar foto: ${g.title}`}
          >
            <GalleryImg src={g.url} alt={g.title} />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 text-white transition group-hover:pb-5">
              <span className="block font-semibold">{g.title}</span>
              <span className="text-xs text-white/80 capitalize">{g.category}</span>
            </span>
          </button>
        ))}
      </div>

      {item && index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Visor de fotos: ${item.title}`}
          className="fixed inset-0 z-[80] flex flex-col bg-black/95 text-white"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
            touchX.current = null;
          }}
        >
          <div className="flex items-center justify-between p-3">
            <span className="text-sm text-white/70">
              {index + 1} / {items.length}
            </span>
            <button
              type="button"
              onClick={close}
              autoFocus
              aria-label="Cerrar visor"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
          </div>
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <img
              key={item.id}
              src={item.url}
              alt={item.title}
              className="animate-fade-up max-h-full max-w-full rounded-xl object-contain"
            />
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute left-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 sm:left-4"
            >
              <ChevronLeft className="h-7 w-7" aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Foto siguiente"
              className="absolute right-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 sm:right-4"
            >
              <ChevronRight className="h-7 w-7" aria-hidden />
            </button>
          </div>
          <div className="mx-auto w-full max-w-3xl p-4 text-center sm:p-6">
            <h3 className="text-lg font-bold">{item.title}</h3>
            <p className="mt-1 text-sm text-white/80">{item.description}</p>
            <p className="mt-2 text-xs text-white/70">📍 {item.location}</p>
          </div>
        </div>
      )}
    </Section>
  );
}
