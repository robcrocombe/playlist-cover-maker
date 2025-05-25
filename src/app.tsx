import { useMemo } from 'react';
import { DesignPanel } from './DesignPanel';
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
      <div className="m-3">
        <button type="button" className="button is-primary" onClick={getToken}>
          Auth with Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="columns is-6 m-3">
      <div className="column is-half">
        <SearchPanel />
      </div>
      <div className="column is-half design-panel">
        <DesignPanel />
      </div>
    </div>
  );
}
