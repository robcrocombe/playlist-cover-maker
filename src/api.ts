import axios from 'axios';

declare global {
  interface Window {
    setClient: (clientId: string, secret: string) => void;
  }
}

window.setClient = (clientId: string, secret: string) => {
  localStorage.setItem('clientId', clientId);
  localStorage.setItem('clientSecret', secret);
};

export async function auth() {
  const clientId = localStorage.getItem('clientId');
  const clientSecret = localStorage.getItem('clientSecret');

  if (!clientId || !clientSecret) {
    console.error('Client ID and Secret are required');
    return;
  }

  try {
    const res = await axios.post(
      'https://accounts.spotify.com/api/token',
      {},
      {
        headers: {
          Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        params: {
          grant_type: 'client_credentials',
        },
      }
    );

    localStorage.setItem('token', res.data.access_token);
  } catch (err) {
    console.error(err);
  }
}
