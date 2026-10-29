import { useState } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import data from '../data/curiosities.json';
import type { Curiosity } from '../data/types';
import { SPECIES } from '../data/catalog';
import { useApp } from '../lib/AppContext';
import { Section, SectionHeader, SpeciesImage } from './ui';

const CURIOSITIES = data as Curiosity[];
const speciesIdOf = (c: Curiosity) => SPECIES.find((s) => s.scientificName === c.scientificName)?.id;

export default function Curiosities() {
  const { openSpecies } = useApp();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setFlipped((f) => ({ ...f, [id]: !f[id] }));

  return (
    <Section id="curiosidades" ariaLabel="Conoce los datos curiosos">
      <SectionHeader
        eyebrow="Especies Insignia"
        title="Conoce los datos curiosos"
        subtitle="Toca cada tarjeta para descubrir el secreto de nuestras especies insignia."
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CURIOSITIES.map((c) => {
          const isFlipped = !!flipped[c.id];
          const sid = speciesIdOf(c);
          return (
            <div key={c.id} className={`flip h-[30rem] ${isFlipped ? 'is-flipped' : ''}`}>
              <div className="flip-inner h-full">
                <div
                  aria-hidden={isFlipped}
                  className="flip-face flex h-full w-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-sm"
                >
                  <div className="relative">
                    <SpeciesImage
                      src={c.imageUrl}
                      alt={c.speciesName}
                      grupo="flora"
                      className="h-52 w-full shrink-0"
                      showCredit={false}
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white">
                      {c.badge}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="font-bold text-text">{c.speciesName}</p>
                    <p className="text-sm text-muted italic">{c.scientificName}</p>
                    <p className="mt-3 font-display text-lg leading-snug font-bold text-ink">{c.shortHook}</p>
                    <p className="mt-auto text-sm text-muted">¿Quieres saber la respuesta?</p>
                    <button
                      type="button"
                      tabIndex={isFlipped ? -1 : 0}
                      onClick={() => toggle(c.id)}
                      className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 font-semibold text-on-primary hover:bg-primary-strong"
                    >
                      <Sparkles className="h-4 w-4" aria-hidden /> Descubrir secreto
                    </button>
                  </div>
                </div>
                <div
                  className="flip-face flip-back flex flex-col overflow-y-auto rounded-3xl bg-gradient-to-br from-primary to-primary-strong p-6 text-on-primary shadow-xl"
                  aria-hidden={!isFlipped}
                >
                  <p className="text-xs font-semibold uppercase opacity-80">{c.badge}</p>
                  <p className="mt-1 font-bold">{c.speciesName}</p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed">{c.fullStory}</p>
                  <div className="mt-4 flex flex-col gap-2">
                    {sid && (
                      <button
                        type="button"
                        tabIndex={isFlipped ? 0 : -1}
                        onClick={() => openSpecies(sid)}
                        className="min-h-11 rounded-full bg-white px-4 py-2 font-semibold text-[#11271c] hover:bg-white/90"
                      >
                        Ver especie
                      </button>
                    )}
                    <button
                      type="button"
                      tabIndex={isFlipped ? 0 : -1}
                      onClick={() => toggle(c.id)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/60 px-4 py-2 text-sm font-medium hover:bg-white/10"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden /> Volver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
