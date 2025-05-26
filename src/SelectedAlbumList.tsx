import { ReactSortable } from 'react-sortablejs';
import { useAppStore } from './AppStore';

export function SelectedAlbumList(): JSX.Element {
  const { albums, setAlbums } = useAppStore();

  return (
    <ul className="list has-overflow-ellipsis has-visible-pointer-controls">
      <ReactSortable
        list={albums}
        setList={setAlbums}
        direction="vertical"
        handle=".drag-handle"
        animation={200}>
        {albums.map(album => {
          return (
            <li className="list-item bg-default" key={album.id}>
              <div className="list-item-image drag-handle">
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
            </li>
          );
        })}
      </ReactSortable>
    </ul>
  );
}
