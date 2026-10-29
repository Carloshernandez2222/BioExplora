import { useEffect, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { downloadDataUrl, siteUrl } from '../lib/utils';
import { btnPrimary, btnSecondary } from './ui';

export default function QRSection() {
  const [dataUrl, setDataUrl] = useState('');
  const url = siteUrl();

  useEffect(() => {
    let alive = true;
    import('qrcode')
      .then((QR) => QR.toDataURL(url, { width: 640, margin: 2, color: { dark: '#11271C', light: '#FFFFFF' } }))
      .then((d) => alive && setDataUrl(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [url]);

  const print = () => {
    document.body.classList.add('printing-qr');
    const done = () => {
      document.body.classList.remove('printing-qr');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 1000);
  };

  return (
    <div className="grid items-center gap-8 md:grid-cols-2">
      <div>
        <h3 className="text-2xl font-extrabold text-text">Código QR para tu colegio</h3>
        <p className="mt-2 text-muted">
          Imprímelo y pégalo en la cartelera del colegio, la biblioteca o el salón. Quien lo escanee llegará directo a
          esta guía.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className={btnPrimary}
            disabled={!dataUrl}
            onClick={() => downloadDataUrl(dataUrl, 'qr-bioexplora-colombia.png')}
          >
            <Download className="h-5 w-5" aria-hidden /> Descargar QR
          </button>
          <button type="button" className={btnSecondary} disabled={!dataUrl} onClick={print}>
            <Printer className="h-5 w-5" aria-hidden /> Imprimir
          </button>
        </div>
      </div>
      <div
        id="qr-print"
        className="mx-auto flex flex-col items-center rounded-3xl bg-white p-6 text-center text-[#11271C] shadow-lg"
      >
        <p className="font-display text-lg font-extrabold">BioExplora Colombia 🌿</p>
        <p className="text-sm">Escanea y descubre las especies endémicas de Colombia</p>
        {dataUrl ? (
          <img src={dataUrl} alt={`Código QR que lleva a ${url}`} className="mt-3 h-56 w-56 sm:h-64 sm:w-64" />
        ) : (
          <div className="mt-3 h-56 w-56 animate-pulse rounded-xl bg-gray-100 sm:h-64 sm:w-64" aria-hidden />
        )}
        <p className="mt-2 max-w-64 text-xs break-all">{url}</p>
      </div>
    </div>
  );
}
