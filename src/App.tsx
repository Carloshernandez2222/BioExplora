import { useCallback, useMemo, useState } from 'react';
import About from './components/About';
import Afiches from './components/Afiches';
import BackToTop from './components/BackToTop';
import BioGuia from './components/BioGuia';
import Concept from './components/Concept';
import Curiosities from './components/Curiosities';
import Evaluations from './components/Evaluations';
import Footer from './components/Footer';
import Gallery from './components/Gallery';
import Header from './components/Header';
import Hero from './components/Hero';
import MapSection, { type MapFocus } from './components/MapSection';
import Protect from './components/Protect';
import SpeciesGrid from './components/SpeciesGrid';
import SpeciesModal from './components/SpeciesModal';
import Survey from './components/Survey';
import Trivia from './components/Trivia';
import type { PosterRequest } from './components/PosterGenerator';
import { AppContext, type AppActions } from './lib/AppContext';
import { scrollToId } from './lib/utils';

export default function App() {
  const [modalId, setModalId] = useState<string | null>(null);
  const [mapFocus, setMapFocus] = useState<MapFocus | null>(null);
  const [posterRequest, setPosterRequest] = useState<PosterRequest | null>(null);

  const showOnMap = useCallback((id: string) => {
    setModalId(null);
    scrollToId('mapa');
    setMapFocus({ id, nonce: Date.now() });
  }, []);

  const createPoster = useCallback((id: string) => {
    setModalId(null);
    scrollToId('afiches');
    setPosterRequest({ id, nonce: Date.now() });
  }, []);

  const actions = useMemo<AppActions>(
    () => ({ openSpecies: (id) => setModalId(id), showOnMap, createPoster }),
    [showOnMap, createPoster],
  );

  return (
    <AppContext.Provider value={actions}>
      <a
        href="#especies"
        className="sr-only z-[100] rounded-full bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <Header />
      <main>
        <Hero />
        <Concept />
        <SpeciesGrid />
        <Curiosities />
        <Protect />
        <Trivia />
        <Gallery />
        <MapSection focus={mapFocus} />
        <Afiches posterRequest={posterRequest} />
        <Evaluations />
        <Survey />
        <About />
      </main>
      <Footer />
      <BackToTop />
      <BioGuia />
      <SpeciesModal id={modalId} onClose={() => setModalId(null)} />
    </AppContext.Provider>
  );
}
