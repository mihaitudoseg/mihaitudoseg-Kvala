import React, { useState, useEffect } from 'react';
import { X, Smile } from 'lucide-react';
import { useMenu } from '../context/MenuContext';

export const EventPopup: React.FC = () => {
  const { siteContent, t } = useMenu();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if active and not previously closed in this session (optional, removed session check to allow admin preview essentially)
    // In a real app you might use sessionStorage to prevent showing it on every page reload
    if (siteContent.popup.isActive) {
       // Simple check to not annoy user too much: use sessionStorage
       const hasSeenPopup = sessionStorage.getItem('kvala_popup_seen');
       if (!hasSeenPopup) {
         // Small delay for effect
         const timer = setTimeout(() => setIsVisible(true), 1000);
         return () => clearTimeout(timer);
       }
    } else {
      setIsVisible(false);
    }
  }, [siteContent.popup.isActive]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('kvala_popup_seen', 'true');
  };

  if (!isVisible || !siteContent.popup.isActive) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg overflow-hidden relative animate-fade-in-up transform transition-all">
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-colors shadow-sm"
        >
          <X className="h-5 w-5" />
        </button>

        {siteContent.popup.image && (
          <div className="h-48 md:h-56 w-full relative">
             <img 
               src={siteContent.popup.image} 
               alt="Event" 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
        )}

        <div className="p-8 text-center">
          <h2 className="text-2xl font-serif font-bold text-greek-blue mb-4">
            {siteContent.popup.title}
          </h2>
          <div className="w-16 h-1 bg-greek-gold mx-auto mb-6"></div>
          <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-line">
            {siteContent.popup.message}
          </p>
          <button 
            onClick={handleClose}
            className="group bg-greek-blue text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-600 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 w-full md:w-auto flex items-center justify-center gap-2 mx-auto"
          >
            <span>{t('Super! Mulțumesc')}</span>
            <Smile className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};