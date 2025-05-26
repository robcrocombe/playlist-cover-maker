import { useAppStore } from './AppStore';
import { Auth } from './Auth';
import { DesignPanel } from './DesignPanel';
import { SearchPanel } from './SearchPanel';
import { SpotifyStoreProvider } from './SpotifyStore';

export function App(): JSX.Element {
  const { token } = useAppStore();

  if (!token) {
    return <Auth />;
  }

  return (
    <SpotifyStoreProvider>
      <main className="main-container">
        <div className="columns is-6 is-marginless">
          <div className="column is-half">
            <SearchPanel />
          </div>
          <div className="column is-half design-panel">
            <DesignPanel />
          </div>
        </div>
      </main>
    </SpotifyStoreProvider>
  );
}
