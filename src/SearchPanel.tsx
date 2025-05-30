import { type SimplifiedAlbum, type SimplifiedPlaylist } from '@spotify/web-api-ts-sdk';
import cx from 'classnames';
import { useEffect, useState, type FormEvent } from 'react';
import { ListItem } from './AlbumList';
import { useAppStore } from './AppStore';
import { Icon } from './Icon';
import { fetchPlaylists } from './spotify';
import { useSpotifyStore } from './SpotifyStore';

export function SearchPanel(): JSX.Element {
  return <PlaylistPanel />;
}

export function SearchPanel2(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SimplifiedAlbum[]>([]);
  const [loading, setLoading] = useState(false);

  const { albums, setAlbums } = useAppStore();
  const { searchAlbums } = useSpotifyStore();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!searchTerm.trim() || loading) {
      return;
    }

    setLoading(true);

    const res = await searchAlbums(searchTerm.trim());

    setSearchResults(res || []);
    setLoading(false);
  }

  function addAlbum(album: SimplifiedAlbum) {
    if (albums.length >= 4 || albums.some(a => a.id === album.id)) {
      return;
    }

    setAlbums([...albums, album]);
  }

  function removeAlbum(album: SimplifiedAlbum) {
    setAlbums(albums.filter(a => a.id !== album.id));
  }

  return (
    <div className="search-panel">
      <div className="tabs is-fullwidth is-boxed">
        <ul>
          <li className="is-active">
            <a>
              <span className="icon is-small">
                <Icon icon="playlist" />
              </span>
              <span>Playlists</span>
            </a>
          </li>
          <li>
            <a>
              <span className="icon is-small">
                <Icon icon="search" />
              </span>
              <span>Search</span>
            </a>
          </li>
        </ul>
      </div>
      <form className="field has-addons fill-width px-4" onSubmit={submit}>
        <div className="control fill-width">
          <input
            className="input fill-width"
            type="text"
            placeholder="Search albums…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="control">
          <button type="submit" className={cx('button', { 'is-loading': loading })}>
            Search
          </button>
        </div>
      </form>
      <div className="results-list">
        <ul className="list has-hoverable-list-items has-overflow-ellipsis has-visible-pointer-controls">
          {searchResults.map(result => {
            const isSelected = albums.some(a => a.id === result.id);
            const disabled = albums.length >= 4;

            return (
              <ListItem key={result.id} item={result}>
                {isSelected && (
                  <button type="button" className="button" onClick={() => removeAlbum(result)}>
                    Remove
                  </button>
                )}
                {!isSelected && (
                  <button
                    type="button"
                    className={cx('button', {
                      'is-outlined is-link': !disabled,
                    })}
                    disabled={disabled}
                    onClick={() => addAlbum(result)}>
                    Add Album
                  </button>
                )}
              </ListItem>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

interface PlaylistPanelProps {}

function PlaylistPanel({}: PlaylistPanelProps): JSX.Element {
  const [playlists, setPlaylists] = useState<SimplifiedPlaylist[]>();
  const { token } = useAppStore();

  useEffect(() => {
    fetchPlaylists(token)
      .then(setPlaylists)
      .catch(err => {
        console.error(err);
      });
  }, []);

  return (
    <div className="results-list">
      <ul className="list has-hoverable-list-items has-overflow-ellipsis has-visible-pointer-controls">
        {playlists?.map(result => {
          return <ListItem key={result.id} item={result}></ListItem>;
        })}
      </ul>
    </div>
  );
}
