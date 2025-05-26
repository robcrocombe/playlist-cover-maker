import { useEffect, useRef } from 'react';
import { useAppStore } from './AppStore';
import { SelectedAlbumList } from './SelectedAlbumList';

export function DesignPanel(): JSX.Element {
  const { albums, setAlbums } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // TODO: add reset button
  // TODO: responsive download/order section
  // TODO: add PNG/JPG download options

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      const size = canvas.width / 2;
      const bgColors = ['#17191C', '#202428', '#343a40', '#41474E'];

      for (let i = 0; i < 4; ++i) {
        const album = albums[i];

        // Draw album cover in a 2x2 grid
        if (album) {
          const x = (i % 2) * size;
          const y = Math.floor(i / 2) * size;
          const image = new Image();
          image.src = album.images[0]?.url || '';

          // Set crossorigin attribute to handle CORS issues with images
          image.setAttribute('crossorigin', 'anonymous');

          image.onload = () => {
            if (context) {
              // Cut off 1px border from the image to avoid edge artifacts
              const borderSize = 1;

              context.drawImage(
                image,
                borderSize,
                borderSize,
                image.width - 2 * borderSize,
                image.height - 2 * borderSize,
                x,
                y,
                size,
                size
              );
            }
          };
        } else {
          // Fill remaining slots with a placeholder
          const x = (i % 2) * size;
          const y = Math.floor(i / 2) * size;
          context.fillStyle = bgColors[i];
          context.fillRect(x, y, size, size);
        }
      }
    }
  }, [albums]);

  function downloadCover() {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'playlist-cover.jpg';
    link.href = canvas.toDataURL('image/jpeg', 1);
    link.click();
    link.remove();
  }

  return (
    <div className="flex flex-center flex-column">
      <canvas ref={canvasRef} width="1280" height="1280" className="canvas" />
      <div className="flex flex-center gap-2 mt-4 fill-width" style={{ maxWidth: '640px' }}>
        <button
          type="button"
          className="button is-primary is-outlined"
          disabled={albums.length < 4}
          onClick={downloadCover}>
          Download Playlist Cover
        </button>
        <button
          type="button"
          className="button"
          disabled={!albums.length}
          onClick={() => setAlbums([])}>
          Reset
        </button>
      </div>
      <SelectedAlbumList />
    </div>
  );
}
