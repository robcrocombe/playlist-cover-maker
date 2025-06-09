import { type Page, type SimplifiedPlaylist } from '@spotify/web-api-ts-sdk';
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import axios from 'axios';
import cx from 'classnames';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { toast } from 'react-toastify';
import { Modal } from './Modal';
import { queryClient } from './query-client';
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
  const abortCtrl = useRef<AbortController>();

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

      abortCtrl.current = new AbortController();

      await uploadPlaylistCover(selectedPlaylist.id, imageBlob, abortCtrl.current.signal);

      // Update the playlist cover in the query cache
      queryClient.setQueryData<InfiniteData<Page<SimplifiedPlaylist>>>(['playlists'], oldData => {
        if (!oldData) {
          return oldData;
        }

        const newPages = oldData.pages.map<Page<SimplifiedPlaylist>>(page => ({
          ...page,
          items: page.items.map(item => {
            if (item.id === selectedPlaylist.id) {
              // Cleanup previous image blob if it exists
              if (item.images?.[0]?.url.startsWith('blob:')) {
                URL.revokeObjectURL(item.images[0].url);
              }

              return {
                ...item,
                images: [
                  {
                    url: URL.createObjectURL(imageBlob),
                    width: 640,
                    height: 640,
                  },
                ],
              };
            }
            return item;
          }),
        }));

        return { pages: newPages, pageParams: oldData.pageParams };
      });

      toast.success('Playlist cover uploaded successfully.');
      setImageBlob(undefined);
      setOpen(false);
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Error uploading cover:', err);
        toast.error('Failed to upload playlist cover. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  function cancel() {
    if (abortCtrl.current) {
      abortCtrl.current.abort();
      abortCtrl.current = undefined;
    }
    setImageBlob(undefined);
    setIsLoading(false);
    setOpen(false);
  }

  return (
    <Modal
      title="Set Playlist Cover"
      open={open}
      onClose={close}
      actions={[
        <button
          className={cx('button is-primary', { 'is-loading': isLoading })}
          type="button"
          onClick={submit}
          disabled={isFetching || isLoading || !selectedPlaylist || !imageBlob}>
          Upload cover
        </button>,
        <button className="button" onClick={cancel}>
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
              step={0.01}
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
