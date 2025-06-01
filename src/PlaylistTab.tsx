import {
  type PlaylistedTrack,
  type SimplifiedAlbum,
  type SimplifiedPlaylist,
  type Track,
} from '@spotify/web-api-ts-sdk';
import { useInfiniteQuery } from '@tanstack/react-query';
import cx from 'classnames';
import { useMemo } from 'react';
import { ListItem } from './AlbumList';
import { useSpotifyStore } from './SpotifyStore';

interface PlaylistTabProps {
  playlist: SimplifiedPlaylist;
}

export function PlaylistTab({ playlist }: PlaylistTabProps): JSX.Element {
  const { getPlaylistAlbums } = useSpotifyStore();

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['playlistAlbums', playlist.id],
    queryFn: ({ pageParam }) => getPlaylistAlbums(playlist.id, pageParam),
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      if (lastPage) {
        const nextOffset = lastPage.offset + lastPage.limit;
        return nextOffset < lastPage.total ? nextOffset : undefined;
      }
    },
  });

  const albums = useMemo(() => {
    if (!data?.pages) {
      return [];
    }

    const albumSet: Record<string, SimplifiedAlbum> = {};

    for (const page of data.pages) {
      if (!page?.items) {
        continue;
      }

      for (const item of page.items) {
        if (itemIsMusic(item) && item.track?.album && !albumSet[item.track.album.name]) {
          albumSet[item.track.album.name] = item.track.album;
        }
      }
    }

    return Object.values(albumSet);
  }, [data?.pages]);

  return (
    <div className="results-list">
      {isFetching && (
        <div className="flex flex-column flex-center my-6 py-6">
          <div className="spinner" />
        </div>
      )}
      <ul className="list has-hoverable-list-items has-overflow-ellipsis has-visible-pointer-controls">
        {albums.map(result => {
          return (
            <ListItem key={result.id} item={result}>
              <button type="button" className="button" onClick={() => result}>
                Add album
              </button>
            </ListItem>
          );
        })}
        {!albums.length && !isFetching && (
          <li className="flex flex-column flex-center my-6 pt-5">
            <span className="subtitle is-5">No albums found.</span>
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

function itemIsMusic(track: PlaylistedTrack): track is PlaylistedTrack<Track> {
  return track.track?.type === 'track';
}
