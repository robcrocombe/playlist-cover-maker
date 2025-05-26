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
            <li className="list-item bg-default" key={album.id}>
              <div className="list-item-image">
                <figure className="image is-64x64">
                  <img src={album.images[0].url} alt={album.name} />
                </figure>
              </div>
              <div className="list-item-content">
                <div className="list-item-title">{album.name}</div>
                <div className="list-item-description">
                  {album.artists.map(artist => artist.name).join(', ')}
                </div>
              </div>
              <div className="list-item-controls">
                <div className="buttons is-right">
                  <button className="button is-small drag-handle" title="Drag to reorder">
                    <span className="icon">⋮</span>
                  </button>
                  <button
                    className="button is-small"
                    title="Remove album"
                    onClick={() => setAlbums(albums.filter(a => a.id !== album.id))}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ReactSortable>
    </ul>
  );
}
