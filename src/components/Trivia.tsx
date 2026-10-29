import { useState } from 'react';
import { Check, Copy, Play, RotateCcw } from 'lucide-react';
import data from '../data/trivia.json';
import type { Question } from '../data/types';
import { copyText, siteUrl } from '../lib/utils';
import QuizRunner from './QuizRunner';
import { Section, SectionHeader, btnPrimary, btnSecondary, card } from './ui';

const QUESTIONS = data as Question[];
const N = QUESTIONS.length;

function mensaje(score: number) {
  const pct = score / N;
  if (pct === 1) return '¡Perfecto! Eres un verdadero experto en biodiversidad colombiana. 🏆';
  if (pct >= 0.8) return '¡Muy bien! Sabes mucho sobre nuestras especies únicas. 🌿';
  if (pct >= 0.6) return '¡Buen trabajo! Vas por buen camino. Sigue explorando.';
  return 'Cada intento es una oportunidad para aprender. ¡Explora las especies y vuelve a intentarlo!';
}

export default function Trivia() {
  const [phase, setPhase] = useState<'inicio' | 'jugando' | 'fin'>('inicio');
  const [nombre, setNombre] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [copied, setCopied] = useState(false);

  const start = () => {
    setCopied(false);
    setRound((r) => r + 1);
    setPhase('jugando');
  };

  const share = async () => {
    const quien = nombre.trim() ? `${nombre.trim()} obtuvo` : 'Obtuve';
    const ok = await copyText(
      `${quien} ${score} de ${N} en la trivia "¿Cuánto sabes sobre Colombia?" de BioExplora Colombia 🇨🇴🌿 ¡Pon a prueba lo que sabes! ${siteUrl()}`,
    );
    setCopied(ok);
  };

  return (
    <Section id="trivia" ariaLabel="Trivia: ¿Cuánto sabes sobre Colombia?">
      <SectionHeader
        eyebrow="Juego Interactivo"
        title="¿Cuánto sabes sobre Colombia?"
        subtitle="Pon a prueba tus conocimientos sobre nuestras especies endémicas y descubre datos sorprendentes con este breve cuestionario interactivo."
      />
      <div className={`${card} mx-auto max-w-3xl p-5 sm:p-8`}>
        {phase === 'inicio' && (
          <div className="py-4 text-center">
            <p className="text-5xl" aria-hidden>
              🧠
            </p>
            <p className="mx-auto mt-3 max-w-md text-muted">{N} preguntas sobre las especies endémicas de Colombia.</p>
            <div className="mx-auto mt-6 max-w-sm text-left">
              <label htmlFor="trivia-nombre" className="text-sm font-semibold text-text">
                Tu nombre o apodo <span className="font-normal text-muted">(opcional)</span>
              </label>
              <input
                id="trivia-nombre"
                type="text"
                maxLength={40}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej.: Sofi"
                className="mt-2 h-12 w-full rounded-xl border border-line bg-surface px-4 text-text placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </div>
            <button type="button" className={`${btnPrimary} mt-6`} onClick={start}>
              <Play className="h-5 w-5" aria-hidden /> Empezar
            </button>
          </div>
        )}

        {phase === 'jugando' && (
          <QuizRunner
            key={round}
            questions={QUESTIONS}
            onFinish={(s) => {
              setScore(s);
              setPhase('fin');
            }}
          />
        )}

        {phase === 'fin' && (
          <div className="animate-fade-up py-4 text-center" aria-live="polite">
            <p className="text-sm font-semibold text-muted uppercase">
              {nombre.trim() ? `Resultado de ${nombre.trim()}` : 'Tu resultado'}
            </p>
            <p className="mt-2 font-display text-6xl font-extrabold text-ink">
              {score}/{N}
            </p>
            <p className="mx-auto mt-4 max-w-md text-lg text-text">{mensaje(score)}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" className={btnPrimary} onClick={start}>
                <RotateCcw className="h-5 w-5" aria-hidden /> Jugar de nuevo
              </button>
              <button type="button" className={btnSecondary} onClick={share}>
                {copied ? <Check className="h-5 w-5" aria-hidden /> : <Copy className="h-5 w-5" aria-hidden />}
                {copied ? '¡Texto copiado!' : 'Compartir resultado'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
