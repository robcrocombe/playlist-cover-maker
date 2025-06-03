import { useAppStore } from './AppStore';
import { Auth } from './Auth';
import { DesignPanel } from './DesignPanel';
import { Icon } from './Icon';
import { NavPanel } from './NavPanel';
import { SpotifyStoreProvider } from './SpotifyStore';

export function App(): JSX.Element {
  const { hasSession, endSession } = useAppStore();

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
      <footer className="footer-notes flex flex-center gap-1h m-5 px-5 py-4">
        <button className="button is-small sign-out" type="button" onClick={endSession}>
          <span className="icon">
            <Icon icon="logout" />
          </span>
          <span>Sign out</span>
        </button>
        <a className="site-link" href="https://robcrocombe.com">
          robcrocombe.com
        </a>
      </footer>
    </SpotifyStoreProvider>
  );
}
