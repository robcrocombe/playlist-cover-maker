import { type SearchResults, type SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
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

export async function getToken() {
  const clientId = localStorage.getItem('clientId');
  const clientSecret = localStorage.getItem('clientSecret');
  const expires = localStorage.getItem('expires');

  if (!clientId || !clientSecret) {
    console.error('Client ID and Secret are required');
    return;
  }

  if (expires && Date.now() < parseInt(expires, 10)) {
    console.log('Token is still valid, skipping request');
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

    const expirationTime = Date.now() + res.data.expires_in * 1000;

    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('expires', expirationTime.toString());

    location.reload();
  } catch (err) {
    console.error(err);
  }
}

export async function searchAlbums(q: string): Promise<SimplifiedAlbum[] | undefined> {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const res = await axios.get<SearchResults<['album']>>('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { q, type: 'album' },
    });

    return res.data.albums.items;
  } catch (err) {
    console.error(err);
  }
}
