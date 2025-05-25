import { type SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
import { createContext, useContext, useState, type PropsWithChildren } from 'react';

interface AppStoreData {
  albums: SimplifiedAlbum[];
  setAlbums: SetState<SimplifiedAlbum[]>;
}

function AppStore(): AppStoreData {
  const [albums, setAlbums] = useState<SimplifiedAlbum[]>([]);

  return {
    albums,
    setAlbums,
  };
}

const AppStoreContext = createContext<AppStoreData | null>(null);

export function useAppStore(): AppStoreData {
  const store = useContext(AppStoreContext);
  if (!store) {
    throw new Error('useAppStore must be used within a AppStoreProvider.');
  }
  return store;
}

interface AppStoreProviderProps {}

export function AppStoreProvider({
  children,
}: PropsWithChildren<AppStoreProviderProps>): JSX.Element {
  const store = AppStore();
  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}
