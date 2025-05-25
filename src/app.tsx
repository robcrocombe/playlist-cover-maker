import { useMemo } from 'react';
import { SearchPanel } from './SearchPanel';
import { getToken } from './spotify';

export function App(): JSX.Element {
  const authorised = useMemo(() => {
    const token = localStorage.getItem('token');
    const expires = localStorage.getItem('expires');
    if (!token || !expires || Date.now() > parseInt(expires, 10)) {
      return false;
    }
    return true;
  }, []);

  if (!authorised) {
    return (
      <div className="m3">
        <button type="button" className="button is-primary" onClick={getToken}>
          Auth with Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="columns m2">
      <div className="column">
        <SearchPanel />
      </div>
      <div className="divider" />
      <div className="column">Second column</div>
    </div>
  );
}
