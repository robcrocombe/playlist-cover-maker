import { type SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';

type AppStoreData = ReturnType<typeof AppStore>;

function AppStore() {
  const [albums, setAlbums] = useState<SimplifiedAlbum[]>([]);

  const [hasSession, setHasSession] = useState(() => {
    return !!localStorage.getItem('token') && !!localStorage.getItem('refreshToken');
  });

  const startSession = useCallback(() => {
    setHasSession(true);
  }, []);

  const endSession = useCallback(() => {
    setHasSession(false);
    localStorage.clear();
  }, []);

  return {
    albums,
    setAlbums,
    hasSession,
    startSession,
    endSession,
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
