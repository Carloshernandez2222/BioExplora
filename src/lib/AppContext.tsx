import { createContext, useContext } from 'react';

export interface AppActions {
  openSpecies: (id: string) => void;
  showOnMap: (id: string) => void;
  createPoster: (id: string) => void;
}

export const AppContext = createContext<AppActions>({
  openSpecies: () => {},
  showOnMap: () => {},
  createPoster: () => {},
});

export const useApp = () => useContext(AppContext);
