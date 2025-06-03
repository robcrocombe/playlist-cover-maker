import { useInfiniteQuery } from '@tanstack/react-query';
import cx from 'classnames';
import { useEffect, useMemo, useState, type RefObject } from 'react';
import { toast } from 'react-toastify';
import { Modal } from './Modal';
import { useSpotifyStore } from './SpotifyStore';
import { getImageBlob, getResizedCanvas } from './utils';

interface UploadModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  canvasRef: RefObject<HTMLCanvasElement>;
}

export function UploadModal({ open, setOpen, canvasRef }: UploadModalProps): JSX.Element {
  const { getPlaylists, uploadPlaylistCover } = useSpotifyStore();

  const { data, isFetching } = useInfiniteQuery({
    queryKey: ['playlists'],
    queryFn: ({ pageParam }) => getPlaylists(pageParam),
    enabled: open,
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      if (lastPage) {
        const nextOffset = lastPage.offset + lastPage.limit;
        return nextOffset < lastPage.total ? nextOffset : undefined;
      }
    },
  });

  const results = useMemo(() => {
    if (!data?.pages) {
      return [];
    }
    return data.pages.flatMap(page => page?.items || []);
  }, [data?.pages]);

  const [isLoading, setIsLoading] = useState(false);
  const [quality, setQuality] = useState(0.95);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const selectedPlaylist = results[selectedIndex];

  const [imageBlob, setImageBlob] = useState<Blob>();

  useEffect(() => {
    if (!open || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const resizedCanvas = getResizedCanvas(canvas, 640, 640);

    getImageBlob(resizedCanvas, quality)
      .then(blob => setImageBlob(blob))
      .catch(err => {
        console.error('Error getting image blob:', err);
        toast.error('Failed to process image. Please try again.');
      });
  }, [open, quality]);

  async function submit() {
    if (!selectedPlaylist?.id || !canvasRef.current || !imageBlob) {
      return;
    }

    try {
      setIsLoading(true);

      await uploadPlaylistCover(selectedPlaylist.id, imageBlob);

      toast.success('Playlist cover uploaded successfully!');
      setOpen(false);
    } catch (error) {
      console.error('Error uploading cover:', error);
      toast.error('Failed to upload playlist cover. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      title="Set Playlist Cover"
      open={open}
      setOpen={setOpen}
      actions={[
        <button
          className={cx('button is-primary', { 'is-loading': isLoading })}
          type="button"
          onClick={submit}
          disabled={isFetching || isLoading || !selectedPlaylist || !imageBlob}>
          Upload cover
        </button>,
        <button className="button" onClick={() => setOpen(false)}>
          Cancel
        </button>,
      ]}>
      <div>
        <div className="field">
          <label className="label" htmlFor="playlist-select">
            Select playlist
          </label>
          <div className="select">
            <select
              id="playlist-select"
              disabled={isFetching}
              value={selectedIndex}
              onChange={e => setSelectedIndex(Number(e.target.value))}>
              {isFetching && <option value="0" />}
              {!isFetching &&
                results.map((item, index) => (
                  <option key={index} value={index}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="quality-input">
            Image quality
          </label>
          <div className="control">
            <input
              id="quality-input"
              className="input"
              type="number"
              min={0.1}
              max={1}
              step={0.05}
              value={quality}
              onChange={e => setQuality(parseFloat(e.target.value))}
              style={{ width: '150px' }}
            />
          </div>
          {!!imageBlob?.size && (
            <p className="help">Aprox. {(imageBlob.size / 1024).toFixed(2)} KB</p>
          )}
          <p className="help">
            Higher quality results in a larger file size, max 256 KB. Recommend 0.95
          </p>
        </div>
      </div>
    </Modal>
  );
}
