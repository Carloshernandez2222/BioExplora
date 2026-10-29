import { useState, type ReactNode } from 'react';
import { Bird, Flower2, PawPrint, Shell, Turtle } from 'lucide-react';
import type { Grupo } from '../data/types';
import { grupoInfo } from '../data/catalog';
import { useInView } from '../lib/hooks';

export function Section({
  id,
  children,
  className = '',
  ariaLabel,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section id={id} aria-label={ariaLabel} className={`py-16 sm:py-24 ${className}`}>
      <div ref={ref} className={`reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${inView ? 'is-visible' : ''}`}>
        {children}
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`mb-10 sm:mb-14 ${center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}`}>
      {eyebrow && (
        <p className="mb-3 inline-block rounded-full bg-surface-2 px-4 py-1 text-xs font-semibold tracking-wide text-ink uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl leading-tight font-extrabold text-text sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base text-muted sm:text-lg">{subtitle}</p>}
    </div>
  );
}

export function GroupIcon({ grupo, className = 'h-6 w-6' }: { grupo: Grupo; className?: string }) {
  const props = { className, 'aria-hidden': true } as const;
  switch (grupo) {
    case 'reptiles-anfibios':
      return <Turtle {...props} />;
    case 'aves':
      return <Bird {...props} />;
    case 'primates-marsupiales':
      return <PawPrint {...props} />;
    case 'flora':
      return <Flower2 {...props} />;
    default:
      return <Shell {...props} />;
  }
}

/** Imagen con carga diferida, crédito del autor y respaldo si no carga. */
export function SpeciesImage({
  src,
  alt,
  grupo,
  credito,
  pagina,
  className = '',
  eager = false,
  showCredit = true,
}: {
  src: string;
  alt: string;
  grupo: Grupo;
  credito?: string;
  pagina?: string;
  className?: string;
  eager?: boolean;
  showCredit?: boolean;
}) {
  const [error, setError] = useState(false);
  const failed = error || !src;
  const color = grupoInfo(grupo).color;
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {failed ? (
        <div
          role="img"
          aria-label={alt}
          className="flex h-full w-full items-center justify-center text-white"
          style={{ background: `linear-gradient(135deg, ${color}, #0b3d2a)` }}
        >
          <GroupIcon grupo={grupo} className="h-14 w-14 opacity-90" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setError(true)}
          className="h-full w-full object-cover"
        />
      )}
      {showCredit &&
        credito &&
        !failed &&
        (pagina ? (
          <a
            href={pagina}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-0 bottom-0 max-w-full truncate rounded-tl-lg bg-black/60 px-2 py-0.5 text-[10px] text-white/90 hover:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            Foto: {credito}
          </a>
        ) : (
          <span className="absolute right-0 bottom-0 max-w-full truncate rounded-tl-lg bg-black/60 px-2 py-0.5 text-[10px] text-white/90">
            Foto: {credito}
          </span>
        ))}
    </div>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? 'border-primary bg-primary text-on-primary shadow-md'
          : 'border-line bg-surface text-text hover:border-primary hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

export const btnPrimary =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-on-primary shadow-md transition hover:bg-primary-strong hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50';
export const btnSecondary =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-primary px-5 py-2.5 font-semibold text-ink transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50';
export const btnIcon =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-primary hover:bg-surface-2';
export const card = 'rounded-3xl border border-line bg-surface shadow-sm';
export const cardHover = 'transition duration-300 hover:-translate-y-1 hover:shadow-xl';
