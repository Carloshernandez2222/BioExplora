import type { Species } from '../data/types';
import { ESTADOS } from '../data/catalog';

export type PosterFormat = 'post' | 'historia';
export type PosterStyle = 'selva' | 'atardecer' | 'claro';

export const POSTER_FORMATS: { id: PosterFormat; label: string; w: number; h: number }[] = [
  { id: 'post', label: 'Post 1080×1080', w: 1080, h: 1080 },
  { id: 'historia', label: 'Historia 1080×1920', w: 1080, h: 1920 },
];

export const POSTER_STYLES: {
  id: PosterStyle;
  label: string;
  bg: [string, string];
  text: string;
  sub: string;
  accent: string;
}[] = [
  { id: 'selva', label: 'Selva', bg: ['#0F3D29', '#1B5E3F'], text: '#FFFFFF', sub: '#CDEBD9', accent: '#2ECC71' },
  {
    id: 'atardecer',
    label: 'Atardecer',
    bg: ['#7A2410', '#C2501F'],
    text: '#FFFFFF',
    sub: '#FFE3D3',
    accent: '#F5A623',
  },
  { id: 'claro', label: 'Claro', bg: ['#F7FAF8', '#E3F1E8'], text: '#11271C', sub: '#3E5548', accent: '#1B5E3F' },
];

const ESTADO_COLOR: Record<string, [string, string]> = {
  CR: ['#B71C1C', '#FFFFFF'],
  EN: ['#C2410C', '#FFFFFF'],
  VU: ['#FACC15', '#422006'],
  NT: ['#1D4ED8', '#FFFFFF'],
  LC: ['#15803D', '#FFFFFF'],
  NE: ['#4B5563', '#FFFFFF'],
};

const cache = new Map<string, Promise<HTMLImageElement | null>>();
export function loadImage(src: string) {
  if (!cache.has(src)) {
    cache.set(
      src,
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      }),
    );
  }
  return cache.get(src)!;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const cut = lines.slice(0, maxLines);
    let last = cut[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.includes(' '))
      last = last.slice(0, last.lastIndexOf(' '));
    cut[maxLines - 1] = `${last}…`;
    return cut;
  }
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function pill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, bg: string, fg: string, size: number) {
  ctx.font = `700 ${size}px Poppins, Inter, sans-serif`;
  const padX = size * 0.9;
  const h = size * 2;
  const w = ctx.measureText(text).width + padX * 2;
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, y + h / 2 + 1);
  ctx.textBaseline = 'alphabetic';
  return w;
}

function leaf(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, bg: string, fg: string) {
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, s, s, s * 0.25);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.72, y + s * 0.25);
  ctx.bezierCurveTo(x + s * 0.2, y + s * 0.25, x + s * 0.2, y + s * 0.7, x + s * 0.3, y + s * 0.78);
  ctx.bezierCurveTo(x + s * 0.7, y + s * 0.8, x + s * 0.8, y + s * 0.5, x + s * 0.72, y + s * 0.25);
  ctx.fill();
}

export async function drawPoster(canvas: HTMLCanvasElement, s: Species, format: PosterFormat, styleId: PosterStyle) {
  const f = POSTER_FORMATS.find((x) => x.id === format)!;
  const st = POSTER_STYLES.find((x) => x.id === styleId)!;
  canvas.width = f.w;
  canvas.height = f.h;
  const ctx = canvas.getContext('2d')!;
  try {
    await document.fonts?.ready;
  } catch {
    /* sin fuentes web: se usa la del sistema */
  }
  const img = s.imageUrl ? await loadImage(s.imageUrl) : null;
  const W = f.w;
  const H = f.h;
  const story = format === 'historia';
  const photoH = story ? 960 : 470;
  const pad = 72;

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, st.bg[0]);
  g.addColorStop(1, st.bg[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // foto
  if (img) {
    const scale = Math.max(W / img.width, photoH / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, photoH);
    ctx.clip();
    ctx.drawImage(img, (W - dw) / 2, (photoH - dh) / 2, dw, dh);
    ctx.restore();
  } else {
    ctx.fillStyle = st.accent;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, 0, W, photoH);
    ctx.globalAlpha = 1;
  }
  const fade = ctx.createLinearGradient(0, photoH - 260, 0, photoH);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, st.bg[0]);
  ctx.fillStyle = fade;
  ctx.fillRect(0, photoH - 260, W, 262);

  // crédito de la foto
  ctx.font = '400 20px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'right';
  if (s.imageAttribution) ctx.fillText(`Foto: ${s.imageAttribution}`, W - 24, 36);
  ctx.textAlign = 'left';

  // sello
  pill(
    ctx,
    'Solo existe en Colombia 🇨🇴',
    pad,
    story ? 80 : 56,
    st.accent,
    styleId === 'claro' ? '#FFFFFF' : '#0B2A1D',
    story ? 38 : 30,
  );

  let y = photoH + (story ? 30 : 10);
  const [eb, ef] = ESTADO_COLOR[s.conservationStatus];
  pill(ctx, ESTADOS[s.conservationStatus].label, pad, y, eb, ef, story ? 30 : 24);
  y += story ? 135 : 112;

  const nameSize = story ? 92 : 68;
  ctx.font = `800 ${nameSize}px Poppins, Inter, sans-serif`;
  ctx.fillStyle = st.text;
  for (const line of wrap(ctx, s.commonName, W - pad * 2, 2)) {
    ctx.fillText(line, pad, y);
    y += nameSize * 1.08;
  }
  ctx.font = `italic 400 ${story ? 44 : 34}px Inter, sans-serif`;
  ctx.fillStyle = st.sub;
  ctx.fillText(s.scientificName, pad, y + (story ? 4 : 0));
  y += story ? 100 : 66;

  const factSize = story ? 42 : 30;
  ctx.font = `700 ${factSize}px Poppins, Inter, sans-serif`;
  ctx.fillStyle = st.accent;
  ctx.fillText('💡 Dato curioso', pad, y);
  y += factSize * 1.5;
  ctx.font = `400 ${factSize}px Inter, sans-serif`;
  ctx.fillStyle = st.text;
  const footerY = H - (story ? 150 : 100);
  const maxLines = Math.max(1, Math.floor((footerY - y - 20) / (factSize * 1.35)));
  for (const line of wrap(ctx, s.curiousFact, W - pad * 2, Math.min(maxLines, story ? 6 : 3))) {
    ctx.fillText(line, pad, y);
    y += factSize * 1.35;
  }

  // logo
  const ls = story ? 64 : 52;
  const ly = H - (story ? 110 : 84);
  leaf(ctx, pad, ly, ls, styleId === 'claro' ? '#1B5E3F' : 'rgba(255,255,255,0.15)', '#2ECC71');
  ctx.font = `800 ${story ? 36 : 30}px Poppins, Inter, sans-serif`;
  ctx.fillStyle = st.text;
  ctx.textBaseline = 'middle';
  ctx.fillText('BioExplora Colombia', pad + ls + 18, ly + ls / 2);
  ctx.textBaseline = 'alphabetic';
}
