import {
  type AccessToken,
  type Page,
  type SearchResults,
  type SimplifiedAlbum,
  type SimplifiedPlaylist,
} from '@spotify/web-api-ts-sdk';
import axios from 'axios';

// Authorization code with PKCE flow
export async function getAuthUrl(clientId: string): Promise<string> {
  const codeVerifier = generateRandomId(128);
  const codeChallenge = await getCodeChallenge(codeVerifier);
  const state = generateRandomId(16);

  localStorage.setItem('codeVerifier', codeVerifier);
  localStorage.setItem('state', state);

  const scope = 'playlist-read-private';
  const authUrl = new URL('https://accounts.spotify.com/authorize');

  const params = {
    response_type: 'code',
    client_id: clientId,
    scope,
    state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: getRedirectUrl(),
  };

  authUrl.search = new URLSearchParams(params).toString();
  return authUrl.toString();
}

export async function fetchToken(clientId: string, code: string): Promise<AccessToken | undefined> {
  try {
    const codeVerifier = localStorage.getItem('codeVerifier');

    const res = await axios.post(
      'https://accounts.spotify.com/api/token',
      {
        client_id: clientId,
        grant_type: 'authorization_code',
        redirect_uri: getRedirectUrl(),
        code_verifier: codeVerifier,
        code,
      },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
}

export async function fetchAlbums(
  token: string | undefined,
  query: string
): Promise<SimplifiedAlbum[] | undefined> {
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

export async function fetchPlaylists(
  token: string | undefined
): Promise<SimplifiedPlaylist[] | undefined> {
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const res = await axios.get<Page<SimplifiedPlaylist>>(
      'https://api.spotify.com/v1/me/playlists',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data.items;
  } catch (err) {
    console.error(err);
  }
}

function getRedirectUrl(): string {
  return new URL(location.pathname, location.href).href;
}

async function getCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashed = await crypto.subtle.digest('SHA-256', data);

  return btoa(String.fromCharCode(...new Uint8Array(hashed)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function generateRandomId(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}
