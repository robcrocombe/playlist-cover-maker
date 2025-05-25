import type { SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
import cx from 'classnames';
import { useState, type FormEvent } from 'react';
import { useAppStore } from './AppStore';
import { searchAlbums } from './spotify';

export function SearchPanel(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SimplifiedAlbum[]>([]);
  const [loading, setLoading] = useState(false);

  const { albums, setAlbums } = useAppStore();

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
    <div>
      <form className="field has-addons" onSubmit={submit}>
        <div className="control" style={{ width: '80%' }}>
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
      <div className="overflow-auto" style={{ maxHeight: '640px' }}>
        <ul className="is-paddingless">
          {searchResults.map((result, index) => {
            const isSelected = albums.some(a => a.id === result.id);
            const disabled = albums.length >= 4;

            return (
              <li
                key={index}
                className="album-search-result columns is-vcentered"
                style={{ padding: '10px' }}>
                <div className="column is-narrow">
                  <figure className="image is-64x64">
                    <img src={result.images[0].url} alt={result.name} />
                  </figure>
                </div>
                <div className="column">
                  <p className="title is-5">{result.name}</p>
                  <p className="subtitle is-6">
                    {result.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
                <div className="column is-narrow">
                  {isSelected && (
                    <button type="button" className="button" onClick={() => removeAlbum(result)}>
                      Remove
                    </button>
                  )}
                  {!isSelected && (
                    <button
                      type="button"
                      className={cx('button', { 'is-outlined is-inverted is-primary': !disabled })}
                      disabled={disabled}
                      onClick={() => addAlbum(result)}>
                      Add Album
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
