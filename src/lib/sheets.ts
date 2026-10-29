// Conexión opcional con Google Sheets (ver google-sheets/INSTRUCCIONES.md).
// Sin VITE_SHEETS_URL, la encuesta funciona solo con el almacenamiento del navegador.
export const SHEETS_URL = import.meta.env.VITE_SHEETS_URL?.trim() ?? '';

/** Envía una respuesta a la hoja. Devuelve false si no se pudo enviar. */
export async function sendToSheet(data: Record<string, string>): Promise<boolean> {
  if (!SHEETS_URL) return false;
  try {
    // text/plain evita la consulta previa de CORS, que Apps Script no admite;
    // la respuesta es opaca, así que solo sabemos si la red falló.
    await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
    });
    return true;
  } catch {
    return false;
  }
}

/** Lee las respuestas públicas (sin nombre ni comentario) de la hoja. */
export async function fetchFromSheet<T>(): Promise<T[]> {
  const res = await fetch(SHEETS_URL);
  if (!res.ok) throw new Error(`http-${res.status}`);
  const json = await res.json();
  if (!json?.ok || !Array.isArray(json.data)) throw new Error('formato');
  return json.data as T[];
}
