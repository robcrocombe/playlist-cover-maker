import { type SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
import { createContext, useContext, useState, type PropsWithChildren } from 'react';

interface AppStoreData {
  albums: SimplifiedAlbum[];
  setAlbums: SetState<SimplifiedAlbum[]>;
  token: string | undefined;
  setToken: SetState<string | undefined>;
}

function AppStore(): AppStoreData {
  const [albums, setAlbums] = useState<SimplifiedAlbum[]>([]);
  const [token, setToken] = useState(() => {
    const token = localStorage.getItem('token');
    const expires = localStorage.getItem('expires');
    if (!token || !expires || Date.now() > parseInt(expires, 10)) {
      return;
    }
    return token;
  });

  return {
    albums,
    setAlbums,
    token,
    setToken,
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
