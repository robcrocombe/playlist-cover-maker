import type { SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
import cx from 'classnames';
import { useState, type FormEvent } from 'react';
import { searchAlbums } from './spotify';

interface SearchPanelProps {}

export function SearchPanel({}: SearchPanelProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SimplifiedAlbum[]>([]);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!searchTerm.trim() || loading) {
      return;
    }

    setLoading(true);

    const res = await searchAlbums(searchTerm.trim());

    if (res) {
      console.log(res);
      setSearchResults(res);
    }
    setLoading(false);
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
      <div className="overflow-auto" style={{ maxHeight: '80vh' }}>
        <ul className="is-paddingless">
          {searchResults.map((result, index) => (
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
                <button className="button is-success is-inverted">Add Album</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
