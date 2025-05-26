import type { SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
import cx from 'classnames';
import { useState, type FormEvent } from 'react';
import { useAppStore } from './AppStore';
import { useSpotifyStore } from './SpotifyStore';

export function SearchPanel(): JSX.Element {
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
    <div className="fill-width">
      <form className="field has-addons fill-width px-2" onSubmit={submit}>
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
          {searchResults.map((result, index) => {
            const isSelected = albums.some(a => a.id === result.id);
            const disabled = albums.length >= 4;

            return (
              <div className="list-item" key={result.id || index}>
                <div className="list-item-image">
                  <figure className="image is-64x64">
                    <img src={result.images[0].url} alt={result.name} />
                  </figure>
                </div>

                <div className="list-item-content">
                  <div className="list-item-title">{result.name}</div>
                  <div className="list-item-description">
                    {result.artists.map(artist => artist.name).join(', ')}
                  </div>
                </div>

                <div className="list-item-controls">
                  <div className="buttons is-right">
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
                  </div>
                </div>
              </div>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
