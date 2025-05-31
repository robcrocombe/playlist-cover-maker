import cx from 'classnames';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppStore } from './AppStore';
import { fetchToken, getAuthUrl } from './spotify';

export function Auth(): JSX.Element {
  const urlParams = new URLSearchParams(location.search);
  const redirectCode = urlParams.get('code');
  const redirectState = urlParams.get('state');

  const [loading, setLoading] = useState(!!redirectCode && !!redirectState);

  const { startSession } = useAppStore();

  async function submit() {
    setLoading(true);

    try {
      const authUrl = await getAuthUrl();

      setLoading(false);
      location.href = authUrl;
    } catch (err) {
      console.log(err);
      toast.error('Failed to get authorization URL');
      setLoading(false);
    }
  }

  useEffect(() => {
    if (redirectCode && redirectState) {
      const localState = localStorage.getItem('state');

      if (localState !== redirectState) {
        console.error('State mismatch');
        toast.error('State mismatch. Please try again.');
        setLoading(false);
        return;
      }

      // Clear URL params without reloading
      history.replaceState({}, '', location.pathname);

      fetchToken(redirectCode).then(() => {
        startSession();
        toast.success('Logged in successfully.');
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
        disabled={loading}>
        Login with Spotify
      </button>
    </div>
  );
}
