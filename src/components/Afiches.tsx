import PosterGenerator, { type PosterRequest } from './PosterGenerator';
import { Section, SectionHeader, card } from './ui';

export default function Afiches({ posterRequest }: { posterRequest: PosterRequest | null }) {
  return (
    <Section id="afiches" ariaLabel="Afiches">
      <SectionHeader
        eyebrow="Afiches"
        title="Crea tu afiche y compártelo"
        subtitle="Elige una especie, un formato y un estilo de color. Descarga tu afiche o compártelo en redes."
      />
      <div className={`${card} p-5 sm:p-8`}>
        <PosterGenerator request={posterRequest} />
      </div>
    </Section>
  );
}
