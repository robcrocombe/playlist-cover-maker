import { isAxiosError } from 'axios';
import { createContext, useCallback, useContext, type PropsWithChildren } from 'react';
import { toast } from 'react-toastify';
import { useAppStore } from './AppStore';
import { fetchAlbums, fetchPlaylists, refreshToken } from './spotify';

type SpotifyStoreData = ReturnType<typeof SpotifyStore>;

function SpotifyStore() {
  const { endSession } = useAppStore();

  const searchAlbums = useCallback((query: string, offset: number = 0) => {
    return fetchWithAuth(token => fetchAlbums(token, query, offset), endSession);
  }, []);

  const getPlaylists = useCallback((offset: number = 0) => {
    return fetchWithAuth(token => fetchPlaylists(token, offset), endSession);
  }, []);

  return { searchAlbums, getPlaylists };
}

async function fetchWithAuth<T>(
  callback: (token: string) => Promise<T>,
  endSession: () => void,
  refreshAttempted: boolean = false
): Promise<T | undefined> {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      endSession();
      return Promise.resolve(undefined);
    }

    return await callback(token);
  } catch (err) {
    // Attempt to refresh the token if we get a 401 Unauthorized error
    if (isAxiosError(err) && err.response?.status === 401) {
      try {
        await refreshToken();

        // Retry the original request after a successful refresh
        // with a flag to prevent an infinite loop
        if (!refreshAttempted) {
          return await fetchWithAuth(callback, endSession, true);
        } else {
          console.error('Refresh token failed multiple times, ending session.');
          toast.error('Session expired. Please log in again.');
          endSession();
        }
      } catch (refreshErr) {
        console.error(refreshErr);
        toast.error('Failed to refresh token. Please log in again.');
        endSession();
      }
    } else {
      throw err;
    }
  }
}

const SpotifyStoreContext = createContext<SpotifyStoreData | null>(null);

export function useSpotifyStore(): SpotifyStoreData {
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
