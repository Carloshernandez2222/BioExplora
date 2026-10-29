# BioExplora Colombia – Especies Endémicas y Biodiversidad

Sitio educativo de un voluntariado ambiental que da a conocer las especies endémicas de Colombia.
Sin registro, sin backend: todo funciona como sitio estático y el progreso se guarda en el navegador (localStorage).

## Cómo usarlo

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm run build     # genera la carpeta dist/ lista para publicar
npm run preview   # sirve dist/ localmente
```

La carpeta `dist/` se puede subir a cualquier hosting estático (GitHub Pages, Netlify, Vercel, etc.).
Usa rutas relativas, así que funciona también dentro de una subcarpeta.

## Asistente BioGuía IA (Gemini)

1. Copia `.env.example` como `.env` y pon tu clave en `VITE_GEMINI_API_KEY`.
2. Vuelve a ejecutar `npm run build`.

**Importante:** en un sitio estático la clave queda visible en el navegador. Restríngela por dominio
(HTTP referrer) y ponle un límite de uso en Google AI Studio / Google Cloud. Si no hay clave, el asistente
muestra un mensaje amable y el resto del sitio funciona normal.

## Editar el contenido

Toda la información viene de la versión original del sitio (AI Studio) y se conserva tal cual.

| Qué | Archivo |
| --- | --- |
| Las 20 especies (fichas completas, "¿Por qué es especial?", dato curioso) | `src/data/species.json` |
| Curiosidades de las 4 especies insignia | `src/data/curiosities.json` |
| Trivia (5 preguntas) | `src/data/trivia.json` |
| Evaluaciones oficiales (5 niveles, 58 preguntas) | `src/data/evaluations.json` |
| Insignias del voluntariado (4 insignias, 20 preguntas) | `src/data/volunteerBadges.json` |
| Galería (19 fotos) | `src/data/gallery.json` |
| Fotos | `public/images/` |

Los contadores ("Todas (20)", "Mostrando X de 20", categorías) se calculan solos a partir de `species.json`.

## Encuesta y Google Sheets

Cada respuesta se guarda **en el dispositivo** de quien la llena y, si está configurado, también se envía a una
**hoja de Google Sheets** de la dueña del proyecto. En "Resultados" se puede ver "Todos los participantes" (la hoja)
o "Este dispositivo". Para conectarlo, sigue `google-sheets/INSTRUCCIONES.md` y pon la URL en `VITE_SHEETS_URL`.

## Notas

- Sin login ni servidor propio: el progreso (evaluaciones, historial, insignias, paleta y modo oscuro) se guarda
  en el navegador de cada persona.
- La foto de portada es de Wikimedia Commons (Ensenada de Utría, Chocó); las demás son las del sitio original.
- Para que la imagen al compartir en redes (Open Graph) funcione, cambia `og:image` en `index.html` por la URL
  absoluta del sitio publicado.

## Tecnología

React 18 + TypeScript + Tailwind CSS 4 (Vite). Leaflet + OpenStreetMap, Chart.js, jsPDF, SheetJS, qrcode,
canvas-confetti y Lucide. Las librerías pesadas se cargan solo cuando se usan.
