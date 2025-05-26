import cx from 'classnames';
import { useState, type FormEvent } from 'react';
import { useAppStore } from './AppStore';
import { fetchToken } from './spotify';

export function Auth(): JSX.Element {
  const [clientId, setClientId] = useState(() => {
    return localStorage.getItem('clientId') || '';
  });
  const [clientSecret, setClientSecret] = useState(() => {
    return localStorage.getItem('clientSecret') || '';
  });
  const [loading, setLoading] = useState(false);

  const { setToken } = useAppStore();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!clientId || !clientSecret) {
      return;
    }

    setLoading(true);

    try {
      const token = await fetchToken(clientId, clientSecret);
      if (token) {
        setToken(token);
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }

  return (
    <form className="m-5 pl-2" style={{ maxWidth: '540px' }} autoComplete="off" onSubmit={submit}>
      <h1 className="title is-3">Playlist Cover Art Maker</h1>
      <div className="field">
        <label className="label" htmlFor="clientId">
          Client ID
        </label>
        <div className="control">
          <input
            type="text"
            className="input"
            value={clientId}
            name="clientId"
            onChange={e => setClientId(e.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <label className="label" htmlFor="clientSecret">
          Client Secret
        </label>
        <div className="control">
          <input
            type="text"
            className="input"
            value={clientSecret}
            name="clientSecret"
            onChange={e => setClientSecret(e.target.value)}
          />
        </div>
      </div>
      <button
        type="submit"
        className={cx('button is-primary mt-2', { 'is-loading': loading })}
        disabled={!clientId || !clientSecret || loading}>
        Auth with Spotify
      </button>
      <p className="mt-3">
        You can get your Client ID and Client Secret from the{' '}
        <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer">
          Spotify developer dashboard
        </a>
        .
      </p>
    </form>
  );
}
