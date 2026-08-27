import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMenu } from '../context/MenuContext';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  ImageIcon, 
  Camera,
  UtensilsCrossed
} from 'lucide-react';
import { GalleryImage } from '../types';

export const GalleryPage: React.FC = () => {
  const { galleryImages, siteContent, activeVariant, t } = useMenu();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const images = galleryImages || [];
  const hasImages = images.length > 0;
  const currentImage: GalleryImage | null = lightboxIndex !== null && images[lightboxIndex] ? images[lightboxIndex] : null;

  // Preload previous and next images for buttery smooth browsing
  useEffect(() => {
    if (lightboxIndex === null || images.length <= 1) return;

    const nextIndex = (lightboxIndex + 1) % images.length;
    const prevIndex = (lightboxIndex - 1 + images.length) % images.length;

    if (images[nextIndex]?.url) {
      const imgNext = new Image();
      imgNext.src = images[nextIndex].url;
    }
    if (images[prevIndex]?.url) {
      const imgPrev = new Image();
      imgPrev.src = images[prevIndex].url;
    }
  }, [lightboxIndex, images]);

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }, []);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (images.length === 0) return;
    setLightboxIndex(prev => {
      if (prev === null) return null;
      return (prev - 1 + images.length) % images.length;
    });
  }, [images.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (images.length === 0) return;
    setLightboxIndex(prev => {
      if (prev === null) return null;
      return (prev + 1) % images.length;
    });
  }, [images.length]);

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') {
        handleCloseLightbox();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, handleCloseLightbox, handlePrev, handleNext]);

  // Touch swipe support for mobile & tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;
    const minSwipeDistance = 45; // pixels
    if (diff > minSwipeDistance) {
      handleNext();
    } else if (diff < -minSwipeDistance) {
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Theme styling definitions
  const galleryStyles = {
    aegean: {
      headerBg: "bg-white border-b border-gray-100",
      accent: "text-greek-gold",
      title: "text-gray-900 font-serif",
      subtitle: "text-gray-600",
      cardBorder: "border-gray-100 hover:border-greek-blue/30 shadow-md hover:shadow-xl shadow-gray-200/50",
      cardOverlay: "bg-gradient-to-t from-black/70 via-black/20 to-transparent",
      badge: "bg-greek-blue text-white",
      emptyBox: "bg-white border-gray-200 text-gray-500",
    },
    byzantine: {
      headerBg: "bg-[#0B0E18] border-b border-greek-gold/20",
      accent: "text-greek-gold font-display",
      title: "text-greek-gold font-display tracking-widest",
      subtitle: "text-[#EADBB7]/80 font-serif",
      cardBorder: "border-greek-gold/20 hover:border-greek-gold/60 shadow-lg shadow-black/40",
      cardOverlay: "bg-gradient-to-t from-black/80 via-black/30 to-transparent",
      badge: "bg-greek-gold text-gray-950 font-bold",
      emptyBox: "bg-[#0E111C] border-greek-gold/20 text-[#EADBB7]/70",
    },
    rustic: {
      headerBg: "bg-[#F7F3E9] border-b border-[#485830]/15",
      accent: "text-[#485830]",
      title: "text-amber-950 font-serif",
      subtitle: "text-amber-900/80 font-serif",
      cardBorder: "border-amber-900/15 hover:border-[#485830]/40 shadow-md shadow-amber-950/5",
      cardOverlay: "bg-gradient-to-t from-stone-900/75 via-stone-900/20 to-transparent",
      badge: "bg-[#485830] text-stone-100 font-bold",
      emptyBox: "bg-[#FCFAF4] border-amber-900/20 text-amber-950/70",
    }
  };

  const style = galleryStyles[activeVariant] || galleryStyles.aegean;

  return (
    <div className="min-h-screen pb-24">
      {/* Page Header */}
      <div className={`py-12 md:py-16 px-4 ${style.headerBg} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-[11px] font-bold uppercase tracking-widest mb-3">
            <Camera className="h-3.5 w-3.5" />
            <span>{t('Galerie Foto')}</span>
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight ${style.title}`}>
            {siteContent.galleryPage?.title || t('Galerie Kvala')}
          </h1>
          <p className={`max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed ${style.subtitle}`}>
            {siteContent.galleryPage?.subtitle || t('Momente autentice, preparate proaspete și atmosfera caldă a tavernei noastre din Cotroceni.')}
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 md:mt-14">
        {hasImages ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {images.map((image, index) => (
              <div
                key={image.id || index}
                id={`gallery-thumb-${image.id || index}`}
                onClick={() => handleOpenLightbox(index)}
                className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-gray-100 border transition-all duration-300 transform hover:-translate-y-1 ${style.cardBorder}`}
              >
                {/* Square thumbnail with object-cover */}
                <img
                  src={image.url}
                  alt={image.caption || `Kvala moment ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />

                {/* Hover overlay with zoom icon and caption */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 sm:p-4 ${style.cardOverlay}`}>
                  <div className="flex justify-end">
                    <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white shadow-lg">
                      <Maximize2 className="h-4 w-4" />
                    </span>
                  </div>

                  {image.caption && (
                    <p className="text-white text-xs sm:text-sm font-medium line-clamp-2 drop-shadow-md text-left">
                      {image.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className={`max-w-md mx-auto p-10 rounded-3xl border text-center my-12 shadow-sm ${style.emptyBox}`}>
            <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4 text-gray-400">
              <ImageIcon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-serif font-bold text-gray-800 mb-2">
              {t('Nicio imagine în galerie')}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed mb-6">
              {t('Momentan galeria foto se actualizează. Vă așteptăm cu drag în Cotroceni!')}
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-greek-gold">
              <UtensilsCrossed className="h-4 w-4" />
              <span>Kvala Cotroceni</span>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Fullscreen Popup */}
      {lightboxIndex !== null && currentImage && (
        <div
          id="gallery-lightbox-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Vizualizare imagine"
          onClick={handleCloseLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 md:p-8 select-none transition-all duration-300 animate-fadeIn"
        >
          {/* Lightbox Top Bar */}
          <div className="w-full flex items-center justify-between text-white z-10">
            {/* Counter badge */}
            <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono font-bold tracking-wider">
              {lightboxIndex + 1} / {images.length}
            </div>

            {/* Close button */}
            <button
              id="gallery-lightbox-close-btn"
              type="button"
              onClick={handleCloseLightbox}
              aria-label={t('Închide')}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white transition-transform hover:scale-105 active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Lightbox Center Image Stage */}
          <div 
            className="flex-1 flex items-center justify-center relative w-full my-2 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Previous button (Desktop & Tablet) */}
            {images.length > 1 && (
              <button
                id="gallery-lightbox-prev-btn"
                type="button"
                onClick={handlePrev}
                aria-label={t('Imaginea precedentă')}
                className="hidden sm:flex absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110 active:scale-95 shadow-xl"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Main Preserved-Aspect Image */}
            <div className="relative max-w-5xl max-h-[72vh] sm:max-h-[78vh] flex items-center justify-center p-1">
              <img
                key={currentImage.url}
                src={currentImage.url}
                alt={currentImage.caption || `Kvala Photo ${lightboxIndex + 1}`}
                className="max-h-[70vh] sm:max-h-[76vh] w-auto max-w-full object-contain rounded-xl sm:rounded-2xl shadow-2xl ring-1 ring-white/10"
              />
            </div>

            {/* Next button (Desktop & Tablet) */}
            {images.length > 1 && (
              <button
                id="gallery-lightbox-next-btn"
                type="button"
                onClick={handleNext}
                aria-label={t('Imaginea următoare')}
                className="hidden sm:flex absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110 active:scale-95 shadow-xl"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Bar (Caption + Mobile Controls) */}
          <div 
            className="w-full max-w-3xl mx-auto flex flex-col items-center gap-3 z-10"
            onClick={e => e.stopPropagation()}
          >
            {currentImage.caption && (
              <div className="px-5 py-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-center text-xs sm:text-sm md:text-base font-medium max-w-2xl shadow-lg leading-snug">
                {currentImage.caption}
              </div>
            )}

            {/* Mobile Touch / Tap navigation buttons */}
            {images.length > 1 && (
              <div className="sm:hidden flex items-center justify-center gap-6 pt-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-full bg-white/15 active:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" /> Înapoi
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 rounded-full bg-white/15 active:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  Înainte <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
