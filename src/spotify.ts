import {
  type AccessToken,
  type Page,
  type PlaylistedTrack,
  type SearchResults,
  type SimplifiedPlaylist,
} from '@spotify/web-api-ts-sdk';
import axios from 'axios';
import { toast } from 'react-toastify';

export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

// Authorization code with PKCE flow
export async function getAuthUrl(): Promise<string> {
  const codeVerifier = generateRandomId(128);
  const codeChallenge = await getCodeChallenge(codeVerifier);
  const state = generateRandomId(16);

  localStorage.setItem('codeVerifier', codeVerifier);
  localStorage.setItem('state', state);

  const scope = [
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private',
    'ugc-image-upload',
  ].join(',');
  const authUrl = new URL('https://accounts.spotify.com/authorize');

  const params = {
    response_type: 'code',
    client_id: CLIENT_ID,
    scope,
    state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: getRedirectUrl(),
  };

  authUrl.search = new URLSearchParams(params).toString();
  return authUrl.toString();
}

export async function fetchToken(code: string): Promise<void> {
  const codeVerifier = localStorage.getItem('codeVerifier');

  if (!codeVerifier) {
    console.error('No code verifier found');
    toast.error('No code verifier found. Please try again.');
    return;
  }

  const res = await axios.post<AccessToken>(
    'https://accounts.spotify.com/api/token',
    {
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      redirect_uri: getRedirectUrl(),
      code_verifier: codeVerifier,
      code,
    },
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  if (res.data.access_token && res.data.refresh_token) {
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('refreshToken', res.data.refresh_token);
  } else {
    console.error('No access token found in response');
    toast.error('Failed to fetch access token. Please try again.');
    return;
  }
}

export async function refreshToken(): Promise<void> {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    console.error('No refresh token found');
    toast.error('No refresh token found. Please login again.');
    return;
  }

  const res = await axios.post<AccessToken>(
    'https://accounts.spotify.com/api/token',
    {
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    },
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  if (res.data.access_token && res.data.refresh_token) {
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('refreshToken', res.data.refresh_token);
  } else {
    console.error('No access token found in response');
    toast.error('Failed to refresh access token. Please login again.');
  }
}

export async function fetchAlbums(
  token: string,
  query: string,
  offset: number
): Promise<SearchResults<['album']> | undefined> {
  const res = await axios.get<SearchResults<['album']>>('https://api.spotify.com/v1/search', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { q: query, type: 'album', offset },
  });

  return res.data;
}

export async function fetchPlaylists(
  token: string,
  offset: number
): Promise<Page<SimplifiedPlaylist> | undefined> {
  const res = await axios.get<Page<SimplifiedPlaylist>>('https://api.spotify.com/v1/me/playlists', {
    params: { offset },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

export async function fetchPlaylistAlbums(
  token: string,
  playlistId: string,
  offset: number
): Promise<Page<PlaylistedTrack> | undefined> {
  const res = await axios.get<Page<PlaylistedTrack>>(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      params: { offset, limit: 50 },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // const albums = new Set<SimplifiedAlbum>();
  // res.data.items.forEach(item => {
  //   if (itemIsMusic(item) && item.track.album) {
  //     albums.add(item.track.album);
  //   }
  // });

  return res.data;
}

// function itemIsMusic(track: PlaylistedTrack): track is PlaylistedTrack<Track> {
//   return track.track?.type === 'track';
// }

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
