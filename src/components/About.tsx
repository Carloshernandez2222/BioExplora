import { BarChart3, ClipboardCheck, Microscope, PenTool, Search, Share2 } from 'lucide-react';
import { scrollToId } from '../lib/utils';
import { Section, SectionHeader, btnPrimary, card } from './ui';

const ETAPAS = [
  {
    icon: Search,
    titulo: 'Investigamos',
    texto:
      'Seleccionamos especies endémicas representativas de Colombia y estudiamos a fondo sus características, hábitats e importancia ecológica.',
  },
  {
    icon: Microscope,
    titulo: 'Verificamos',
    texto:
      'Consultamos fuentes científicas confiables (Instituto Humboldt, UICN, SiB Colombia) para garantizar que la información sea rigurosa.',
  },
  {
    icon: PenTool,
    titulo: 'Diseñamos',
    texto:
      'Creamos publicaciones y afiches educativos con información clara, datos biológicos relevantes e imágenes de alta calidad.',
  },
  {
    icon: Share2,
    titulo: 'Compartimos',
    texto: 'Difundimos los contenidos en redes sociales, medios digitales y espacios educativos comunitarios.',
  },
  {
    icon: ClipboardCheck,
    titulo: 'Evaluamos',
    texto:
      'Utilizamos cuestionarios progresivos y encuestas accesibles mediante códigos QR para medir el aprendizaje ambiental.',
  },
  {
    icon: BarChart3,
    titulo: 'Analizamos',
    texto: 'Procesamos los resultados y exportamos los datos para evaluar el impacto educativo real de la divulgación.',
  },
];

export default function About() {
  return (
    <Section id="nosotros" ariaLabel="Nuestro proyecto de voluntariado ambiental">
      <SectionHeader
        eyebrow="Iniciativa Ciudadana y Ambiental · BioExplora Colombia"
        title="Nuestro proyecto de voluntariado ambiental"
        subtitle="Somos una iniciativa de voluntariado ambiental que busca dar a conocer la riqueza natural de Colombia, especialmente las especies endémicas que muchas veces pasan desapercibidas. A través de la divulgación científica en redes sociales y materiales educativos, queremos despertar la curiosidad, fortalecer el conocimiento y promover el cuidado de nuestra biodiversidad."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <article className={`${card} p-6`}>
          <h3 className="text-xl font-bold text-text">¿Qué queremos lograr?</h3>
          <p className="mt-3 text-muted">
            Nuestro objetivo es acercar el conocimiento sobre las especies endémicas de Colombia a más personas,
            utilizando información confiable, sencilla y visualmente atractiva. Queremos demostrar que conocer nuestra
            fauna y flora es el primer paso para aprender a valorarla y protegerla.
          </p>
        </article>
        <article className={`${card} p-6`}>
          <h3 className="text-xl font-bold text-text">Nuestro propósito</h3>
          <p className="mt-3 text-muted">
            Creemos que la biodiversidad colombiana merece ser conocida y valorada. Por eso, queremos aprovechar las
            herramientas digitales para compartir conocimiento, despertar interés por nuestras especies endémicas y
            contribuir a la educación ambiental.
          </p>
        </article>
      </div>

      <h3 className="mt-14 text-center text-2xl font-extrabold text-text">¿Cómo lo hacemos?</h3>
      <p className="mx-auto mt-2 mb-8 max-w-2xl text-center text-muted">
        Desarrollamos nuestra iniciativa a través de seis etapas ordenadas y colaborativas:
      </p>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ETAPAS.map(({ icon: Icon, titulo, texto }, i) => (
          <li key={titulo} className={`${card} flex gap-4 p-5`}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-bold text-ink">{i + 1}</p>
              <h4 className="font-bold text-text">{titulo}</h4>
              <p className="mt-1 text-sm text-muted">{texto}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 text-center">
        <button type="button" className={btnPrimary} onClick={() => scrollToId('afiches')}>
          Ver Afiches Educativos
        </button>
      </div>
    </Section>
  );
}
