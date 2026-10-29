import { Ban, CloudSun, Droplets, Megaphone, Mountain, TreePine } from 'lucide-react';
import { Section, SectionHeader, card, cardHover } from './ui';

const AMENAZAS = [
  {
    icon: TreePine,
    titulo: 'Pérdida de Hábitat y Deforestación',
    texto:
      'La tala para ganadería extensiva y monocultivos fragmenta los bosques nativos, dejando a especies como el Tití Cabeciblanco sin árboles continuos para desplazarse.',
  },
  {
    icon: Ban,
    titulo: 'Tráfico Ilegal de Fauna Silvestre',
    texto:
      'La captura de loros, monos y reptiles llamativos (como el Lagarto Azul) para venderlos como mascotas daña las poblaciones y rompe familias enteras.',
  },
  {
    icon: CloudSun,
    titulo: 'Cambio Climático y Hongos',
    texto:
      'El aumento de temperatura en las altas montañas seca los páramos del Perico del Sol y favorece la propagación de enfermedades en ranas de niebla.',
  },
];

const ACCIONES = [
  {
    icon: Ban,
    titulo: 'Nunca compres animales silvestres',
    texto:
      'Los loros, micos, tortugas y ranas pertenecen a la libertad de su hábitat. Denuncia el tráfico ante las autoridades ambientales (CAR y Policía Ambiental).',
  },
  {
    icon: Megaphone,
    titulo: 'Comparte información y educa',
    texto:
      'Habla con tus amigos, familiares y en redes sobre las especies endémicas. La desinformación se combate cuando la gente conoce lo que tiene.',
  },
  {
    icon: Mountain,
    titulo: 'Apoya el ecoturismo responsable',
    texto:
      'Cuando visites parques naturales o reservas comunitarias, no dejes basura, no arranques plantas como frailejones y contrata guías locales.',
  },
  {
    icon: Droplets,
    titulo: 'Cuida el agua y reduce residuos',
    texto:
      'El agua que ahorras en casa viene de los páramos y ríos donde viven estas especies. Reducir plásticos protege las cuencas fluviales.',
  },
];

export default function Protect() {
  return (
    <Section id="proteger" className="bg-surface-2/50" ariaLabel="¿Por qué debemos protegerlas?">
      <SectionHeader
        eyebrow="Compromiso Ambiental"
        title="¿Por qué debemos protegerlas?"
        subtitle="Las especies endémicas tienen áreas de distribución reducidas. Si una alteración destruye su único hogar, se extinguen sin retorno."
      />
      <p className="mx-auto max-w-3xl text-center font-display text-2xl leading-snug font-extrabold text-ink sm:text-3xl">
        "Conocer nuestra biodiversidad es el primer paso para aprender a protegerla"
      </p>
      <p className="mx-auto mt-4 mb-12 max-w-2xl text-center text-muted">
        Nadie ama ni defiende lo que no conoce. Al compartir estas especies en colegios y redes, evitamos que
        desaparezcan en el silencio.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {AMENAZAS.map(({ icon: Icon, titulo, texto }) => (
          <article key={titulo} className={`${card} ${cardHover} p-6`}>
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C2410C]/12 text-[#C2410C] dark:text-[#FB923C]">
              <Icon className="h-7 w-7" aria-hidden />
            </span>
            <h3 className="text-lg font-bold text-text">{titulo}</h3>
            <p className="mt-2 text-muted">{texto}</p>
          </article>
        ))}
      </div>

      <p className="mt-16 text-center text-xs font-bold tracking-wide text-ink uppercase">Acciones cotidianas</p>
      <h3 className="mt-2 mb-8 text-center text-2xl font-extrabold text-text">
        ¿Cómo puedes contribuir desde tu vida diaria?
      </h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ACCIONES.map(({ icon: Icon, titulo, texto }, i) => (
          <article key={titulo} className={`${card} ${cardHover} relative p-6 text-center`}>
            <span className="absolute top-4 left-4 font-display text-sm font-bold text-muted">{i + 1}</span>
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary">
              <Icon className="h-7 w-7" aria-hidden />
            </span>
            <h4 className="font-bold text-text">{titulo}</h4>
            <p className="mt-2 text-sm text-muted">{texto}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
