import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { AlbumList } from './AlbumList';
import { useAppStore } from './AppStore';
import { Icon } from './Icon';
import { UploadModal } from './UploadModal';
import { getImageBlob } from './utils';

export function DesignPanel(): JSX.Element {
  const { albums, setAlbums } = useAppStore();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dlCount = useRef(1);

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

  async function downloadCover() {
    if (!canvasRef.current) {
      return;
    }

    setIsLoading(true);

    try {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `playlist-cover-${dlCount.current}.jpg`;
      dlCount.current += 1;

      const blob = await getImageBlob(canvas, 1);
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error downloading cover:', err);
      toast.error('Failed to download cover');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="design-panel flex flex-column">
      <canvas ref={canvasRef} width="1280" height="1280" className="canvas" />
      <div className="toolbar flex flex-center flex-wrap gap-1h mt-4">
        <button
          type="button"
          className="button is-primary is-outlined"
          disabled={albums.length < 4 || isLoading}
          onClick={downloadCover}>
          <span className="icon">
            <Icon icon="download" />
          </span>
          <span>Download cover</span>
        </button>
        <button
          type="button"
          className="button is-primary is-outlined"
          disabled={albums.length < 4 || isLoading}
          onClick={() => setUploadDialogOpen(true)}>
          <span className="icon">
            <Icon icon="upload" />
          </span>
          <span>Set cover</span>
        </button>
        <button
          type="button"
          className="button"
          disabled={!albums.length}
          onClick={() => setAlbums([])}>
          Reset
        </button>
      </div>
      <AlbumList />
      {albums.length > 1 && (
        <p className="text-center m-2">
          Drag and drop with <span className="drag-hint">⋮</span> to reorder.
        </p>
      )}
      <UploadModal open={uploadDialogOpen} setOpen={setUploadDialogOpen} canvasRef={canvasRef} />
    </div>
  );
}
