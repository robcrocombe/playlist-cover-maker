export function getImageBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject();
        }
      },
      'image/jpeg',
      quality
    );
  });
}

export function getResizedCanvas(
  canvas: HTMLCanvasElement,
  newWidth: number,
  newHeight: number
): HTMLCanvasElement {
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = newWidth;
  tmpCanvas.height = newHeight;

  const ctx = tmpCanvas.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, newWidth, newHeight);

  return tmpCanvas;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (!reader.result || typeof reader.result !== 'string') {
        return reject(new Error('Failed to convert blob to base64'));
      }
      return resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
