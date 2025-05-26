import {
  type AccessToken,
  type SearchResults,
  type SimplifiedAlbum,
} from '@spotify/web-api-ts-sdk';
import axios from 'axios';

export async function fetchToken(
  clientId: string,
  clientSecret: string
): Promise<AccessToken | undefined> {
  try {
    localStorage.setItem('clientId', clientId);
    localStorage.setItem('clientSecret', clientSecret);

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
    return res.data;
  } catch (err) {
    console.error(err);
  }
}

export async function fetchAlbums(token, query: string): Promise<SimplifiedAlbum[] | undefined> {
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const res = await axios.get<SearchResults<['album']>>('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { q: query, type: 'album' },
    });

    return res.data.albums.items;
  } catch (err) {
    console.error(err);
  }
}
