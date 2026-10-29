import { ImagePlus, MapPin, Map as MapIcon, Star } from 'lucide-react';
import type { Species } from '../data/types';
import { ESTADOS, grupoDe } from '../data/catalog';
import { useApp } from '../lib/AppContext';
import { SpeciesImage, btnIcon, btnPrimary, card, cardHover } from './ui';

export default function SpeciesCard({ s }: { s: Species }) {
  const { openSpecies, showOnMap, createPoster } = useApp();
  const estado = ESTADOS[s.conservationStatus];
  return (
    <article className={`${card} ${cardHover} flex flex-col overflow-hidden`}>
      <div className="relative">
        <SpeciesImage
          src={s.imageUrl}
          alt={`Fotografía de ${s.commonName} (${s.scientificName})`}
          grupo={grupoDe(s)}
          credito={s.imageAttribution}
          className="aspect-[4/3]"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {s.region}
          </span>
          {s.isCoreProjectSpecies && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-[#3b2600]">
              <Star className="h-3 w-3 fill-current" aria-hidden /> Insignia
            </span>
          )}
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${estado.className}`}>{estado.label}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-text">{s.commonName}</h3>
        <p className="text-sm text-muted italic">{s.scientificName}</p>
        <p className="mt-2 flex items-start gap-1.5 text-sm text-muted">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden />
          {s.coordinates.locationName}
        </p>
        <div className="mt-4 space-y-3 text-sm">
          <p>
            <strong className="text-text">✨ ¿Por qué es especial?</strong>{' '}
            <span className="text-muted">{s.whySpecial}</span>
          </p>
          <p>
            <strong className="text-text">💡 Dato curioso:</strong> <span className="text-muted">{s.curiousFact}</span>
          </p>
        </div>
        <div className="mt-auto flex items-center gap-2 pt-5">
          <button type="button" className={`${btnPrimary} flex-1`} onClick={() => openSpecies(s.id)}>
            Conocer más
          </button>
          <button
            type="button"
            className={btnIcon}
            onClick={() => showOnMap(s.id)}
            aria-label={`Ver ubicación de ${s.commonName} en el mapa`}
            title="Ver ubicación en el mapa"
          >
            <MapIcon className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            className={btnIcon}
            onClick={() => createPoster(s.id)}
            aria-label={`Generar afiche o post para redes de ${s.commonName}`}
            title="Generar afiche o post para redes"
          >
            <ImagePlus className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
