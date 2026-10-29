import { useEffect, useRef, useState } from 'react';
import { Check, Download, Share2 } from 'lucide-react';
import { SPECIES, getSpecies, grupoDe } from '../data/catalog';
import { POSTER_FORMATS, POSTER_STYLES, drawPoster, type PosterFormat, type PosterStyle } from '../lib/poster';
import { copyText, siteUrl } from '../lib/utils';
import { Chip, SpeciesImage, btnPrimary, btnSecondary, card } from './ui';

export interface PosterRequest {
  id: string;
  nonce: number;
}

export default function PosterGenerator({ request }: { request: PosterRequest | null }) {
  const [speciesId, setSpeciesId] = useState(SPECIES[0].id);
  const [format, setFormat] = useState<PosterFormat>('post');
  const [style, setStyle] = useState<PosterStyle>('selva');
  const [status, setStatus] = useState<'' | 'copiado' | 'error' | 'listo'>('');
  const [drawing, setDrawing] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const s = getSpecies(speciesId)!;

  useEffect(() => {
    if (!request) return;
    setSpeciesId(request.id);
    listRef.current
      ?.querySelector<HTMLElement>(`[data-id="${request.id}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [request]);

  useEffect(() => {
    let alive = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDrawing(true);
    setStatus('');
    drawPoster(canvas, s, format, style)
      .catch(() => {})
      .finally(() => alive && setDrawing(false));
    return () => {
      alive = false;
    };
  }, [s, format, style]);

  const toBlob = () =>
    new Promise<Blob | null>((resolve) => {
      try {
        canvasRef.current!.toBlob((b) => resolve(b), 'image/png');
      } catch {
        resolve(null);
      }
    });
  const filename = `afiche-${s.id}-${format}.png`;

  const download = async () => {
    const blob = await toBlob();
    if (!blob) return setStatus('error');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setStatus('listo');
  };

  const share = async () => {
    const text = `${s.commonName} (${s.scientificName}) solo existe en Colombia 🇨🇴. Conócela en BioExplora Colombia:`;
    try {
      const blob = await toBlob();
      const file = blob ? new File([blob], filename, { type: 'image/png' }) : null;
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'BioExplora Colombia', text: `${text} ${siteUrl()}` });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: 'BioExplora Colombia', text, url: siteUrl() });
        return;
      }
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return;
    }
    setStatus((await copyText(siteUrl())) ? 'copiado' : 'error');
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h4 className="mb-3 font-bold text-text">1. Elige una especie</h4>
          <div
            ref={listRef}
            role="radiogroup"
            aria-label="Especie del afiche"
            className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto rounded-2xl border border-line p-2 sm:grid-cols-3"
          >
            {SPECIES.map((x) => (
              <button
                key={x.id}
                data-id={x.id}
                type="button"
                role="radio"
                aria-checked={x.id === speciesId}
                onClick={() => setSpeciesId(x.id)}
                className={`flex items-center gap-2 rounded-xl border-2 p-1.5 text-left text-xs font-medium transition ${
                  x.id === speciesId
                    ? 'border-primary bg-surface-2 text-text'
                    : 'border-transparent text-muted hover:bg-surface-2'
                }`}
              >
                <SpeciesImage
                  src={x.imageUrl}
                  alt=""
                  grupo={grupoDe(x)}
                  showCredit={false}
                  className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-2"
                />
                <span className="line-clamp-2">{x.commonName}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-text">2. Elige el formato</h4>
          <div className="flex flex-wrap gap-2">
            {POSTER_FORMATS.map((f) => (
              <Chip key={f.id} active={format === f.id} onClick={() => setFormat(f.id)}>
                {f.label}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-text">3. Elige el estilo</h4>
          <div className="flex flex-wrap gap-2">
            {POSTER_STYLES.map((st) => (
              <Chip key={st.id} active={style === st.id} onClick={() => setStyle(st.id)}>
                <span
                  className="h-4 w-4 rounded-full border border-black/10"
                  style={{ background: `linear-gradient(135deg, ${st.bg[0]}, ${st.bg[1]})` }}
                  aria-hidden
                />
                {st.label}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" className={btnPrimary} onClick={download} disabled={drawing}>
            <Download className="h-5 w-5" aria-hidden /> Descargar imagen
          </button>
          <button type="button" className={btnSecondary} onClick={share} disabled={drawing}>
            {status === 'copiado' ? (
              <Check className="h-5 w-5" aria-hidden />
            ) : (
              <Share2 className="h-5 w-5" aria-hidden />
            )}
            {status === 'copiado' ? '¡Enlace copiado!' : 'Compartir'}
          </button>
        </div>
        <p className="min-h-5 text-sm text-muted" aria-live="polite">
          {status === 'listo' && 'Imagen descargada. ¡Compártela en tus redes!'}
          {status === 'error' && 'No pudimos generar la imagen. Revisa tu conexión e inténtalo de nuevo.'}
        </p>
      </div>

      <div className={`${card} flex items-center justify-center bg-surface-2 p-4`}>
        <div className="relative w-full" style={{ maxWidth: format === 'post' ? 520 : 320 }}>
          <canvas
            ref={canvasRef}
            className="h-auto w-full rounded-2xl shadow-xl"
            role="img"
            aria-label={`Vista previa del afiche de ${s.commonName}`}
          />
          {drawing && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30 text-sm font-semibold text-white">
              Preparando vista previa…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
