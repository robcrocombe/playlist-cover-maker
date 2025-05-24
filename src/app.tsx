import { auth } from './api';

export function App(): JSX.Element {
  return (
    <div className="m3">
      <button type="button" className="btn" onClick={auth}>
        Auth with Spotify
      </button>
    </div>
  );
}
