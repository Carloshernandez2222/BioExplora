import { useMemo, useState } from 'react';
import { Search, Star, X } from 'lucide-react';
import { GRUPOS, INSIGNIA_SPECIES, SPECIES, TOTAL_SPECIES, grupoDe } from '../data/catalog';
import type { Grupo } from '../data/types';
import SpeciesCard from './SpeciesCard';
import { Chip, Section, SectionHeader, btnPrimary } from './ui';

type Filtro = 'todas' | 'insignias' | Grupo;

const normalize = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Las especies insignia se muestran primero.
const ORDERED = [...INSIGNIA_SPECIES, ...SPECIES.filter((s) => !s.isCoreProjectSpecies)];

export default function SpeciesGrid() {
  const [query, setQuery] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todas');

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return ORDERED.filter(
      (s) =>
        (filtro === 'todas' || (filtro === 'insignias' ? s.isCoreProjectSpecies : grupoDe(s) === filtro)) &&
        (!q ||
          normalize(
            [s.commonName, s.scientificName, s.region, s.coordinates.locationName, s.habitat, ...s.department].join(
              ' ',
            ),
          ).includes(q)),
    );
  }, [query, filtro]);

  const countFor = (g: Grupo) => SPECIES.filter((s) => grupoDe(s) === g).length;
  const clear = () => {
    setQuery('');
    setFiltro('todas');
  };

  return (
    <Section id="especies" className="bg-surface-2/50" ariaLabel="Descubre las especies">
      <SectionHeader
        eyebrow="Biodiversidad Única de Colombia · Especies Endémicas"
        title="Descubre las especies"
        subtitle={`Seres extraordinarios que solo habitan en nuestro territorio nacional: desde las ${INSIGNIA_SPECIES.length} especies insignia de nuestro voluntariado hasta los tesoros biológicos de nuestras selvas, ríos y páramos.`}
      />

      <div className="mx-auto mb-6 max-w-2xl">
        <label htmlFor="buscar-especie" className="sr-only">
          Buscar especies
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            id="buscar-especie"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, departamento, hábitat..."
            className="h-14 w-full rounded-full border border-line bg-surface pr-12 pl-12 text-base text-text shadow-sm placeholder:text-muted focus:border-primary focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Borrar búsqueda"
              className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-2"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <div role="group" aria-label="Filtrar por categoría" className="mb-8 flex flex-wrap justify-center gap-2">
        <Chip active={filtro === 'todas'} onClick={() => setFiltro('todas')}>
          Todas ({TOTAL_SPECIES})
        </Chip>
        <Chip active={filtro === 'insignias'} onClick={() => setFiltro('insignias')}>
          <Star className="h-4 w-4" aria-hidden /> {INSIGNIA_SPECIES.length} Especies Insignias
        </Chip>
        {GRUPOS.map((g) => (
          <Chip key={g.id} active={filtro === g.id} onClick={() => setFiltro(g.id)}>
            <span aria-hidden>{g.emoji}</span> {g.label} ({countFor(g.id)})
          </Chip>
        ))}
      </div>

      <p className="mb-6 text-center text-sm font-medium text-muted" aria-live="polite">
        Mostrando {filtered.length} de {TOTAL_SPECIES} especies endémicas
      </p>

      {filtered.length === 0 ? (
        <div className="mx-auto max-w-md rounded-3xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="mb-4 text-lg font-semibold text-text">No encontramos especies</p>
          <button type="button" className={btnPrimary} onClick={clear}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <SpeciesCard key={s.id} s={s} />
          ))}
        </div>
      )}
    </Section>
  );
}
