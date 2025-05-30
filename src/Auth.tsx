import cx from 'classnames';
import { useEffect, useState } from 'react';
import { useAppStore } from './AppStore';
import { fetchToken, getAuthUrl } from './spotify';

export function Auth(): JSX.Element {
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const urlParams = new URLSearchParams(location.search);
  const redirectCode = urlParams.get('code');
  const redirectState = urlParams.get('state');

  const [loading, setLoading] = useState(!!redirectCode && !!redirectState);

  const { startSession } = useAppStore();

  async function submit() {
    if (!clientId) {
      console.error('Spotify client ID not set.');
      return;
    }

    setLoading(true);

    try {
      const authUrl = await getAuthUrl(clientId);

      setLoading(false);
      location.href = authUrl;
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (redirectCode && redirectState) {
      const localState = localStorage.getItem('state');

      if (localState !== redirectState) {
        console.error('State mismatch');
        setLoading(false);
        return;
      }

      fetchToken(clientId, redirectCode).then(res => {
        if (res?.access_token && res.expires_in && res.refresh_token) {
          const expirationTime = Date.now() + res.expires_in * 1000;
          startSession(res.access_token, expirationTime, res.refresh_token);
        } else {
          console.error('No access token found in response');
        }
      });
    }
  }, [redirectCode]);

  return (
    <div className="auth-container m-5 pl-3 pt-2">
      <h1 className="title is-3">Playlist Cover Maker</h1>
      <button
        type="button"
        className={cx('button is-primary mt-2', { 'is-loading': loading })}
        onClick={submit}
        disabled={!clientId || loading}>
        Login with Spotify
      </button>
    </div>
  );
}
