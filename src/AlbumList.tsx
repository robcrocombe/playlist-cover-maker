import { type SimplifiedAlbum, type SimplifiedPlaylist } from '@spotify/web-api-ts-sdk';
import { type PropsWithChildren } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { useAppStore } from './AppStore';

export function AlbumList(): JSX.Element {
  const { albums, setAlbums } = useAppStore();

  return (
    <ul
      className="list has-hoverable-list-items has-overflow-ellipsis has-visible-pointer-controls fill-width mt-3 mb-1"
      style={{ maxWidth: '640px' }}>
      <ReactSortable
        list={albums}
        setList={setAlbums}
        direction="vertical"
        handle=".drag-handle"
        animation={200}>
        {albums.map(album => {
          return (
            <ListItem key={album.id} item={album}>
              <button className="button is-small drag-handle" title="Drag to reorder">
                <span className="icon">⋮</span>
              </button>
              <button
                className="button is-small"
                title="Remove album"
                onClick={() => setAlbums(albums.filter(a => a.id !== album.id))}>
                Remove
              </button>
            </ListItem>
          );
        })}
      </ReactSortable>
    </ul>
  );
}

interface ListItemProps {
  item: SimplifiedAlbum | SimplifiedPlaylist;
}

export function ListItem({ item, children }: PropsWithChildren<ListItemProps>): JSX.Element {
  const artists = (item as SimplifiedAlbum).artists;
  const tracks = (item as SimplifiedPlaylist).tracks;

  return (
    <li className="list-item bg-default">
      <div className="list-item-image">
        {item.images?.[0]?.url ? (
          <figure className="image is-64x64">
            <img src={item.images?.[0]?.url} alt={item.name} />
          </figure>
        ) : (
          <div className="image is-64x64 cover-placeholder" />
        )}
      </div>
      <div className="list-item-content">
        <div className="list-item-title">{item.name}</div>
        <div className="list-item-description">
          {artists && artists.map(artist => artist.name).join(', ')}
          {tracks && `${tracks.total || 0} ${pluralise('track', tracks.total)}`}
        </div>
      </div>
      {children && (
        <div className="list-item-controls">
          <div className="buttons is-right">{children}</div>
        </div>
      )}
    </li>
  );
}

function pluralise(str: string, count: number | undefined): string {
  return count === 1 ? str : `${str}s`;
}
