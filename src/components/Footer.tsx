import { Globe, Leaf, Mail, MessageCircle } from 'lucide-react';
import { SPECIES } from '../data/catalog';
import { HERO_IMAGE } from '../data/hero';
import { scrollToId } from '../lib/utils';

const ENLACES = [
  { id: 'especies', label: 'Catálogo de Especies' },
  { id: 'evaluaciones', label: 'Mi espacio (evaluaciones e insignias)' },
  { id: 'afiches', label: 'Afiches para Imprimir' },
  { id: 'encuesta', label: 'Encuesta Ciudadana' },
  { id: 'mapa', label: 'Mapa' },
  { id: 'nosotros', label: 'Nuestro proyecto' },
];

const FUENTES = [
  { nombre: 'Instituto Humboldt', url: 'https://www.humboldt.org.co/' },
  { nombre: 'SiB Colombia', url: 'https://biodiversidad.co/' },
  { nombre: 'UICN Red List', url: 'https://www.iucnredlist.org/' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a1f15] text-white/85">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="flex items-center gap-2 font-display text-xl font-extrabold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B5E3F] text-[#2ECC71]">
              <Leaf className="h-5 w-5" aria-hidden />
            </span>
            BioExplora Colombia
          </p>
          <p className="mt-4 text-white/75">
            Iniciativa de voluntariado ambiental para la divulgación y valoración de las especies endémicas de nuestro
            territorio.
          </p>
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-white">Redes sociales</p>
            <div className="flex gap-2">
              {[
                { icon: Globe, label: 'Sitio web (próximamente)' },
                { icon: MessageCircle, label: 'Redes sociales (próximamente)' },
                { icon: Mail, label: 'Correo de contacto (próximamente)' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  title={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70"
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  <span className="sr-only">{label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <nav aria-label="Enlaces rápidos">
          <h2 className="mb-3 font-bold text-white">Enlaces rápidos</h2>
          <ul className="space-y-2 text-sm">
            {ENLACES.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(l.id);
                  }}
                  className="hover:text-white hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 font-bold text-white">Fuentes científicas consultadas</h2>
          <ul className="space-y-2 text-sm">
            {FUENTES.map((f) => (
              <li key={f.url}>
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                  {f.nombre}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-bold text-white">Créditos de las imágenes</h2>
          <details className="text-sm">
            <summary className="cursor-pointer hover:text-white">Ver créditos de las fotos</summary>
            <ul className="mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-2 text-xs text-white/70">
              <li>
                <a
                  href={HERO_IMAGE.pagina}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline"
                >
                  Portada: {HERO_IMAGE.credito}
                </a>
              </li>
              {SPECIES.map((s) => (
                <li key={s.id}>
                  {s.commonName}: {s.imageAttribution}
                </li>
              ))}
            </ul>
          </details>
          <p className="mt-3 text-xs text-white/55">Mapas: © colaboradores de OpenStreetMap.</p>
        </div>
      </div>
      <div className="border-t border-white/10 pt-5 pb-24 text-center text-xs text-white/55 sm:pb-5">
        © {new Date().getFullYear()} BioExplora Colombia · Voluntariado Ambiental
      </div>
    </footer>
  );
}
