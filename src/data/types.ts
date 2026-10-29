// Estructura de datos tomada de la versión original del sitio (no modificar los textos).
export type EstadoUICN = 'CR' | 'EN' | 'VU' | 'NT' | 'LC';

export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  englishName: string;
  category: 'Fauna' | 'Flora';
  isCoreProjectSpecies: boolean;
  projectSpotlightReason?: string;
  taxonomy: { kingdom: string; phylum: string; class: string; order: string; family: string; genus: string };
  endemicLevel: string;
  conservationStatus: EstadoUICN;
  region: string;
  department: string[];
  habitat: string;
  elevationRange: string;
  coordinates: { lat: number; lng: number; locationName: string };
  characteristics: string[];
  ecologicalRole: string;
  threats: string[];
  curiousFact: string;
  sources: { name: string; institution: string; year: number; citation: string }[];
  imageUrl: string;
  imageAttribution: string;
  /** Texto de "¿Por qué es especial?" de la tarjeta. */
  whySpecial: string;
}

export type Grupo = 'reptiles-anfibios' | 'primates-marsupiales' | 'aves' | 'flora' | 'crustaceos';

export interface Curiosity {
  id: string;
  speciesName: string;
  scientificName: string;
  shortHook: string;
  fullStory: string;
  imageUrl: string;
  iconType: string;
  badge: string;
  accentColor: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Fauna' | 'Flora' | 'Ecosistema';
  location: string;
  url: string;
  description: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  speciesRelated?: string;
  categoryLabel?: string;
  level?: string;
}
