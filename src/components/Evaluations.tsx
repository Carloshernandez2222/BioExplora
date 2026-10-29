import { useState } from 'react';
import { ArrowLeft, Award, Download, History, Lock, Medal, Play, RotateCcw, ShieldCheck } from 'lucide-react';
import evalData from '../data/evaluations.json';
import badgeData from '../data/volunteerBadges.json';
import type { Question } from '../data/types';
import { celebrate } from '../lib/celebrate';
import { load, save } from '../lib/storage';
import { randomCode } from '../lib/utils';
import QuizRunner from './QuizRunner';
import { Section, SectionHeader, btnPrimary, btnSecondary, card } from './ui';

interface OfficialLevel {
  id: string;
  level: string;
  levelName: string;
  name: string;
  title: string;
  description: string;
  focusArea: string;
  totalQuestions: number;
  minScorePercent: number;
  badgeColor: string;
  badgeBorder: string;
  badgeIconBg: string;
}

interface VolunteerBadge {
  id: string;
  level: string;
  levelNumber: number;
  levelLabel: string;
  difficultyLabel: string;
  name: string;
  description: string;
  criteria: string;
  totalQuestions: number;
  minCorrectAnswers: number;
  minScorePercent: number;
}

const LEVELS = evalData.levels as OfficialLevel[];
const LEVEL_QUESTIONS = evalData.questions as Record<string, Question[]>;
const BADGES = badgeData.badges as VolunteerBadge[];
const BADGE_QUESTIONS = badgeData.questions as Record<string, Question[]>;

interface Attempt {
  level: string;
  fecha: string;
  correct: number;
  total: number;
  porcentaje: number;
  aprobado: boolean;
  codigo?: string;
}
interface OfficialProgress {
  history: Attempt[];
}
interface VolunteerProgress {
  passed: string[];
}

const pct = (c: number, t: number) => Math.round((c / t) * 100);

function MedalBadge({ level, earned, size = 'md' }: { level: OfficialLevel; earned: boolean; size?: 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-28 w-28' : 'h-20 w-20';
  return (
    <span
      className={`flex shrink-0 flex-col items-center justify-center rounded-full border-4 text-center text-white ${dim} ${
        earned ? 'shadow-lg' : 'grayscale'
      }`}
      style={{ background: level.badgeIconBg, borderColor: level.badgeBorder, opacity: earned ? 1 : 0.45 }}
      aria-hidden
    >
      <span className="text-[9px] font-semibold tracking-wider opacity-90">BIOEXPLORA</span>
      <span className="font-display text-xs font-extrabold tracking-wide">{level.level.toUpperCase()}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Evaluaciones oficiales (5 niveles)                                 */
/* ------------------------------------------------------------------ */

type OfficialView = 'insignias' | 'presentar' | 'historial';
type OfficialPhase =
  | { kind: 'idle' }
  | { kind: 'playing'; level: OfficialLevel }
  | { kind: 'result'; attempt: Attempt };

function OfficialEvaluations() {
  const [progress, setProgress] = useState<OfficialProgress>(() =>
    load<OfficialProgress>('evaluaciones', { history: [] }),
  );
  const [view, setView] = useState<OfficialView>('insignias');
  const [phase, setPhase] = useState<OfficialPhase>({ kind: 'idle' });
  const [nombre, setNombre] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const bestPass = (lv: string) => progress.history.find((a) => a.level === lv && a.aprobado);
  const isPassed = (lv: string) => !!bestPass(lv);
  const isUnlocked = (idx: number) => idx === 0 || isPassed(LEVELS[idx - 1].level);
  const passedCount = LEVELS.filter((l) => isPassed(l.level)).length;

  const start = (level: OfficialLevel) => {
    setView('presentar');
    setPhase({ kind: 'playing', level });
  };

  const finish = (level: OfficialLevel, correct: number) => {
    const porcentaje = pct(correct, level.totalQuestions);
    const aprobado = porcentaje >= level.minScorePercent;
    const attempt: Attempt = {
      level: level.level,
      fecha: new Date().toISOString(),
      correct,
      total: level.totalQuestions,
      porcentaje,
      aprobado,
      codigo: aprobado ? randomCode() : undefined,
    };
    const next = { history: [attempt, ...progress.history] };
    setProgress(next);
    save('evaluaciones', next);
    if (aprobado) celebrate();
    setPdfError(false);
    setPhase({ kind: 'result', attempt });
  };

  const diploma = async (attempt: Attempt) => {
    const idx = LEVELS.findIndex((l) => l.level === attempt.level);
    const level = LEVELS[idx];
    setPdfBusy(true);
    setPdfError(false);
    try {
      const { downloadDiploma } = await import('../lib/diploma');
      await downloadDiploma({
        nombre,
        level: { numero: idx + 1, etiqueta: level.levelName, titulo: level.title, color: level.badgeColor },
        porcentaje: attempt.porcentaje,
        codigo: attempt.codigo ?? randomCode(),
        fecha: attempt.fecha,
      });
    } catch {
      setPdfError(true);
    } finally {
      setPdfBusy(false);
    }
  };

  const reset = () => {
    const empty = { history: [] };
    setProgress(empty);
    save('evaluaciones', empty);
    setConfirmReset(false);
    setPhase({ kind: 'idle' });
  };

  const nameField = (
    <div className="text-left">
      <label htmlFor="nombre-diploma" className="block text-sm font-semibold text-text">
        Nombre para el diploma <span className="font-normal text-muted">(opcional)</span>
      </label>
      <input
        id="nombre-diploma"
        type="text"
        maxLength={60}
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Escribe tu nombre"
        className="mt-2 h-12 w-full rounded-xl border border-line bg-surface px-4 text-text placeholder:text-muted focus:border-primary focus:outline-none"
      />
      <p className="mt-1 text-xs text-muted">Tu nombre no se guarda: solo se usa para crear el PDF.</p>
    </div>
  );

  const tabs: { id: OfficialView; label: string; icon: typeof Medal }[] = [
    { id: 'insignias', label: `Mis Insignias y Diplomas (${passedCount}/${LEVELS.length})`, icon: Medal },
    { id: 'presentar', label: 'Presentar Evaluación Oficial', icon: Play },
    { id: 'historial', label: `Historial Oficial (${progress.history.length})`, icon: History },
  ];

  return (
    <div className="space-y-8">
      <p className="flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-3 text-sm font-medium text-text">
        <ShieldCheck className="h-5 w-5 shrink-0 text-ink" aria-hidden /> Tu progreso se guarda automáticamente en este
        dispositivo.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={view === id}
            onClick={() => {
              setView(id);
              if (phase.kind !== 'playing') setPhase({ kind: 'idle' });
            }}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition ${
              view === id
                ? 'border-primary bg-primary text-on-primary'
                : 'border-line bg-surface text-text hover:border-primary'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden /> {label}
          </button>
        ))}
      </div>

      {/* Evaluación en curso o resultado */}
      {phase.kind === 'playing' && (
        <div className={`${card} p-5 sm:p-8`}>
          <button
            type="button"
            onClick={() => setPhase({ kind: 'idle' })}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Salir de la evaluación
          </button>
          <p className="mb-4 font-display text-lg font-bold text-text">
            {phase.level.levelName.toUpperCase()} – {phase.level.title}
          </p>
          <QuizRunner questions={LEVEL_QUESTIONS[phase.level.level]} onFinish={(c) => finish(phase.level, c)} />
        </div>
      )}

      {phase.kind === 'result' &&
        (() => {
          const { attempt } = phase;
          const idx = LEVELS.findIndex((l) => l.level === attempt.level);
          const level = LEVELS[idx];
          const nextLevel = LEVELS[idx + 1];
          return (
            <div className={`${card} animate-fade-up p-5 text-center sm:p-8`} aria-live="polite">
              {attempt.aprobado ? (
                <>
                  <div className="animate-pop mx-auto w-fit">
                    <MedalBadge level={level} earned size="lg" />
                  </div>
                  <h3 className="mt-4 text-2xl font-extrabold text-text">¡Medalla desbloqueada!</h3>
                  <p className="mt-1 font-semibold text-ink">
                    {level.levelName} · {level.title}
                  </p>
                  <p className="mt-2 text-muted">
                    Acertaste {attempt.correct} de {attempt.total} ({attempt.porcentaje} %). Mínimo requerido:{' '}
                    {level.minScorePercent} %.
                  </p>
                  <div className="mx-auto mt-6 max-w-md space-y-3">
                    {nameField}
                    <button
                      type="button"
                      className={`${btnPrimary} w-full`}
                      onClick={() => diploma(attempt)}
                      disabled={pdfBusy}
                    >
                      <Download className="h-5 w-5" aria-hidden /> {pdfBusy ? 'Generando…' : 'Descargar diploma (PDF)'}
                    </button>
                    {pdfError && (
                      <p className="text-sm text-[#B91C1C] dark:text-[#F87171]" role="alert">
                        No pudimos generar el diploma. Inténtalo de nuevo.
                      </p>
                    )}
                    <p className="text-xs text-muted">Código de verificación: {attempt.codigo}</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-5xl" aria-hidden>
                    🌱
                  </p>
                  <h3 className="mt-3 text-2xl font-extrabold text-text">¡Casi lo logras!</h3>
                  <p className="mt-2 text-muted">
                    Acertaste {attempt.correct} de {attempt.total} ({attempt.porcentaje} %). Para aprobar necesitas{' '}
                    {level.minScorePercent} %.
                  </p>
                </>
              )}
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                {attempt.aprobado && nextLevel && (
                  <button type="button" className={btnPrimary} onClick={() => start(nextLevel)}>
                    <Play className="h-5 w-5" aria-hidden /> Presentar {nextLevel.levelName}
                  </button>
                )}
                {!attempt.aprobado && (
                  <button type="button" className={btnPrimary} onClick={() => start(level)}>
                    <RotateCcw className="h-5 w-5" aria-hidden /> Intentar de nuevo
                  </button>
                )}
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => {
                    setPhase({ kind: 'idle' });
                    setView('insignias');
                  }}
                >
                  Ver mis insignias
                </button>
              </div>
            </div>
          );
        })()}

      {phase.kind === 'idle' && view === 'insignias' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LEVELS.map((l, idx) => {
              const unlocked = isUnlocked(idx);
              const pass = bestPass(l.level);
              const estado = pass ? 'APROBADA' : unlocked ? 'EN PROGRESO' : 'BLOQUEADA';
              return (
                <article key={l.id} className={`${card} flex flex-col p-5 ${unlocked ? '' : 'opacity-80'}`}>
                  <div className="flex items-center gap-4">
                    <MedalBadge level={l} earned={!!pass} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-muted">
                        {estado} {pass ? `· ${pass.porcentaje} %` : ''}
                      </p>
                      <p className="text-xs font-bold tracking-wide uppercase" style={{ color: l.badgeColor }}>
                        {l.levelName}
                      </p>
                      <h4 className="leading-tight font-bold text-text">{l.title}</h4>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted">{l.description}</p>
                  <p className="mt-2 text-sm font-medium text-text">
                    Min. {l.minScorePercent}% aciertos ({l.totalQuestions} preguntas)
                  </p>
                  <div className="mt-auto pt-4">
                    {pass ? (
                      <div className="space-y-2">
                        <button
                          type="button"
                          className={`${btnPrimary} w-full`}
                          onClick={() => setPhase({ kind: 'result', attempt: pass })}
                        >
                          <Download className="h-5 w-5" aria-hidden /> Ver diploma
                        </button>
                        <button type="button" className={`${btnSecondary} w-full`} onClick={() => start(l)}>
                          Presentar de nuevo
                        </button>
                      </div>
                    ) : unlocked ? (
                      <button type="button" className={`${btnPrimary} w-full`} onClick={() => start(l)}>
                        <Play className="h-5 w-5" aria-hidden /> Presentar Examen
                      </button>
                    ) : (
                      <p className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-surface-2 px-4 text-sm font-medium text-muted">
                        <Lock className="h-4 w-4" aria-hidden /> Supera{' '}
                        {LEVELS[idx - 1].level.charAt(0).toUpperCase() + LEVELS[idx - 1].level.slice(1)}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="mb-3 text-left text-lg font-bold text-text">
                Reglamento y Requisitos para el Desbloqueo de Insignias
              </caption>
              <thead>
                <tr className="border-b border-line text-xs text-muted uppercase">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Nivel
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Enfoque pedagógico
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Preguntas
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Mínimo aprobatorio
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Reconocimiento
                  </th>
                </tr>
              </thead>
              <tbody>
                {LEVELS.map((l) => (
                  <tr key={l.id} className="border-b border-line text-text">
                    <td className="py-2.5 pr-3 font-semibold">{l.levelName}</td>
                    <td className="py-2.5 pr-3">{l.focusArea}</td>
                    <td className="py-2.5 pr-3">{l.totalQuestions}</td>
                    <td className="py-2.5 pr-3">{l.minScorePercent}%</td>
                    <td className="py-2.5">Medalla + Diploma Verificable</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                disabled={progress.history.length === 0}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-text disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" aria-hidden /> Reiniciar progreso
              </button>
            ) : (
              <div
                role="alertdialog"
                aria-label="Confirmar reinicio"
                className="flex flex-wrap items-center gap-2 rounded-2xl bg-surface-2 p-2 pl-4"
              >
                <span className="text-sm font-medium text-text">¿Seguro? Perderás tus medallas e historial.</span>
                <button
                  type="button"
                  onClick={reset}
                  className="min-h-10 rounded-full bg-[#B91C1C] px-4 text-sm font-semibold text-white"
                >
                  Sí, reiniciar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-10 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-text"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {phase.kind === 'idle' && view === 'presentar' && (
        <div className="grid gap-3">
          {LEVELS.map((l, idx) => {
            const unlocked = isUnlocked(idx);
            return (
              <div key={l.id} className={`${card} flex flex-col gap-3 p-4 sm:flex-row sm:items-center`}>
                <MedalBadge level={l} earned={isPassed(l.level)} />
                <div className="flex-1">
                  <p className="text-xs font-bold tracking-wide uppercase" style={{ color: l.badgeColor }}>
                    {l.levelName}
                  </p>
                  <p className="font-bold text-text">{l.title}</p>
                  <p className="text-sm text-muted">
                    {l.totalQuestions} preguntas · mínimo {l.minScorePercent}%
                  </p>
                </div>
                {unlocked ? (
                  <button type="button" className={btnPrimary} onClick={() => start(l)}>
                    <Play className="h-5 w-5" aria-hidden /> Presentar Examen
                  </button>
                ) : (
                  <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-2 px-4 text-sm font-medium text-muted">
                    <Lock className="h-4 w-4" aria-hidden /> Bloqueada
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {phase.kind === 'idle' && view === 'historial' && (
        <div className="overflow-x-auto">
          {progress.history.length === 0 ? (
            <p className="py-8 text-center text-muted">Aún no has presentado evaluaciones en este dispositivo.</p>
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">Historial de evaluaciones</caption>
              <thead>
                <tr className="border-b border-line text-xs text-muted uppercase">
                  <th scope="col" className="py-2 pr-3">
                    Fecha
                  </th>
                  <th scope="col" className="py-2 pr-3">
                    Nivel
                  </th>
                  <th scope="col" className="py-2 pr-3">
                    Aciertos
                  </th>
                  <th scope="col" className="py-2 pr-3">
                    Resultado
                  </th>
                  <th scope="col" className="py-2">
                    Código
                  </th>
                </tr>
              </thead>
              <tbody>
                {progress.history.map((a) => (
                  <tr key={a.fecha} className="border-b border-line text-text">
                    <td className="py-2.5 pr-3">{new Date(a.fecha).toLocaleString('es-CO')}</td>
                    <td className="py-2.5 pr-3">{LEVELS.find((l) => l.level === a.level)?.levelName}</td>
                    <td className="py-2.5 pr-3">
                      {a.correct}/{a.total} ({a.porcentaje}%)
                    </td>
                    <td
                      className={`py-2.5 pr-3 font-semibold ${a.aprobado ? 'text-[#15803D] dark:text-[#4ADE80]' : 'text-muted'}`}
                    >
                      {a.aprobado ? 'Aprobada' : 'No aprobada'}
                    </td>
                    <td className="py-2.5 font-mono text-xs">{a.codigo ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4 Insignias del Voluntariado Ambiental                             */
/* ------------------------------------------------------------------ */

function VolunteerBadges() {
  const [progress, setProgress] = useState<VolunteerProgress>(() =>
    load<VolunteerProgress>('insignias-voluntariado', { passed: [] }),
  );
  const [playing, setPlaying] = useState<VolunteerBadge | null>(null);
  const [result, setResult] = useState<{ badge: VolunteerBadge; correct: number } | null>(null);

  const isPassed = (b: VolunteerBadge) => progress.passed.includes(b.level);
  const isUnlocked = (idx: number) => idx === 0 || isPassed(BADGES[idx - 1]);
  const count = BADGES.filter(isPassed).length;

  const finish = (badge: VolunteerBadge, correct: number) => {
    setPlaying(null);
    if (correct >= badge.minCorrectAnswers) {
      if (!isPassed(badge)) {
        const next = { passed: [...progress.passed, badge.level] };
        setProgress(next);
        save('insignias-voluntariado', next);
      }
      celebrate();
    }
    setResult({ badge, correct });
  };

  if (playing)
    return (
      <div className={`${card} p-5 sm:p-8`}>
        <button
          type="button"
          onClick={() => setPlaying(null)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a las insignias
        </button>
        <p className="mb-4 font-display text-lg font-bold text-text">{playing.name}</p>
        <QuizRunner questions={BADGE_QUESTIONS[playing.level]} onFinish={(c) => finish(playing, c)} />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-ink">
          Reconocimientos al Mérito Ecológico · {count} de {BADGES.length} desbloqueadas
        </p>
        <h3 className="mt-2 text-2xl font-extrabold text-text">{BADGES.length} Insignias del Voluntariado Ambiental</h3>
        <p className="mx-auto mt-2 max-w-3xl text-muted">
          Todas las insignias están protegidas con bloqueo progresivo: cada una solo se desbloquea superando un quiz de
          5 preguntas sobre nuestras especies endémicas investigadas y el concepto de endemismo. A mayor nivel, mayor
          dificultad y exigencia.
        </p>
      </div>

      {result && (
        <div className={`${card} animate-fade-up p-5 text-center`} aria-live="polite">
          {result.correct >= result.badge.minCorrectAnswers ? (
            <>
              <p className="animate-pop text-5xl" aria-hidden>
                🏅
              </p>
              <p className="mt-2 text-xl font-extrabold text-text">¡{result.badge.name} desbloqueada!</p>
            </>
          ) : (
            <p className="text-xl font-extrabold text-text">¡Casi lo logras!</p>
          )}
          <p className="mt-1 text-muted">
            Acertaste {result.correct} de {result.badge.totalQuestions}. Mínimo requerido:{' '}
            {result.badge.minCorrectAnswers}/{result.badge.totalQuestions}.
          </p>
          <button type="button" className={`${btnSecondary} mt-4`} onClick={() => setResult(null)}>
            Entendido
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {BADGES.map((b, idx) => {
          const unlocked = isUnlocked(idx);
          const passed = isPassed(b);
          return (
            <article key={b.id} className={`${card} flex flex-col p-5 ${unlocked ? '' : 'opacity-80'}`}>
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                    passed ? 'bg-primary text-on-primary' : 'bg-surface-2 text-muted'
                  }`}
                  aria-hidden
                >
                  {passed ? <Award className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted">
                    {passed ? 'Desbloqueada' : unlocked ? 'Bloqueada · Lista' : `Requiere Nivel ${b.levelNumber - 1}`}
                  </p>
                  <p className="text-xs font-bold text-ink">
                    Nivel {b.levelNumber} · Dificultad {b.difficultyLabel}
                  </p>
                  <h4 className="leading-tight font-bold text-text">{b.name}</h4>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">{b.description}</p>
              <p className="mt-3 text-sm text-text">
                <strong>Requisito de desbloqueo:</strong> Quiz de {b.totalQuestions} preguntas · Mínimo{' '}
                {b.minCorrectAnswers}/{b.totalQuestions} aciertos ({b.minScorePercent}%)
              </p>
              <div className="mt-auto pt-4">
                {unlocked ? (
                  <button
                    type="button"
                    className={`${passed ? btnSecondary : btnPrimary} w-full`}
                    onClick={() => {
                      setResult(null);
                      setPlaying(b);
                    }}
                  >
                    <Play className="h-5 w-5" aria-hidden />{' '}
                    {passed ? 'Presentar de nuevo' : `Presentar Quiz (${b.totalQuestions} preguntas)`}
                  </button>
                ) : (
                  <p className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-surface-2 px-4 text-sm font-medium text-muted">
                    <Lock className="h-4 w-4" aria-hidden /> Supera primero el Nivel {b.levelNumber - 1}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted">Tu progreso se guarda automáticamente en este dispositivo.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const TABS = [
  { id: 'oficiales', label: 'Evaluaciones oficiales' },
  { id: 'voluntariado', label: 'Insignias del voluntariado' },
] as const;

export default function Evaluations() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('oficiales');
  return (
    <Section id="evaluaciones" className="bg-surface-2/50" ariaLabel="Evaluaciones">
      <SectionHeader
        eyebrow="Cátedra de Biodiversidad de Colombia"
        title="Insignias Oficiales, Evaluaciones y Diplomas Verificables"
        subtitle="Pon a prueba tus conocimientos sobre fauna, flora y ecosistemas endémicos de Colombia."
      />
      <div className="mx-auto max-w-5xl">
        <div
          role="tablist"
          aria-label="Tipo de evaluación"
          className="mx-auto mb-8 grid max-w-xl grid-cols-2 gap-2 rounded-3xl sm:rounded-full border border-line bg-surface p-1.5"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              id={`tab-ev-${t.id}`}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              aria-controls={`panel-ev-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`min-h-11 rounded-2xl px-3 text-sm leading-tight font-semibold transition sm:rounded-full ${
                tab === t.id ? 'bg-primary text-on-primary shadow' : 'text-muted hover:text-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div id={`panel-ev-${tab}`} role="tabpanel" aria-labelledby={`tab-ev-${tab}`}>
          {tab === 'oficiales' ? <OfficialEvaluations /> : <VolunteerBadges />}
        </div>
      </div>
    </Section>
  );
}
