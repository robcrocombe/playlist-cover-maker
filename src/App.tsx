import { useAppStore } from './AppStore';
import { Auth } from './Auth';
import { DesignPanel } from './DesignPanel';
import { NavPanel } from './NavPanel';
import { SpotifyStoreProvider } from './SpotifyStore';

export function App(): JSX.Element {
  const { hasSession } = useAppStore();

  if (!hasSession) {
    return <Auth />;
  }

  return (
    <SpotifyStoreProvider>
      <main className="main-container">
        <NavPanel />
        <div className="divider" />
        <DesignPanel />
      </main>
    </SpotifyStoreProvider>
  );
}
