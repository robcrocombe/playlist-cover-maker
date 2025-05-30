import { type Page, type SimplifiedAlbum, type SimplifiedPlaylist } from '@spotify/web-api-ts-sdk';
import { useInfiniteQuery } from '@tanstack/react-query';
import cx from 'classnames';
import { useEffect, useState, type FormEvent } from 'react';
import { ListItem } from './AlbumList';
import { useAppStore } from './AppStore';
import { Icon } from './Icon';
import { useSpotifyStore } from './SpotifyStore';

export function SearchPanel2(): JSX.Element {
  return <PlaylistPanel />;
}

export function SearchPanel(): JSX.Element {
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { albums, setAlbums } = useAppStore();
  const { searchAlbums } = useSpotifyStore();

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['search', searchTerm],
    queryFn: ({ pageParam }) => searchAlbums(searchTerm, pageParam),
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      if (lastPage?.albums) {
        const nextOffset = lastPage.albums.offset + lastPage.albums.limit;
        return nextOffset < lastPage.albums.total ? nextOffset : undefined;
      }
    },
    enabled: !!searchTerm,
  });

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!!input.trim() && !isFetching) {
      setSearchTerm(input.trim());
    }
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

  const searchResults = data?.pages.flatMap(page => page?.albums?.items || []) || [];

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
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>
        <div className="control">
          <button
            type="submit"
            className={cx('button', { 'is-loading': isFetching && !isFetchingNextPage })}>
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
          {data?.pages && (
            <li className="flex my-4">
              <button
                type="button"
                className={cx('button mx-auto px-6', { 'is-loading': isFetchingNextPage })}
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetching}>
                Load more
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

interface PlaylistPanelProps {}

function PlaylistPanel({}: PlaylistPanelProps): JSX.Element {
  const [playlists, setPlaylists] = useState<Page<SimplifiedPlaylist>>();
  const { getPlaylists } = useSpotifyStore();

  useEffect(() => {
    getPlaylists()
      .then(setPlaylists)
      .catch(err => {
        console.error(err);
      });
  }, []);

  return (
    <div className="results-list">
      <ul className="list has-hoverable-list-items has-overflow-ellipsis has-visible-pointer-controls">
        {playlists?.items?.map(result => {
          return <ListItem key={result.id} item={result}></ListItem>;
        })}
      </ul>
    </div>
  );
}
