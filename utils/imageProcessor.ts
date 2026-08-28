/**
 * Image processing utilities for Kvala Menu items.
 * Standardizes images to 16:10 aspect ratio, 800x500 resolution, WebP format.
 */

export interface ProcessImageOptions {
  targetAspect?: number; // Default: 16 / 10 = 1.6
  maxWidth?: number;     // Default: 800
  maxHeight?: number;    // Default: 500
  quality?: number;      // Default: 0.85
  minWidth?: number;     // Default: 320 (prevent excessive upscaling)
}

/**
 * Automatically processes a menu product image in the browser:
 * 1. Center-crops to 16:10 aspect ratio (cover behavior)
 * 2. Standardizes to 800 x 500 px (without excessive upscaling if small)
 * 3. Converts to WebP format at ~85% quality
 * 4. Returns a standard File object for authenticated upload
 */
export async function processMenuImage(
  file: File,
  options: ProcessImageOptions = {}
): Promise<File> {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Fișierul selectat nu este o imagine validă.');
  }

  const {
    targetAspect = 16 / 10, // 1.6
    maxWidth = 800,
    maxHeight = 500,
    quality = 0.85,
    minWidth = 320
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        const origWidth = img.naturalWidth || img.width;
        const origHeight = img.naturalHeight || img.height;

        if (!origWidth || !origHeight) {
          throw new Error('Nu s-au putut determina dimensiunile imaginii.');
        }

        const currentAspect = origWidth / origHeight;
        let cropWidth = origWidth;
        let cropHeight = origHeight;
        let cropX = 0;
        let cropY = 0;

        // Center-crop calculation (cover behavior)
        if (currentAspect > targetAspect) {
          // Wider than target ratio: crop sides horizontally
          cropHeight = origHeight;
          cropWidth = origHeight * targetAspect;
          cropX = (origWidth - cropWidth) / 2;
          cropY = 0;
        } else if (currentAspect < targetAspect) {
          // Taller than target ratio: crop top & bottom vertically
          cropWidth = origWidth;
          cropHeight = origWidth / targetAspect;
          cropX = 0;
          cropY = (origHeight - cropHeight) / 2;
        }

        // Determine output dimensions
        // If the source cropped width is smaller than maxWidth, do not upscale excessively
        let outWidth = maxWidth;
        let outHeight = maxHeight;

        if (cropWidth < maxWidth) {
          outWidth = Math.max(Math.round(cropWidth), minWidth);
          outHeight = Math.round(outWidth / targetAspect);
        }

        const canvas = document.createElement('canvas');
        canvas.width = outWidth;
        canvas.height = outHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Nu s-a putut crea contextul Canvas.');
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw cropped portion onto target canvas
        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          outWidth,
          outHeight
        );

        // Generate clean filename with .webp extension
        const rawName = file.name ? file.name.replace(/\.[^/.]+$/, '') : `menu_${Date.now()}`;
        const sanitizedName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
        const webpFilename = `${sanitizedName || 'kvala_item'}.webp`;

        // Export as WebP blob with fallback to JPEG if WebP is unsupported
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File([blob], webpFilename, {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve(processedFile);
            } else {
              // Fallback to JPEG at 0.85
              canvas.toBlob(
                (jpegBlob) => {
                  if (!jpegBlob) {
                    reject(new Error('Eroare la generarea fișierului imagine optimizat.'));
                    return;
                  }
                  const jpegFile = new File([jpegBlob], `${sanitizedName || 'kvala_item'}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  });
                  resolve(jpegFile);
                },
                'image/jpeg',
                quality
              );
            }
          },
          'image/webp',
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Nu s-a putut decoda fișierul imagine.'));
    };

    img.src = objectUrl;
  });
}
