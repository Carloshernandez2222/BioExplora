/**
 * BioExplora Colombia – recepción de la encuesta en Google Sheets.
 *
 * - doPost: agrega cada respuesta como una fila nueva en la hoja "Respuestas".
 * - doGet: devuelve las respuestas para los gráficos públicos del sitio,
 *   SIN nombre ni comentario (esos datos solo los ve la dueña de la hoja).
 *
 * Instrucciones de instalación: ver google-sheets/INSTRUCCIONES.md
 */
const SHEET_NAME = 'Respuestas';
const HEADERS = [
  'Fecha',
  'Nombre o apodo',
  'Rango de edad',
  'Departamento de residencia',
  'Especie evaluada',
  '¿Conocía la especie?',
  '¿Sabía que es endémica?',
  '¿Aprendió algo nuevo?',
  '¿Aumenta su orgullo?',
  'Comentario',
];
const KEYS = ['fecha', 'nombre', 'edad', 'departamento', 'especie', 'conocia', 'sabiaEndemica', 'aprendio', 'orgullo', 'comentario'];
const PUBLIC_KEYS = ['fecha', 'edad', 'departamento', 'especie', 'conocia', 'sabiaEndemica', 'aprendio', 'orgullo'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Evita que un texto que empiece por = + - @ se interprete como fórmula.
function clean_(value, max) {
  let s = String(value == null ? '' : value).slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const row = KEYS.map(function (k) {
      if (k === 'fecha') return new Date();
      return clean_(d[k], k === 'comentario' ? 500 : 150);
    });
    sheet_().appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  const values = sheet_().getDataRange().getValues().slice(1);
  const data = values.map(function (r) {
    const o = {};
    PUBLIC_KEYS.forEach(function (k) {
      const v = r[KEYS.indexOf(k)];
      o[k] = v instanceof Date ? v.toISOString() : String(v);
    });
    return o;
  });
  return json_({ ok: true, data: data });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
