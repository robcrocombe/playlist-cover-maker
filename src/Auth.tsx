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

  const { startSession } = useAppStore();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!clientId || !clientSecret) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetchToken(clientId, clientSecret);

      if (res?.access_token && res.expires_in) {
        const expirationTime = Date.now() + res.expires_in * 1000;
        startSession(res.access_token, expirationTime);
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }

  return (
    <form className="m-5 pl-2" style={{ maxWidth: '540px' }} autoComplete="off" onSubmit={submit}>
      <h1 className="title is-3">Playlist Cover Maker</h1>
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
        Get your client ID and client secret from the{' '}
        <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer">
          Spotify Developer dashboard
        </a>
        .
      </p>
    </form>
  );
}
