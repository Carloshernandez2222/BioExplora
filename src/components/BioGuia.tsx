import { Fragment, useEffect, useRef, useState } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { GEMINI_KEY, askGemini, type ChatMsg } from '../lib/gemini';

const SUGERIDAS = ['¿Qué es una especie endémica?', '¿Cuál es la rana más venenosa?', '¿Cómo puedo ayudar?'];
const BIENVENIDA = '¡Hola! Soy BioGuía 🌿. Pregúntame sobre las especies endémicas y la biodiversidad de Colombia.';

/** Formato mínimo y seguro: *texto* en cursiva y saltos de línea. */
function Formatted({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .split(/(\*[^*]+\*)/g)
            .map((part, j) =>
              /^\*[^*]+\*$/.test(part) ? <em key={j}>{part.slice(1, -1)}</em> : <Fragment key={j}>{part}</Fragment>,
            )}
        </Fragment>
      ))}
    </>
  );
}

export default function BioGuia() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, loading, error]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setError('');
    setInput('');
    const history: ChatMsg[] = [...msgs, { role: 'user', text: q }];
    setMsgs(history);
    if (!GEMINI_KEY) {
      setError(
        'El asistente aún no está conectado en esta versión del sitio. Mientras tanto, explora las fichas de las especies: ¡tienen mucha información!',
      );
      return;
    }
    setLoading(true);
    abortRef.current = new AbortController();
    try {
      const answer = await askGemini(history, abortRef.current.signal);
      setMsgs((m) => [...m, { role: 'model', text: answer }]);
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return;
      setError('Uy, no pude responder en este momento. Revisa tu conexión e inténtalo de nuevo en un ratico. 🌱');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-4 z-[60] inline-flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-on-primary shadow-2xl transition hover:bg-primary-strong sm:right-6 sm:bottom-6 sm:h-auto sm:min-h-14 sm:w-auto sm:justify-start sm:py-3 sm:pr-5 sm:pl-4"
          aria-label="Abrir BioGuía IA – Asistente de Biodiversidad"
        >
          <Bot className="h-6 w-6" aria-hidden />
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm">BioGuía IA</span>
            <span className="hidden text-xs font-normal opacity-85 sm:block">Asistente de Biodiversidad</span>
          </span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="bioguia-titulo"
          className="animate-fade-up fixed inset-x-0 bottom-0 z-[75] flex h-[85svh] flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[600px] sm:max-h-[calc(100svh-6rem)] sm:w-[400px] sm:rounded-3xl"
        >
          <header className="flex items-center gap-3 bg-primary p-4 text-on-primary">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <Bot className="h-6 w-6" aria-hidden />
            </span>
            <div className="flex-1">
              <h2 id="bioguia-titulo" className="font-bold">
                BioGuía IA
              </h2>
              <p className="text-xs opacity-85">Asistente de Biodiversidad</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/15"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface-2 px-4 py-2.5 text-sm text-text">
              {BIENVENIDA}
            </div>
            {msgs.length === 0 && (
              <div className="flex flex-col items-start gap-2 pt-1">
                {SUGERIDAS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-primary px-4 py-2 text-left text-sm font-medium text-ink hover:bg-surface-2"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === 'user'
                    ? 'ml-auto rounded-tr-sm bg-primary text-on-primary'
                    : 'rounded-tl-sm bg-surface-2 text-text'
                }`}
              >
                <Formatted text={m.text} />
              </div>
            ))}
            {loading && (
              <div className="w-fit rounded-2xl rounded-tl-sm bg-surface-2 px-4 py-3 text-sm text-muted">
                BioGuía está escribiendo…
              </div>
            )}
            {error && (
              <div
                role="status"
                className="max-w-[85%] rounded-2xl rounded-tl-sm border border-gold bg-gold/10 px-4 py-2.5 text-sm text-text"
              >
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-line p-3"
          >
            <label htmlFor="bioguia-input" className="sr-only">
              Escribe tu pregunta
            </label>
            <input
              ref={inputRef}
              id="bioguia-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={400}
              placeholder="Escribe tu pregunta…"
              autoComplete="off"
              className="h-12 flex-1 rounded-full border border-line bg-surface px-4 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Enviar pregunta"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary disabled:opacity-50"
            >
              <Send className="h-5 w-5" aria-hidden />
            </button>
          </form>
          <p className="px-4 pb-3 text-center text-[11px] text-muted">
            Las respuestas las genera una IA y pueden tener errores. Verifica los datos importantes.
          </p>
        </div>
      )}
    </>
  );
}
