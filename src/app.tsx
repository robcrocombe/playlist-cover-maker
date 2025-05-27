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
        <SearchPanel />
        <div className="divider" />
        <DesignPanel />
      </main>
    </SpotifyStoreProvider>
  );
}
