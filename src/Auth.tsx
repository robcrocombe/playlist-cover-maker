import cx from 'classnames';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppStore } from './AppStore';
import { fetchToken, getAuthUrl } from './spotify';

export function Auth(): JSX.Element {
  const urlParams = new URLSearchParams(location.search);
  const redirectCode = urlParams.get('code');
  const redirectState = urlParams.get('state');

  const [clientId, setClientId] = useState(() => {
    return localStorage.getItem('clientId') || '';
  });

  const [isLoading, setIsLoading] = useState(!!redirectCode && !!redirectState);

  const { startSession } = useAppStore();

  async function submit() {
    if (!clientId.trim()) {
      toast.error('Please enter your Client ID');
      return;
    }

    setIsLoading(true);
    localStorage.setItem('clientId', clientId.trim());

    try {
      const authUrl = await getAuthUrl();

      setIsLoading(false);
      location.href = authUrl;
    } catch (err) {
      console.log(err);
      toast.error('Failed to get authorization URL');
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (redirectCode && redirectState) {
      const localState = localStorage.getItem('state');

      if (localState !== redirectState) {
        console.error('State mismatch');
        toast.error('State mismatch. Please try again.');
        setIsLoading(false);
        return;
      }

      // Clear URL params without reloading
      history.replaceState({}, '', location.pathname);

      fetchToken(redirectCode)
        .then(() => {
          startSession();
          toast.success('Logged in successfully.');
        })
        .catch(err => {
          console.error(err);
          toast.error('Something went wrong. Please try again.');
          setIsLoading(false);
        });
    }
  }, [redirectCode]);

  return (
    <form
      className="auth-container m-5 pt-2"
      style={{ maxWidth: '540px' }}
      autoComplete="off"
      onSubmit={submit}>
      <h1 className="title is-3">Playlist Cover Maker</h1>
      <div className="field">
        <label className="label" htmlFor="clientId">
          Client ID
        </label>
        <div className="control">
          <input
            id="clientId"
            type="text"
            className="input"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
          />
        </div>
      </div>
      <p className="text-14 my-1">
        Get your client ID from the{' '}
        <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer">
          Spotify Developer dashboard
        </a>
        .
      </p>
      <button
        type="submit"
        className={cx('button is-primary mt-2', { 'is-loading': isLoading })}
        disabled={!clientId.trim() || isLoading}>
        Login with Spotify
      </button>
    </form>
  );
}
