import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import { GRUPOS, SPECIES, grupoDe, grupoInfo } from '../data/catalog';
import type { Grupo } from '../data/types';
import { useApp } from '../lib/AppContext';
import { Chip, GroupIcon, Section, SectionHeader } from './ui';

export interface MapFocus {
  id: string;
  nonce: number;
}

const esc = (t: string) => t.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export default function MapSection({ focus }: { focus: MapFocus | null }) {
  const { openSpecies } = useApp();
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [grupo, setGrupo] = useState<Grupo | 'todos'>('todos');
  const openRef = useRef(openSpecies);
  openRef.current = openSpecies;

  useEffect(() => {
    let cancelled = false;
    import('leaflet')
      .then((L) => {
        if (cancelled || !el.current) return;
        const map = L.map(el.current, { scrollWheelZoom: false, zoomControl: true });
        mapRef.current = map;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(map);

        SPECIES.forEach((s) => {
          const color = grupoInfo(grupoDe(s)).color;
          const marker = L.marker([s.coordinates.lat, s.coordinates.lng], {
            title: s.commonName,
            alt: s.commonName,
            icon: L.divIcon({
              className: '',
              html: `<div class="map-marker" style="width:20px;height:20px;background:${color}"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
              popupAnchor: [0, -10],
            }),
          });
          marker.bindPopup(
            `<div style="width:200px">
              ${s.imageUrl ? `<img src="${esc(s.imageUrl)}" alt="${esc(s.commonName)}" style="width:100%;height:110px;object-fit:cover;border-radius:12px" loading="lazy" onerror="this.style.display='none'"/>` : ''}
              <p style="margin:8px 0 0;font-weight:700;font-size:15px">${esc(s.commonName)}</p>
              <p style="margin:2px 0 0;font-style:italic;font-size:12px;opacity:.75">${esc(s.scientificName)}</p>
              <p style="margin:4px 0 8px;font-size:12px">${esc(s.coordinates.locationName)}</p>
              <button type="button" data-ficha="${esc(s.id)}" style="width:100%;min-height:38px;border:0;border-radius:999px;background:var(--c-primary);color:var(--c-on-primary);font-weight:600;cursor:pointer">Ver ficha</button>
            </div>`,
            { minWidth: 200 },
          );
          marker.on('popupopen', (e) => {
            const btn = e.popup.getElement()?.querySelector<HTMLButtonElement>('[data-ficha]');
            if (btn) btn.onclick = () => openRef.current(s.id);
          });
          marker.addTo(map);
          markers.current.set(s.id, marker);
        });

        map.fitBounds(L.latLngBounds(SPECIES.map((s) => [s.coordinates.lat, s.coordinates.lng] as [number, number])), {
          padding: [30, 30],
        });
        setReady(true);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markers.current.clear();
    };
  }, []);

  // filtro por grupo
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    SPECIES.forEach((s) => {
      const m = markers.current.get(s.id);
      if (!m) return;
      const visible = grupo === 'todos' || grupoDe(s) === grupo;
      if (visible && !map.hasLayer(m)) m.addTo(map);
      if (!visible && map.hasLayer(m)) m.remove();
    });
  }, [grupo, ready]);

  // centrar en una especie pedida desde una tarjeta
  useEffect(() => {
    if (!focus || !ready) return;
    const s = SPECIES.find((x) => x.id === focus.id);
    const map = mapRef.current;
    if (!s || !map) return;
    if (grupo !== 'todos' && grupo !== grupoDe(s)) setGrupo('todos');
    const t = window.setTimeout(() => {
      map.invalidateSize();
      map.setView([s.coordinates.lat, s.coordinates.lng], 8, { animate: true });
      const m = markers.current.get(s.id);
      if (m && !map.hasLayer(m)) m.addTo(map);
      m?.openPopup();
    }, 450);
    return () => window.clearTimeout(t);
  }, [focus, ready]);

  return (
    <Section id="mapa" className="bg-surface-2/50" ariaLabel="Mapa de especies">
      <SectionHeader
        eyebrow="Mapa"
        title="¿Dónde viven?"
        subtitle="Cada punto es una especie endémica. Toca un marcador para conocerla."
      />
      <div role="group" aria-label="Filtrar el mapa por grupo" className="mb-4 flex flex-wrap justify-center gap-2">
        <Chip active={grupo === 'todos'} onClick={() => setGrupo('todos')}>
          Todos
        </Chip>
        {GRUPOS.map((g) => (
          <Chip key={g.id} active={grupo === g.id} onClick={() => setGrupo(g.id)}>
            <span className="h-3 w-3 rounded-full" style={{ background: g.color }} aria-hidden /> {g.label}
          </Chip>
        ))}
      </div>
      <div className="relative isolate overflow-hidden rounded-3xl border border-line shadow-sm">
        <div ref={el} className="h-[440px] w-full sm:h-[560px]" aria-label="Mapa interactivo de Colombia" />
        {failed && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface p-6 text-center text-muted">
            No pudimos cargar el mapa. Revisa tu conexión e inténtalo de nuevo.
          </div>
        )}
        <div className="pointer-events-none absolute bottom-3 left-3 z-[400] hidden rounded-2xl bg-surface/95 p-3 text-xs shadow-lg sm:block">
          <p className="mb-1.5 font-semibold text-text">Leyenda</p>
          <ul className="space-y-1">
            {GRUPOS.map((g) => (
              <li key={g.id} className="flex items-center gap-2 text-muted">
                <span
                  className="h-3 w-3 rounded-full border-2 border-white"
                  style={{ background: g.color }}
                  aria-hidden
                />
                {g.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ul
        className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted sm:hidden"
        aria-label="Leyenda"
      >
        {GRUPOS.map((g) => (
          <li key={g.id} className="flex items-center gap-1.5">
            <GroupIcon grupo={g.id} className="h-4 w-4" />
            <span className="h-3 w-3 rounded-full" style={{ background: g.color }} aria-hidden /> {g.label}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-xs text-muted">
        Las ubicaciones son aproximadas y se muestran con fines educativos.
      </p>
    </Section>
  );
}
