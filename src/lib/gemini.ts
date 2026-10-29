import { ESTADOS, SPECIES } from '../data/catalog';

export interface ChatMsg {
  role: 'user' | 'model';
  text: string;
}

const SYSTEM = `Eres "BioGuía IA", el asistente de BioExplora Colombia, un sitio educativo de un voluntariado ambiental sobre las especies endémicas de Colombia.
Reglas:
- Responde siempre en español de Colombia, de forma breve (máximo 120 palabras), amable, clara y educativa. Usa frases cortas.
- Habla solo de biodiversidad, especies endémicas, ecosistemas y conservación en Colombia.
- Si no estás seguro de un dato, dilo con honestidad y sugiere consultar SiB Colombia, el Instituto Humboldt o la Lista Roja de la UICN. No inventes cifras.
- Si te preguntan por otro tema, redirige amablemente la conversación hacia la biodiversidad colombiana.
- Escribe los nombres científicos entre asteriscos simples, por ejemplo *Phyllobates terribilis*.
- Usa como referencia principal la información de las especies del sitio:
${SPECIES.map(
  (s) =>
    `• ${s.commonName} (*${s.scientificName}*) – ${s.region} – ${ESTADOS[s.conservationStatus].label} – ${s.coordinates.locationName}. ${s.whySpecial} Dato curioso: ${s.curiousFact}`,
).join('\n')}`;

export const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim() ?? '';
const MODEL = import.meta.env.VITE_GEMINI_MODEL?.trim() || 'gemini-2.5-flash';

export async function askGemini(history: ChatMsg[], signal?: AbortSignal): Promise<string> {
  if (!GEMINI_KEY) throw new Error('sin-clave');
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,
    {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: history.slice(-12).map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
      }),
    },
  );
  if (!res.ok) throw new Error(`http-${res.status}`);
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? '')
    .join('')
    .trim();
  if (!text) throw new Error('vacio');
  return text;
}
