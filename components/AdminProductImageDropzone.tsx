import React, { useState, useRef, useCallback } from 'react';
import { Upload, ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { processMenuImage } from '../utils/imageProcessor';

interface AdminProductImageDropzoneProps {
  itemId: string;
  imageUrl?: string;
  itemName?: string;
  isUploading?: boolean;
  onImageUploaded: (processedFile: File) => Promise<void> | void;
  onRemoveImage?: () => Promise<void> | void;
  className?: string;
}

export const AdminProductImageDropzone: React.FC<AdminProductImageDropzoneProps> = ({
  itemId,
  imageUrl,
  itemName,
  isUploading = false,
  onImageUploaded,
  onRemoveImage,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = useCallback(async (rawFile: File) => {
    if (!rawFile) return;

    if (!rawFile.type.startsWith('image/')) {
      alert('Vă rugăm să selectați un fișier imagine valid (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsProcessingLocal(true);
      // Standardize to 16:10 aspect ratio, 800x500 WebP @ 85%
      const processedFile = await processMenuImage(rawFile);
      await onImageUploaded(processedFile);
    } catch (err: any) {
      console.error('Error processing/uploading image:', err);
      alert(`Eroare la procesarea imaginii: ${err.message || 'Eroare necunoscută'}`);
    } finally {
      setIsProcessingLocal(false);
    }
  }, [onImageUploaded]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragOver(false);

    if (isUploading || isProcessingLocal) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      await handleFileProcess(droppedFile);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileProcess(file);
    }
    // Reset input so re-selecting the same file name triggers change
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Avoid triggering file picker when clicking the delete button
    if ((e.target as HTMLElement).closest('[data-no-picker]')) {
      return;
    }
    if (!isUploading && !isProcessingLocal) {
      fileInputRef.current?.click();
    }
  };

  const busy = isUploading || isProcessingLocal;

  return (
    <div
      id={`dropzone-${itemId}`}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative group cursor-pointer overflow-hidden rounded-xl aspect-[16/10] bg-gray-100 transition-all select-none border ${
        isDragOver
          ? 'border-greek-blue ring-4 ring-greek-blue/30 shadow-lg scale-[1.01]'
          : imageUrl
          ? 'border-gray-200 hover:border-greek-blue/50 hover:shadow-md'
          : 'border-dashed border-gray-300 hover:border-greek-blue hover:bg-blue-50/20'
      } ${className}`}
      title={imageUrl ? 'Click sau trage o imagine pentru a o înlocui (format 16:10)' : 'Click sau trage o imagine aici (format 16:10)'}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        disabled={busy}
        onChange={handleInputChange}
        className="hidden"
        aria-label={`Încarcă imagine pentru ${itemName || 'preparat'}`}
      />

      {/* Existing Image or Placeholder */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={itemName || 'Preparat'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-gray-400 group-hover:text-greek-blue transition-colors">
          <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-blue-50 border border-gray-200 group-hover:border-blue-200 flex items-center justify-center mb-1.5 transition-colors shadow-2xs">
            <ImageIcon className="h-5 w-5 text-gray-400 group-hover:text-greek-blue transition-colors" />
          </div>
          <span className="text-[11px] font-bold text-gray-600 group-hover:text-greek-blue transition-colors leading-tight">
            Adaugă Poză
          </span>
          <span className="text-[9px] text-gray-400 mt-0.5 font-medium tracking-tight">
            Click sau trage fișier (16:10)
          </span>
        </div>
      )}

      {/* 16:10 Ratio Badge / Resolution Hint (Subtle) */}
      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-mono text-white/90 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        16:10 WebP
      </div>

      {/* Default Hover Overlay (when not dragging or busy) */}
      {!isDragOver && !busy && (
        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-bold transition-opacity p-2 text-center">
          <Upload className="h-5 w-5 mb-1 text-white drop-shadow-sm" />
          <span className="leading-tight drop-shadow-sm">
            {imageUrl ? 'Schimbă Poza' : 'Încarcă Poza'}
          </span>
          <span className="text-[9px] font-normal text-white/80 mt-0.5 drop-shadow-xs">
            Trage fișierul aici
          </span>
        </div>
      )}

      {/* Drag & Drop Active Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-30 bg-greek-blue/90 backdrop-blur-xs border-2 border-dashed border-white text-white flex flex-col items-center justify-center p-3 text-center pointer-events-none animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-2 animate-bounce">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <span className="text-xs font-bold leading-tight uppercase tracking-wider text-white drop-shadow-sm">
            Eliberează pentru a încărca imaginea
          </span>
          <span className="text-[10px] text-white/80 mt-1 font-mono">
            Auto-crop 16:10 • WebP
          </span>
        </div>
      )}

      {/* Uploading / Processing Spinner Overlay */}
      {busy && (
        <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-xs text-white flex flex-col items-center justify-center p-3 text-center">
          <Loader2 className="h-6 w-6 text-white animate-spin mb-1.5" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-white">
            {isProcessingLocal ? 'Se optimizează...' : 'Se încarcă...'}
          </span>
          <span className="text-[9px] text-white/80 mt-0.5 font-mono">
            800×500 px • WebP
          </span>
        </div>
      )}

      {/* Delete / Clear Photo Action (Optional) */}
      {imageUrl && onRemoveImage && !busy && (
        <button
          type="button"
          data-no-picker="true"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Doriți să eliminați poza acestui preparat?')) {
              onRemoveImage();
            }
          }}
          className="absolute top-1.5 right-1.5 z-20 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all shadow-sm"
          title="Șterge poza preparatului"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
