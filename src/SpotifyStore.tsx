import type { SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
import { createContext, useCallback, useContext, type PropsWithChildren } from 'react';
import { useAppStore } from './AppStore';
import { fetchAlbums } from './spotify';

interface SpotifyStore {
  searchAlbums: (query: string) => Promise<SimplifiedAlbum[] | undefined>;
}

function SpotifyStore(): SpotifyStore {
  const { token, expires, endSession } = useAppStore();

  const searchAlbums = useCallback(
    async (query: string): Promise<SimplifiedAlbum[] | undefined> => {
      if (!token || !expires || Date.now() > expires) {
        endSession();
        return;
      }

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

export function SpotifyStoreProvider({ children }: PropsWithChildren): JSX.Element {
  const store = SpotifyStore();
  return <SpotifyStoreContext.Provider value={store}>{children}</SpotifyStoreContext.Provider>;
}
