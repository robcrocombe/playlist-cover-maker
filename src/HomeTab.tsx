import { type SimplifiedPlaylist } from '@spotify/web-api-ts-sdk';
import { useInfiniteQuery } from '@tanstack/react-query';
import cx from 'classnames';
import { useMemo } from 'react';
import { ListItem } from './AlbumList';
import { useSpotifyStore } from './SpotifyStore';

interface HomeTabProps {
  addPlaylistTab: SetState<SimplifiedPlaylist>;
}

export function HomeTab({ addPlaylistTab }: HomeTabProps): JSX.Element {
  const { getPlaylists } = useSpotifyStore();

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['playlists'],
    queryFn: ({ pageParam }) => getPlaylists(pageParam),
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      if (lastPage) {
        const nextOffset = lastPage.offset + lastPage.limit;
        return nextOffset < lastPage.total ? nextOffset : undefined;
      }
    },
  });

  const playlists = useMemo(() => {
    if (!data?.pages) {
      return [];
    }
    return data.pages.flatMap(page => page?.items || []);
  }, [data?.pages]);

  return (
    <div className="results-list">
      {isFetching && !isFetchingNextPage && (
        <div className="flex flex-column flex-center my-6 py-6">
          <div className="spinner" />
        </div>
      )}
      <ul className="list has-hoverable-list-items has-overflow-ellipsis has-visible-pointer-controls">
        {playlists.map(result => {
          return (
            <ListItem key={result.id} item={result}>
              <button type="button" className="button" onClick={() => addPlaylistTab(result)}>
                View playlist
              </button>
            </ListItem>
          );
        })}
        {!playlists.length && !isFetching && (
          <li className="flex flex-column flex-center my-6 pt-5">
            <span className="subtitle is-5">No playlists found.</span>
          </li>
        )}
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
  );
}
