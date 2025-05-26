import { type SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';

interface AppStoreData {
  albums: SimplifiedAlbum[];
  setAlbums: SetState<SimplifiedAlbum[]>;
  token: string | undefined;
  expires: number | undefined;
  startSession: (token: string, expires: number) => void;
  endSession: () => void;
}

function AppStore(): AppStoreData {
  const [albums, setAlbums] = useState<SimplifiedAlbum[]>([]);

  const [expires, setExpires] = useState(() => {
    const expires = localStorage.getItem('expires');
    if (!expires || Date.now() > parseInt(expires, 10)) {
      return undefined;
    }
    return parseInt(expires, 10);
  });

  const [token, setToken] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token || !expires || Date.now() > expires) {
      return;
    }
    return token;
  });

  const startSession = useCallback((t: string, e: number) => {
    setToken(t);
    setExpires(e);
    localStorage.setItem('token', t);
    localStorage.setItem('expires', e.toString());
  }, []);

  const endSession = useCallback(() => {
    setToken(undefined);
    setExpires(undefined);
    localStorage.clear();
  }, []);

  return {
    albums,
    setAlbums,
    token,
    expires,
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
