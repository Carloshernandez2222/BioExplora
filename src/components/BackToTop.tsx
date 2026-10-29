import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useHideOnScrollDown } from '../lib/hooks';
import { scrollToId } from '../lib/utils';

export default function BackToTop() {
  const [show, setShow] = useState(false);
  const hideOnMobile = useHideOnScrollDown();
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={() => scrollToId('inicio')}
      aria-label="Volver arriba"
      className={`fixed transition-transform duration-300 ${hideOnMobile ? 'max-sm:translate-y-40' : ''} bottom-24 right-4 z-[55] flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-lg hover:bg-surface-2 sm:right-6 sm:bottom-28`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden />
    </button>
  );
}
