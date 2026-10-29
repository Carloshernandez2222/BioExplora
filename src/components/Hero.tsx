import { useEffect, useState } from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';
import { INSIGNIA_SPECIES } from '../data/catalog';
import { HERO_IMAGE } from '../data/hero';
import { useInView } from '../lib/hooks';
import { prefersReducedMotion, scrollToId } from '../lib/utils';

function Counter({
  to,
  prefix = '',
  suffix = '',
  start,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  start: boolean;
}) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion()) {
      setValue(to);
      return;
    }
    const duration = 1400;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, start]);
  return (
    <span>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

const STATS = [
  { to: 2, prefix: '#', suffix: '', label: 'País más biodiverso del mundo' },
  { to: 10, prefix: '', suffix: '%', label: 'De la biodiversidad del planeta' },
  { to: INSIGNIA_SPECIES.length, prefix: '', suffix: ' Insignias', label: 'Especies investigadas a fondo' },
];

export default function Hero() {
  const { ref, inView } = useInView<HTMLDListElement>({ threshold: 0.3 });
  const [bgFailed, setBgFailed] = useState(false);

  return (
    <section id="inicio" className="relative flex min-h-svh items-center overflow-hidden bg-[#0b2a1d] text-white">
      {!bgFailed && (
        <img
          src={HERO_IMAGE.src}
          alt="Selva del Chocó junto al mar en la Ensenada de Utría"
          className="absolute inset-0 h-full w-full object-cover"
          {...{ fetchpriority: 'high' }}
          onError={() => setBgFailed(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-[#06140d]/95" aria-hidden />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <p className="mb-5 inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur sm:text-sm">
          Voluntariado Ambiental · Biodiversidad Colombiana
        </p>
        <h1 className="max-w-4xl text-4xl leading-[1.08] font-extrabold sm:text-6xl lg:text-7xl">
          Colombia: <span className="text-gradient">un tesoro de especies únicas</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
          Descubre las especies que solo habitan en nuestro territorio y conoce por qué protegerlas es responsabilidad
          de todos.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#especies"
            onClick={(e) => {
              e.preventDefault();
              scrollToId('especies');
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 font-semibold text-[#06281a] shadow-lg transition hover:brightness-110"
          >
            Explorar las especies <ArrowDown className="h-5 w-5" aria-hidden />
          </a>
          <a
            href="#concepto"
            onClick={(e) => {
              e.preventDefault();
              scrollToId('concepto');
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-white/70 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            <Sparkles className="h-5 w-5" aria-hidden /> Descubrir nuestra biodiversidad
          </a>
        </div>

        <dl ref={ref} className="mt-14 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <p className="font-display text-4xl font-extrabold text-gold sm:text-5xl">
                  <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} start={inView} />
                </p>
                <p className="mt-1 font-medium">{s.label}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <a
        href={HERO_IMAGE.pagina}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-3 bottom-2 text-[10px] text-white/70 hover:text-white"
      >
        Foto: {HERO_IMAGE.credito}
      </a>
    </section>
  );
}
