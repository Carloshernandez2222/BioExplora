import { useEffect, useRef } from 'react';
import { BookOpen, Eye, ImagePlus, MapPin, ShieldAlert } from 'lucide-react';
import type { Map as LeafletMap } from 'leaflet';
import { ESTADOS, getSpecies, grupoDe, grupoInfo } from '../data/catalog';
import { useApp } from '../lib/AppContext';
import Modal from './Modal';
import { SpeciesImage, btnPrimary } from './ui';

function MiniMap({ lat, lng, color }: { lat: number; lng: number; color: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: LeafletMap | undefined;
    let cancelled = false;
    import('leaflet').then((L) => {
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false, attributionControl: true }).setView([lat, lng], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);
      L.marker([lat, lng], {
        icon: L.divIcon({
          className: '',
          html: `<div class="map-marker" style="width:22px;height:22px;background:${color}"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
        keyboard: false,
      }).addTo(map);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng, color]);
  return (
    <div
      ref={el}
      className="isolate h-56 w-full overflow-hidden rounded-2xl"
      role="img"
      aria-label="Mapa con la ubicación de la especie"
    />
  );
}

function Ficha({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-4">
      <dt className="text-xs font-semibold text-muted uppercase">{label}</dt>
      <dd className="mt-1 text-sm text-text">{children}</dd>
    </div>
  );
}

export default function SpeciesModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { createPoster } = useApp();
  const s = id ? getSpecies(id) : undefined;
  const estado = s ? ESTADOS[s.conservationStatus] : undefined;
  const grupo = s ? grupoDe(s) : undefined;

  return (
    <Modal open={!!s} onClose={onClose} labelledBy="modal-especie-titulo" className="max-w-4xl">
      {s && estado && grupo && (
        <>
          <SpeciesImage
            src={s.imageUrl}
            alt={`Fotografía de ${s.commonName} (${s.scientificName})`}
            grupo={grupo}
            credito={s.imageAttribution}
            className="aspect-[16/10] w-full sm:rounded-t-3xl"
            eager
          />
          <div className="space-y-6 p-6 sm:p-8">
            <header>
              <div className="mb-3 flex flex-wrap gap-2">
                {s.isCoreProjectSpecies && (
                  <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-[#3b2600]">⭐ Insignia</span>
                )}
                <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-ink">
                  {grupoInfo(grupo).emoji} {grupoInfo(grupo).label}
                </span>
                <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-ink">
                  Región {s.region}
                </span>
                <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-ink">
                  {s.endemicLevel}
                </span>
              </div>
              <h2 id="modal-especie-titulo" className="text-2xl font-extrabold text-text sm:text-3xl">
                {s.commonName}
              </h2>
              <p className="text-lg text-muted">
                <em>{s.scientificName}</em> · {s.englishName}
              </p>
              <p className="mt-2 flex items-start gap-1.5 text-muted">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-ink" aria-hidden /> {s.coordinates.locationName}
              </p>
            </header>

            {s.isCoreProjectSpecies && s.projectSpotlightReason && (
              <p className="rounded-2xl border-l-4 border-gold bg-gold/10 p-4 text-text">{s.projectSpotlightReason}</p>
            )}

            <div className="flex flex-col gap-3 rounded-2xl border border-line p-4 sm:flex-row sm:items-center">
              <span
                className={`self-start rounded-full px-3 py-1 text-sm font-bold whitespace-nowrap ${estado.className}`}
              >
                {estado.label}
              </span>
              <p className="text-sm text-muted">{estado.explicacion}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface-2 p-4">
                <h3 className="font-bold text-text">✨ ¿Por qué es especial?</h3>
                <p className="mt-1 text-sm text-muted">{s.whySpecial}</p>
              </div>
              <div className="rounded-2xl bg-surface-2 p-4">
                <h3 className="font-bold text-text">💡 Dato curioso</h3>
                <p className="mt-1 text-sm text-muted">{s.curiousFact}</p>
              </div>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              <Ficha label="Hábitat">{s.habitat}</Ficha>
              <Ficha label="Rango de altitud">{s.elevationRange}</Ficha>
              <Ficha label="Departamento">{s.department.join(', ')}</Ficha>
              <Ficha label="Rol ecológico">{s.ecologicalRole}</Ficha>
            </dl>

            <div>
              <h3 className="mb-2 flex items-center gap-2 font-bold text-text">
                <Eye className="h-5 w-5 text-ink" aria-hidden /> Características
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                {s.characteristics.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 flex items-center gap-2 font-bold text-text">
                <ShieldAlert className="h-5 w-5 text-[#C2410C]" aria-hidden /> Principales amenazas
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                {s.threats.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-text">Taxonomía</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                {(
                  [
                    ['Reino', s.taxonomy.kingdom],
                    ['Filo', s.taxonomy.phylum],
                    ['Clase', s.taxonomy.class],
                    ['Orden', s.taxonomy.order],
                    ['Familia', s.taxonomy.family],
                    ['Género', s.taxonomy.genus],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-line px-3 py-2">
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd className="font-medium text-text">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-text">¿Dónde vive?</h3>
              <MiniMap lat={s.coordinates.lat} lng={s.coordinates.lng} color={grupoInfo(grupo).color} />
            </div>

            {s.sources.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-bold text-text">
                  <BookOpen className="h-5 w-5 text-ink" aria-hidden /> Fuentes
                </h3>
                <ul className="space-y-1 text-sm text-muted">
                  {s.sources.map((f) => (
                    <li key={f.name + f.year}>
                      <strong className="text-text">{f.name}</strong> · {f.institution} ({f.year}). {f.citation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              className={`${btnPrimary} w-full`}
              onClick={() => {
                onClose();
                createPoster(s.id);
              }}
            >
              <ImagePlus className="h-5 w-5" aria-hidden /> Generar afiche o post para redes
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
