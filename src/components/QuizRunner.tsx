import { useEffect, useRef, useState } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';
import type { Question } from '../data/types';
import { btnPrimary } from './ui';

/** Muestra las preguntas una a una: elegir opción → "Confirmar Respuesta" → explicación → "Siguiente". */
export default function QuizRunner({
  questions,
  onFinish,
}: {
  questions: Question[];
  onFinish: (correct: number) => void;
}) {
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const cur = questions[i];
  const total = questions.length;
  const label = cur.speciesRelated ?? cur.categoryLabel;

  useEffect(() => {
    if (confirmed) feedbackRef.current?.focus();
  }, [confirmed]);

  const confirm = () => {
    if (selected === null || confirmed) return;
    setConfirmed(true);
    if (selected === cur.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (i + 1 >= total) {
      onFinish(score);
      return;
    }
    setI(i + 1);
    setSelected(null);
    setConfirmed(false);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const done = i + (confirmed ? 1 : 0);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-muted">
        <span>
          Pregunta {i + 1} de {total}
        </span>
        <span>Aciertos: {score}</span>
      </div>
      <div
        className="mb-6 h-2.5 w-full overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label="Progreso"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-teal transition-all duration-500"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>

      {label && <p className="mb-2 text-xs font-semibold tracking-wide text-ink uppercase">{label}</p>}
      <h3
        ref={headingRef}
        tabIndex={-1}
        className="mb-5 text-xl leading-snug font-bold text-text outline-none sm:text-2xl"
      >
        {cur.question}
      </h3>

      <div role="radiogroup" aria-label="Opciones de respuesta" className="grid gap-3">
        {cur.options.map((opt, idx) => {
          const isCorrect = idx === cur.correctIndex;
          const isSel = idx === selected;
          let cls = isSel
            ? 'border-primary bg-surface-2'
            : 'border-line bg-surface hover:border-primary hover:bg-surface-2';
          if (confirmed && isCorrect) cls = 'border-[#15803D] bg-[#15803D]/12 dark:bg-[#15803D]/25';
          else if (confirmed && isSel) cls = 'border-[#B91C1C] bg-[#B91C1C]/10 dark:bg-[#B91C1C]/25';
          else if (confirmed) cls = 'border-line bg-surface opacity-60';
          return (
            <button
              key={idx}
              type="button"
              role="radio"
              aria-checked={isSel}
              onClick={() => !confirmed && setSelected(idx)}
              disabled={confirmed}
              className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-medium text-text transition ${cls}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isSel && !confirmed ? 'bg-primary text-on-primary' : 'bg-surface-2 text-ink'
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1">{opt}</span>
              {confirmed && isCorrect && (
                <CircleCheck className="h-6 w-6 shrink-0 text-[#15803D]" aria-label="Correcta" />
              )}
              {confirmed && isSel && !isCorrect && (
                <CircleX className="h-6 w-6 shrink-0 text-[#B91C1C]" aria-label="Incorrecta" />
              )}
            </button>
          );
        })}
      </div>

      {!confirmed ? (
        <button
          type="button"
          className={`${btnPrimary} mt-5 w-full sm:w-auto`}
          disabled={selected === null}
          onClick={confirm}
        >
          Confirmar Respuesta
        </button>
      ) : (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          aria-live="polite"
          className="animate-fade-up mt-5 rounded-2xl bg-surface-2 p-4 outline-none"
        >
          <p
            className={`font-bold ${
              selected === cur.correctIndex
                ? 'text-[#15803D] dark:text-[#4ADE80]'
                : 'text-[#B91C1C] dark:text-[#F87171]'
            }`}
          >
            {selected === cur.correctIndex ? '¡Correcto! 🎉' : 'No es correcto'}
          </p>
          <p className="mt-1 text-text">{cur.explanation}</p>
          <button type="button" className={`${btnPrimary} mt-4 w-full sm:w-auto`} onClick={next}>
            {i + 1 >= total ? 'Ver resultado' : 'Siguiente'}
          </button>
        </div>
      )}
    </div>
  );
}
