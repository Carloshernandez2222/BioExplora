import { Droplets, Gem } from 'lucide-react';
import { getSpecies, grupoDe } from '../data/catalog';
import { useApp } from '../lib/AppContext';
import { Section, SectionHeader, SpeciesImage, card, cardHover } from './ui';

const RAZONES = [
  { icon: Gem, titulo: 'Patrimonio Irremplazable', texto: 'No existen réplicas en ninguna otra parte del mundo.' },
  {
    icon: Droplets,
    titulo: 'Guardianes Ecosistémicos',
    texto: 'Regulan el agua, dispersan semillas y controlan plagas.',
  },
];

export default function Concept() {
  const { openSpecies } = useApp();
  const ejemplo = getSpecies('anolis-gorgonae')!;

  return (
    <Section id="concepto" ariaLabel="¿Qué significa que una especie sea endémica?">
      <SectionHeader eyebrow="Concepto Biológico Fundamental" title="¿Qué significa que una especie sea endémica?" />
      <div className="grid items-start gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <blockquote className={`${card} border-l-8 border-l-primary p-6 sm:p-8`}>
            <p className="mb-2 text-xs font-bold tracking-wide text-ink uppercase">Definición Clave</p>
            <p className="text-lg leading-relaxed text-text sm:text-xl">
              "Una especie endémica es aquella que se encuentra de forma natural exclusivamente en una región geográfica
              determinada".
            </p>
          </blockquote>
          <p className="rounded-3xl bg-gradient-to-r from-primary to-primary-strong p-6 text-center font-display text-lg font-bold text-on-primary sm:text-xl">
            Esto significa que si desaparece de Colombia, desaparece para siempre de la faz de la Tierra.
          </p>
          <p className="leading-relaxed text-muted">
            A diferencia de las especies cosmopolitas que habitan en múltiples continentes, nuestras especies endémicas
            evolucionaron adaptadas a microclimas únicos: las cumbres frías de los páramos, las islas oceánicas del
            Pacífico o los parches relictos de bosque seco caribeño.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {RAZONES.map(({ icon: Icon, titulo, texto }) => (
              <article key={titulo} className={`${card} ${cardHover} p-5`}>
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-ink">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="font-bold text-text">{titulo}</h3>
                <p className="mt-2 text-sm text-muted">{texto}</p>
              </article>
            ))}
          </div>
        </div>

        <figure className={`${card} overflow-hidden lg:col-span-2`}>
          <SpeciesImage
            src={ejemplo.imageUrl}
            alt={`${ejemplo.commonName}, un lagarto de color azul intenso sobre un tronco`}
            grupo={grupoDe(ejemplo)}
            credito={ejemplo.imageAttribution}
            className="aspect-[4/3]"
          />
          <figcaption className="p-6">
            <p className="text-xs font-semibold text-ink uppercase">Ejemplo colombiano</p>
            <h3 className="mt-1 text-xl font-bold text-text">{ejemplo.commonName}</h3>
            <p className="text-sm text-muted italic">{ejemplo.scientificName}</p>
            <p className="mt-3 text-muted">
              Solo habita en la pequeña Isla Gorgona en el Pacífico de Colombia. Ningún otro país tiene este reptil azul
              brillante.
            </p>
            <button
              type="button"
              onClick={() => openSpecies(ejemplo.id)}
              className="mt-4 font-semibold text-ink underline-offset-4 hover:underline"
            >
              Conocer más sobre este lagarto →
            </button>
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}
