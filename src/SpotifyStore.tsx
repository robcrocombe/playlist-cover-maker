import type { SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
import { createContext, useCallback, useContext, type PropsWithChildren } from 'react';
import { fetchAlbums } from './spotify';

interface SpotifyStore {
  searchAlbums: (query: string) => Promise<SimplifiedAlbum[] | undefined>;
}

function SpotifyStore(token: string): SpotifyStore {
  const searchAlbums = useCallback(
    (query: string): Promise<SimplifiedAlbum[] | undefined> => {
      return fetchAlbums(token, query);
    },
    [token]
  );

  return { searchAlbums };
}

const SpotifyStoreContext = createContext<SpotifyStore | null>(null);

export function useSpotifyStore(): SpotifyStore {
  const store = useContext(SpotifyStoreContext);
  if (!store) {
    throw new Error('useSpotifyStore must be used within a SpotifyStoreProvider.');
  }
  return store;
}

interface SpotifyStoreProviderProps {
  token: string;
}

export function SpotifyStoreProvider({
  token,
  children,
}: PropsWithChildren<SpotifyStoreProviderProps>): JSX.Element {
  const store = SpotifyStore(token);
  return <SpotifyStoreContext.Provider value={store}>{children}</SpotifyStoreContext.Provider>;
}
