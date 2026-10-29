import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useDialog } from '../lib/hooks';

export default function Modal({
  open,
  onClose,
  labelledBy,
  children,
  className = 'max-w-3xl',
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
}) {
  useDialog(open, onClose);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`animate-fade-up relative max-h-[92svh] w-full overflow-y-auto rounded-t-3xl bg-surface text-text shadow-2xl outline-none sm:rounded-3xl ${className}`}
      >
        {/* sticky: el botón de cerrar sigue visible al desplazarse dentro de la ventana */}
        <div className="pointer-events-none sticky top-0 z-10 -mb-[68px] flex justify-end p-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white shadow-lg hover:bg-black/80"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
