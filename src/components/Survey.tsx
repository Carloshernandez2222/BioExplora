import { useEffect, useMemo, useRef, useState } from 'react';
import { ChartBar, FileSpreadsheet, QrCode, Send } from 'lucide-react';
import type { Chart as ChartType } from 'chart.js';
import { DEPARTAMENTOS } from '../data/departamentos';
import { SPECIES, getSpecies, grupoDe } from '../data/catalog';
import { SHEETS_URL, fetchFromSheet, sendToSheet } from '../lib/sheets';
import { load, save } from '../lib/storage';
import QRSection from './QRSection';
import { Section, SectionHeader, SpeciesImage, btnPrimary, btnSecondary, card } from './ui';

interface Respuesta {
  fecha: string;
  nombre: string;
  edad: string;
  departamento: string;
  especie: string;
  conocia: string;
  sabiaEndemica: string;
  aprendio: string;
  orgullo: string;
  comentario: string;
}

type Campos = Omit<Respuesta, 'fecha'>;

// Opciones de la encuesta original.
const EDADES = ['Menor de 18 años', '18 - 24 años', '25 - 34 años', '35 - 49 años', '50 años o más'];
const OPC = {
  conocia: ['Sí, ya la conocía', 'No, no la conocía'],
  sabiaEndemica: ['Sí, sabía que era endémica', 'Pensaba que vivía en otros países'],
  aprendio: ['¡Sí, aprendí mucho!', 'Ya lo sabía todo'],
  orgullo: ['¡Sí! Orgullo por nuestra tierra 🇨🇴', 'Igual que antes'],
};
const MAX_COMENTARIO = 500;
const VACIO: Campos = {
  nombre: '',
  edad: '',
  departamento: '',
  especie: '',
  conocia: '',
  sabiaEndemica: '',
  aprendio: '',
  orgullo: '',
  comentario: '',
};

const OBLIGATORIOS: { key: keyof Campos; label: string }[] = [
  { key: 'edad', label: 'tu rango de edad' },
  { key: 'departamento', label: 'tu departamento de residencia' },
  { key: 'especie', label: 'la especie que deseas evaluar' },
  { key: 'conocia', label: 'si conocías la especie' },
  { key: 'sabiaEndemica', label: 'si sabías que solo existe en Colombia' },
  { key: 'aprendio', label: 'si aprendiste algo nuevo' },
  { key: 'orgullo', label: 'si aumenta tu orgullo por la biodiversidad' },
];

function BigChoice({
  name,
  legend,
  options,
  value,
  onChange,
  error,
}: {
  name: keyof Campos;
  legend: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  error: boolean;
}) {
  return (
    <fieldset
      id={`campo-${name}`}
      className={`rounded-2xl border-2 p-4 ${error ? 'border-[#B91C1C] bg-[#B91C1C]/5' : 'border-transparent'}`}
      aria-invalid={error || undefined}
    >
      <legend className="mb-3 px-1 font-semibold text-text">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o}
            className={`flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border-2 px-3 text-center font-semibold transition focus-within:ring-2 focus-within:ring-gold ${
              value === o
                ? 'border-primary bg-primary text-on-primary'
                : 'border-line bg-surface text-text hover:border-primary'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o}
              checked={value === o}
              onChange={() => onChange(o)}
              className="sr-only"
            />
            {o}
          </label>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-[#B91C1C] dark:text-[#F87171]">Elige una opción, por favor.</p>}
    </fieldset>
  );
}

function contar(rs: Respuesta[], key: keyof Respuesta, labels?: string[]) {
  const m = new Map<string, number>();
  labels?.forEach((l) => m.set(l, 0));
  rs.forEach((r) => m.set(r[key], (m.get(r[key]) ?? 0) + 1));
  return m;
}

function ResultsView({ respuestas, global }: { respuestas: Respuesta[]; global: boolean }) {
  const edadRef = useRef<HTMLCanvasElement>(null);
  const conociaRef = useRef<HTMLCanvasElement>(null);
  const aprendioRef = useRef<HTMLCanvasElement>(null);
  const especieRef = useRef<HTMLCanvasElement>(null);
  const [xlsxError, setXlsxError] = useState(false);

  useEffect(() => {
    if (respuestas.length === 0) return;
    let charts: ChartType[] = [];
    let alive = true;
    import('chart.js/auto').then(({ default: Chart }) => {
      if (!alive) return;
      const css = getComputedStyle(document.documentElement);
      const text = css.getPropertyValue('--c-text').trim() || '#11271c';
      const grid = css.getPropertyValue('--c-line').trim() || '#d5e4db';
      const primary = css.getPropertyValue('--c-primary').trim() || '#1b5e3f';
      Chart.defaults.color = text;
      Chart.defaults.font.family = 'Inter, sans-serif';
      const palette = ['#1ABC9C', '#F5A623', '#1F6FB2', '#8E44AD', '#C2410C', '#1B5E3F'];
      const bar = (el: HTMLCanvasElement, m: Map<string, number>, horizontal = false) =>
        new Chart(el, {
          type: 'bar',
          data: {
            labels: [...m.keys()],
            datasets: [{ data: [...m.values()], backgroundColor: primary, borderRadius: 8 }],
          },
          options: {
            indexAxis: horizontal ? 'y' : 'x',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: grid }, ticks: { precision: 0 } },
              y: { grid: { color: grid }, ticks: { precision: 0 } },
            },
          },
        });
      const dona = (el: HTMLCanvasElement, m: Map<string, number>) =>
        new Chart(el, {
          type: 'doughnut',
          data: {
            labels: [...m.keys()],
            datasets: [{ data: [...m.values()], backgroundColor: palette, borderWidth: 0 }],
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
        });

      const especies = contar(respuestas, 'especie');
      const especiesNombre = new Map(
        [...especies.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([id, n]) => [getSpecies(id)?.commonName ?? id, n]),
      );
      charts = [
        bar(edadRef.current!, contar(respuestas, 'edad', EDADES)),
        dona(conociaRef.current!, contar(respuestas, 'conocia', OPC.conocia)),
        dona(aprendioRef.current!, contar(respuestas, 'aprendio', OPC.aprendio)),
        bar(especieRef.current!, especiesNombre, true),
      ];
    });
    return () => {
      alive = false;
      charts.forEach((c) => c.destroy());
    };
  }, [respuestas]);

  const exportar = async () => {
    setXlsxError(false);
    try {
      const XLSX = await import('xlsx');
      const filas = respuestas.map((r) => ({
        Fecha: new Date(r.fecha).toLocaleString('es-CO'),
        // los datos de la hoja no traen nombre ni comentario (son privados)
        ...(global ? {} : { 'Nombre o apodo': r.nombre }),
        'Rango de edad': r.edad,
        'Departamento de residencia': r.departamento,
        'Especie evaluada': getSpecies(r.especie)?.commonName ?? r.especie,
        '¿Conocía la especie?': r.conocia,
        '¿Sabía que es endémica?': r.sabiaEndemica,
        '¿Aprendió algo nuevo?': r.aprendio,
        '¿Aumenta su orgullo?': r.orgullo,
        ...(global ? {} : { Comentario: r.comentario }),
      }));
      const ws = XLSX.utils.json_to_sheet(filas);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Encuesta');
      XLSX.writeFile(wb, 'resultados-encuesta-bioexplora.xlsx');
    } catch {
      setXlsxError(true);
    }
  };

  if (respuestas.length === 0)
    return (
      <div className="py-10 text-center">
        <p className="text-lg font-semibold text-text">
          {global ? 'Aún no hay respuestas registradas.' : 'Aún no hay respuestas en este dispositivo.'}
        </p>
        <p className="mt-1 text-muted">Responde la encuesta y aquí verás los resultados.</p>
      </div>
    );

  const sabia = contar(respuestas, 'sabiaEndemica', OPC.sabiaEndemica);
  const orgullo = contar(respuestas, 'orgullo', OPC.orgullo);
  const pctDe = (m: Map<string, number>, k: string) => Math.round(((m.get(k) ?? 0) / respuestas.length) * 100);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-surface-2 p-4 text-center">
          <p className="font-display text-3xl font-extrabold text-ink">{respuestas.length}</p>
          <p className="text-sm text-muted">
            {respuestas.length === 1 ? 'respuesta registrada' : 'respuestas registradas'}
          </p>
        </div>
        <div className="rounded-2xl bg-surface-2 p-4 text-center">
          <p className="font-display text-3xl font-extrabold text-ink">{pctDe(sabia, OPC.sabiaEndemica[1])} %</p>
          <p className="text-sm text-muted">pensaba que la especie vivía en otros países</p>
        </div>
        <div className="rounded-2xl bg-surface-2 p-4 text-center">
          <p className="font-display text-3xl font-extrabold text-ink">{pctDe(orgullo, OPC.orgullo[0])} %</p>
          <p className="text-sm text-muted">siente más orgullo por nuestra tierra</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <figure className="rounded-2xl border border-line p-4">
          <figcaption className="mb-2 font-semibold text-text">Rango de edad</figcaption>
          <div className="h-60">
            <canvas ref={edadRef} role="img" aria-label="Gráfico de barras de respuestas por rango de edad" />
          </div>
        </figure>
        <figure className="rounded-2xl border border-line p-4">
          <figcaption className="mb-2 font-semibold text-text">¿Conocían la especie?</figcaption>
          <div className="h-60">
            <canvas ref={conociaRef} role="img" aria-label="Gráfico de dona: conocían o no la especie" />
          </div>
        </figure>
        <figure className="rounded-2xl border border-line p-4">
          <figcaption className="mb-2 font-semibold text-text">¿Aprendieron algo nuevo?</figcaption>
          <div className="h-60">
            <canvas ref={aprendioRef} role="img" aria-label="Gráfico de dona: si aprendieron algo nuevo" />
          </div>
        </figure>
        <figure className="rounded-2xl border border-line p-4">
          <figcaption className="mb-2 font-semibold text-text">Especies más evaluadas</figcaption>
          <div className="h-60">
            <canvas ref={especieRef} role="img" aria-label="Gráfico de barras de las especies más evaluadas" />
          </div>
        </figure>
      </div>
      <div className="flex flex-col items-center gap-2">
        <button type="button" className={btnPrimary} onClick={exportar}>
          <FileSpreadsheet className="h-5 w-5" aria-hidden /> Descargar resultados en Excel (.xlsx)
        </button>
        {xlsxError && (
          <p className="text-sm text-[#B91C1C] dark:text-[#F87171]" role="alert">
            No pudimos crear el archivo. Inténtalo de nuevo.
          </p>
        )}
      </div>
      <p className="text-center text-xs text-muted">
        {global
          ? 'Resultados de todos los participantes. Por privacidad no se muestran nombres ni comentarios.'
          : 'Estos resultados corresponden solo a las respuestas registradas en este dispositivo y navegador.'}
      </p>
    </div>
  );
}

/** Muestra las respuestas de todos (Google Sheets, si está configurado) o las guardadas en este dispositivo. */
function Results({ local }: { local: Respuesta[] }) {
  const [origen, setOrigen] = useState<'todos' | 'dispositivo'>(SHEETS_URL ? 'todos' : 'dispositivo');
  const [remote, setRemote] = useState<Respuesta[] | null>(null);
  const [state, setState] = useState<'cargando' | 'listo' | 'error'>(SHEETS_URL ? 'cargando' : 'listo');

  useEffect(() => {
    if (!SHEETS_URL) return;
    let alive = true;
    fetchFromSheet<Partial<Respuesta>>()
      .then((rows) => {
        if (!alive) return;
        setRemote(rows.map((r) => ({ ...VACIO, fecha: '', ...r }) as Respuesta));
        setState('listo');
      })
      .catch(() => alive && setState('error'));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      {SHEETS_URL && (
        <div role="group" aria-label="Origen de los resultados" className="mb-6 flex flex-wrap justify-center gap-2">
          {(
            [
              ['todos', 'Todos los participantes'],
              ['dispositivo', 'Este dispositivo'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={origen === id}
              onClick={() => setOrigen(id)}
              className={`min-h-10 rounded-full border-2 px-4 text-sm font-semibold transition ${
                origen === id
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-line bg-surface text-text hover:border-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {origen === 'dispositivo' ? (
        <ResultsView respuestas={local} global={false} />
      ) : state === 'cargando' ? (
        <p className="py-10 text-center text-muted">Cargando resultados…</p>
      ) : state === 'error' || !remote ? (
        <p role="status" className="rounded-2xl border border-gold bg-gold/10 p-4 text-center text-sm text-text">
          No pudimos cargar los resultados de todos los participantes. Revisa tu conexión o mira los de este
          dispositivo.
        </p>
      ) : (
        <ResultsView key="todos" respuestas={remote} global />
      )}
    </>
  );
}

const TABS = [
  { id: 'encuesta', label: 'Encuesta', icon: Send },
  { id: 'qr', label: 'Código QR', icon: QrCode },
  { id: 'resultados', label: 'Resultados', icon: ChartBar },
] as const;

export default function Survey() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('encuesta');
  const [form, setForm] = useState<Campos>(VACIO);
  const [errores, setErrores] = useState<Set<keyof Campos>>(new Set());
  const [enviado, setEnviado] = useState(false);
  const [respuestas, setRespuestas] = useState<Respuesta[]>(() => load<Respuesta[]>('encuesta', []));
  const resumenRef = useRef<HTMLDivElement>(null);
  const graciasRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof Campos) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errores.has(k)) {
      const n = new Set(errores);
      n.delete(k);
      setErrores(n);
    }
  };

  const faltantes = useMemo(() => OBLIGATORIOS.filter((c) => errores.has(c.key)), [errores]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = new Set(OBLIGATORIOS.filter((c) => !form[c.key]).map((c) => c.key));
    setErrores(missing);
    if (missing.size > 0) {
      requestAnimationFrame(() => resumenRef.current?.focus());
      return;
    }
    const nueva: Respuesta = {
      ...form,
      nombre: form.nombre.trim(),
      comentario: form.comentario.trim(),
      fecha: new Date().toISOString(),
    };
    const todas = [...respuestas, nueva];
    setRespuestas(todas);
    save('encuesta', todas);
    // En la hoja se guarda el nombre de la especie, más fácil de leer que su id.
    sendToSheet({ ...nueva, especie: getSpecies(nueva.especie)?.commonName ?? nueva.especie });
    setEnviado(true);
    requestAnimationFrame(() => graciasRef.current?.focus());
  };

  const selectCls = (k: keyof Campos) =>
    `mt-2 h-12 w-full rounded-xl border-2 bg-surface px-3 text-text focus:border-primary focus:outline-none ${
      errores.has(k) ? 'border-[#B91C1C]' : 'border-line'
    }`;

  return (
    <Section id="encuesta" className="bg-surface-2/50" ariaLabel="Encuesta">
      <SectionHeader
        eyebrow="Participación Ciudadana y Medición de Impacto"
        title="Tu opinión ayuda a proteger nuestra biodiversidad"
        subtitle="Queremos conocer si nuestras publicaciones y afiches permitieron aprender algo nuevo sobre las especies endémicas de Colombia."
      />
      <div className="mx-auto max-w-3xl">
        <div
          role="tablist"
          aria-label="Encuesta"
          className="mb-6 grid grid-cols-3 gap-1.5 rounded-full border border-line bg-surface p-1.5"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              id={`tab-enc-${id}`}
              aria-selected={tab === id}
              aria-controls={`panel-enc-${id}`}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-2 text-sm font-semibold transition ${
                tab === id ? 'bg-primary text-on-primary shadow' : 'text-muted hover:text-text'
              }`}
            >
              <Icon className="hidden h-4 w-4 sm:block" aria-hidden /> {label}
            </button>
          ))}
        </div>

        <div
          id={`panel-enc-${tab}`}
          role="tabpanel"
          aria-labelledby={`tab-enc-${tab}`}
          className={`${card} p-5 sm:p-8`}
        >
          {tab === 'resultados' ? (
            <Results local={respuestas} />
          ) : tab === 'qr' ? (
            <QRSection />
          ) : enviado ? (
            <div ref={graciasRef} tabIndex={-1} className="py-10 text-center outline-none" aria-live="polite">
              <p className="animate-pop text-6xl" aria-hidden>
                💚
              </p>
              <h3 className="mt-4 text-2xl font-extrabold text-text">¡Gracias por tu respuesta!</h3>
              <p className="mx-auto mt-2 max-w-md text-muted">
                Tu opinión nos ayuda a medir el impacto de nuestro voluntariado y a llevar este mensaje a más personas.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" className={btnPrimary} onClick={() => setTab('resultados')}>
                  <ChartBar className="h-5 w-5" aria-hidden /> Ver resultados
                </button>
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => {
                    setForm(VACIO);
                    setEnviado(false);
                  }}
                >
                  Enviar otra respuesta
                </button>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={submit} className="space-y-6">
              {faltantes.length > 0 && (
                <div
                  ref={resumenRef}
                  tabIndex={-1}
                  role="alert"
                  className="rounded-2xl border-2 border-[#B91C1C] bg-[#B91C1C]/5 p-4 text-sm text-text outline-none"
                >
                  <p className="font-semibold">Te faltan algunas respuestas:</p>
                  <ul className="mt-1 list-disc pl-5">
                    {faltantes.map((f) => (
                      <li key={f.key}>
                        <a href={`#campo-${f.key}`} className="underline">
                          Indica {f.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label htmlFor="campo-nombre" className="font-semibold text-text">
                  Nombre o Apodo <span className="font-normal text-muted">(Opcional)</span>
                </label>
                <input
                  id="campo-nombre"
                  type="text"
                  maxLength={60}
                  value={form.nombre}
                  onChange={(e) => set('nombre')(e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border-2 border-line bg-surface px-3 text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="campo-edad" className="font-semibold text-text">
                    Rango de Edad
                  </label>
                  <select
                    id="campo-edad"
                    value={form.edad}
                    onChange={(e) => set('edad')(e.target.value)}
                    className={selectCls('edad')}
                    aria-invalid={errores.has('edad') || undefined}
                  >
                    <option value="">Selecciona…</option>
                    {EDADES.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="campo-departamento" className="font-semibold text-text">
                    Departamento de Residencia
                  </label>
                  <select
                    id="campo-departamento"
                    value={form.departamento}
                    onChange={(e) => set('departamento')(e.target.value)}
                    className={selectCls('departamento')}
                    aria-invalid={errores.has('departamento') || undefined}
                  >
                    <option value="">Selecciona…</option>
                    {DEPARTAMENTOS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <fieldset
                id="campo-especie"
                className={`rounded-2xl border-2 p-4 ${errores.has('especie') ? 'border-[#B91C1C] bg-[#B91C1C]/5' : 'border-transparent'}`}
              >
                <legend className="mb-3 px-1 font-semibold text-text">Especie que deseas evaluar</legend>
                <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                  {SPECIES.map((s) => (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-1.5 text-xs font-medium transition focus-within:ring-2 focus-within:ring-gold ${
                        form.especie === s.id
                          ? 'border-primary bg-surface-2 text-text'
                          : 'border-line text-muted hover:border-primary'
                      }`}
                    >
                      <input
                        type="radio"
                        name="especie"
                        value={s.id}
                        checked={form.especie === s.id}
                        onChange={() => set('especie')(s.id)}
                        className="sr-only"
                      />
                      <SpeciesImage
                        src={s.imageUrl}
                        alt=""
                        grupo={grupoDe(s)}
                        showCredit={false}
                        className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-2"
                      />
                      <span>
                        {s.commonName} <em className="block opacity-80">{s.scientificName}</em>
                      </span>
                    </label>
                  ))}
                </div>
                {errores.has('especie') && (
                  <p className="mt-2 text-sm text-[#B91C1C] dark:text-[#F87171]">Elige una especie, por favor.</p>
                )}
              </fieldset>

              <BigChoice
                name="conocia"
                legend="¿Conocías anteriormente a esta especie antes de ver la información?"
                options={OPC.conocia}
                value={form.conocia}
                onChange={set('conocia')}
                error={errores.has('conocia')}
              />
              <BigChoice
                name="sabiaEndemica"
                legend="¿Sabías que es una especie endémica que SOLO existe en Colombia?"
                options={OPC.sabiaEndemica}
                value={form.sabiaEndemica}
                onChange={set('sabiaEndemica')}
                error={errores.has('sabiaEndemica')}
              />
              <BigChoice
                name="aprendio"
                legend="¿La información compartida te permitió aprender algo nuevo sobre su función o amenazas?"
                options={OPC.aprendio}
                value={form.aprendio}
                onChange={set('aprendio')}
                error={errores.has('aprendio')}
              />
              <BigChoice
                name="orgullo"
                legend="¿Conocer esta especie aumenta tu sentido de orgullo y valoración por la biodiversidad colombiana?"
                options={OPC.orgullo}
                value={form.orgullo}
                onChange={set('orgullo')}
                error={errores.has('orgullo')}
              />

              <div>
                <label htmlFor="campo-comentario" className="font-semibold text-text">
                  ¿Algún comentario o reflexión sobre nuestras especies?{' '}
                  <span className="font-normal text-muted">(Opcional)</span>
                </label>
                <textarea
                  id="campo-comentario"
                  rows={4}
                  maxLength={MAX_COMENTARIO}
                  value={form.comentario}
                  onChange={(e) => set('comentario')(e.target.value.slice(0, MAX_COMENTARIO))}
                  aria-describedby="contador-comentario"
                  className="mt-2 w-full rounded-xl border-2 border-line bg-surface p-3 text-text placeholder:text-muted focus:border-primary focus:outline-none"
                />
                <p id="contador-comentario" className="text-right text-xs text-muted">
                  {form.comentario.length}/{MAX_COMENTARIO} caracteres
                </p>
              </div>

              <button type="submit" className={`${btnPrimary} w-full`}>
                <Send className="h-5 w-5" aria-hidden /> Enviar Respuestas
              </button>
              <p className="text-center text-xs text-muted">
                {SHEETS_URL
                  ? 'Tus respuestas se guardan en este dispositivo y se envían al equipo del voluntariado.'
                  : 'Tus respuestas se guardan solo en este navegador.'}
              </p>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}
