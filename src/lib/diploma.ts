const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export interface DiplomaLevel {
  numero: number;
  etiqueta: string; // p. ej. "Bronce · Principiante"
  titulo: string; // p. ej. "Explorador Inicial de la Biodiversidad"
  color: string;
}

export async function downloadDiploma({
  nombre,
  level,
  porcentaje,
  codigo,
  fecha,
}: {
  nombre: string;
  level: DiplomaLevel;
  porcentaje: number;
  codigo: string;
  fecha: string;
}) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297;
  const H = 210;
  const green: [number, number, number] = [27, 94, 63];
  const gold: [number, number, number] = [245, 166, 35];

  doc.setFillColor(247, 250, 248);
  doc.rect(0, 0, W, H, 'F');
  doc.setDrawColor(...green);
  doc.setLineWidth(3);
  doc.rect(10, 10, W - 20, H - 20);
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.8);
  doc.rect(15, 15, W - 30, H - 30);

  doc.setTextColor(...green);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('BioExplora Colombia', W / 2, 32, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(74, 95, 84);
  doc.text('Voluntariado Ambiental · Biodiversidad Colombiana', W / 2, 38, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(17, 39, 28);
  doc.text('Diploma de reconocimiento', W / 2, 58, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(74, 95, 84);
  doc.text('Se otorga a', W / 2, 72, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...green);
  doc.text(nombre.trim() || 'Explorador(a) de la biodiversidad', W / 2, 88, { align: 'center', maxWidth: W - 70 });
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.line(70, 93, W - 70, 93);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(17, 39, 28);
  doc.text(
    `por aprobar la Evaluación Oficial ${level.etiqueta} de la Cátedra de Biodiversidad de Colombia con ${porcentaje} % de aciertos`,
    W / 2,
    105,
    {
      align: 'center',
      maxWidth: W - 60,
    },
  );

  // insignia
  const cx = W / 2;
  const cy = 132;
  const [r, g, b] = hexToRgb(level.color);
  doc.setFillColor(...gold);
  doc.triangle(cx - 10, cy + 8, cx - 4, cy + 30, cx - 1, cy + 10, 'F');
  doc.triangle(cx + 10, cy + 8, cx + 4, cy + 30, cx + 1, cy + 10, 'F');
  doc.setFillColor(r, g, b);
  doc.circle(cx, cy, 14, 'F');
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1.2);
  doc.circle(cx, cy, 11, 'S');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(String(level.numero), cx, cy + 5.5, { align: 'center' });

  doc.setTextColor(17, 39, 28);
  doc.setFontSize(18);
  doc.text(level.titulo, W / 2, 172, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(74, 95, 84);
  doc.text(
    `Fecha: ${new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    30,
    186,
  );
  doc.text(`Código de verificación: ${codigo}`, W - 30, 186, { align: 'right' });
  doc.setFontSize(9);
  doc.text('Conocer nuestra biodiversidad es el primer paso para protegerla.', W / 2, 192, { align: 'center' });

  doc.save(`diploma-bioexplora-nivel-${level.numero}.pdf`);
}
