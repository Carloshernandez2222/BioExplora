import data from './species.json';
import type { EstadoUICN, Grupo, Species } from './types';

export const SPECIES = data as Species[];
export const TOTAL_SPECIES = SPECIES.length;
export const INSIGNIA_SPECIES = SPECIES.filter((s) => s.isCoreProjectSpecies);

export const getSpecies = (id: string) => SPECIES.find((s) => s.id === id);

export const GRUPOS: { id: Grupo; emoji: string; label: string; color: string }[] = [
  { id: 'reptiles-anfibios', emoji: '🦎', label: 'Reptiles y Anfibios', color: '#D35400' },
  { id: 'primates-marsupiales', emoji: '🐒', label: 'Primates y Marsupiales', color: '#8E44AD' },
  { id: 'aves', emoji: '🦜', label: 'Aves Únicas', color: '#1F6FB2' },
  { id: 'flora', emoji: '🌿', label: 'Flora Restringida', color: '#1E8449' },
  { id: 'crustaceos', emoji: '🦀', label: 'Crustáceos Insulares', color: '#C0392B' },
];

/** Categoría del catálogo según la clase taxonómica de la especie. */
export function grupoDe(s: Species): Grupo {
  const c = s.taxonomy.class;
  if (s.taxonomy.kingdom === 'Plantae' || s.category === 'Flora') return 'flora';
  if (c === 'Reptilia' || c === 'Amphibia') return 'reptiles-anfibios';
  if (c === 'Mammalia') return 'primates-marsupiales';
  if (c === 'Aves') return 'aves';
  return 'crustaceos';
}

export const grupoInfo = (g: Grupo) => GRUPOS.find((x) => x.id === g)!;

export const ESTADOS: Record<EstadoUICN, { label: string; explicacion: string; className: string }> = {
  CR: {
    label: 'En Peligro Crítico (CR)',
    explicacion: 'Enfrenta un riesgo extremadamente alto de extinción en estado silvestre.',
    className: 'bg-[#B71C1C] text-white',
  },
  EN: {
    label: 'En Peligro (EN)',
    explicacion: 'Enfrenta un riesgo muy alto de extinción en estado silvestre.',
    className: 'bg-[#C2410C] text-white',
  },
  VU: {
    label: 'Vulnerable (VU)',
    explicacion: 'Enfrenta un riesgo alto de extinción en estado silvestre.',
    className: 'bg-[#FACC15] text-[#422006]',
  },
  NT: {
    label: 'Casi Amenazada (NT)',
    explicacion: 'Podría estar amenazada pronto si no la cuidamos.',
    className: 'bg-[#1D4ED8] text-white',
  },
  LC: {
    label: 'Preocupación Menor (LC)',
    explicacion: 'Por ahora su población es estable, pero depende de que su hábitat siga sano.',
    className: 'bg-[#15803D] text-white',
  },
};
