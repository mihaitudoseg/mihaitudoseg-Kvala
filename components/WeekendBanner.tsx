import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { useMenu } from '../context/MenuContext';

interface WeekendBannerProps {
  className?: string;
  variant?: 'full-width' | 'card';
}

export const WeekendBanner: React.FC<WeekendBannerProps> = ({ className = '', variant = 'full-width' }) => {
  const { siteContent, activeVariant, t } = useMenu();

  const noticeText = siteContent?.home?.weekendNotice || 
    "Vă rugăm să luați în considerare că în timpul weekendului, nu sunt disponibile următoarele produse: Tigaie Grecească de pui, Tigaie Grecească de porc, Gyros de pui, Gyros de porc.";

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 shadow-sm flex items-start gap-3.5 ${
          activeVariant === 'byzantine'
            ? 'bg-[#121624] border-greek-gold/30 text-[#EADBB7]'
            : activeVariant === 'rustic'
            ? 'bg-[#F7F2E7] border-amber-900/20 text-amber-950'
            : 'bg-amber-50/95 border-amber-200/90 text-amber-950'
        } ${className}`}
      >
        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
          activeVariant === 'byzantine'
            ? 'bg-greek-gold/20 text-greek-gold'
            : activeVariant === 'rustic'
            ? 'bg-[#485830]/15 text-[#485830]'
            : 'bg-amber-200/80 text-amber-900'
        }`}>
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider ${
              activeVariant === 'byzantine'
                ? 'text-greek-gold font-display'
                : activeVariant === 'rustic'
                ? 'text-[#485830]'
                : 'text-amber-900'
            }`}>
              {t('Notă Disponibilitate Weekend')}
            </span>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed font-medium ${
            activeVariant === 'byzantine'
              ? 'text-[#EADBB7]/90 font-serif'
              : activeVariant === 'rustic'
              ? 'text-amber-950/90 font-serif'
              : 'text-amber-950'
          }`}>
            {noticeText}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full py-3 px-4 sm:px-6 md:px-8 border-b flex items-center justify-center transition-colors duration-300 ${
        activeVariant === 'byzantine'
          ? 'bg-[#121624] border-greek-gold/30 text-[#EADBB7]'
          : activeVariant === 'rustic'
          ? 'bg-[#F4EEE0] border-amber-900/15 text-amber-950'
          : 'bg-amber-50/95 border-amber-200/80 text-amber-950 shadow-xs'
      } ${className}`}
    >
      <div className="max-w-6xl w-full mx-auto flex items-center gap-3 text-xs sm:text-sm">
        <div className={`p-1.5 rounded-lg shrink-0 ${
          activeVariant === 'byzantine'
            ? 'bg-greek-gold/20 text-greek-gold'
            : activeVariant === 'rustic'
            ? 'bg-[#485830]/15 text-[#485830]'
            : 'bg-amber-200/70 text-amber-900'
        }`}>
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="flex-1 leading-snug">
          <span className={`font-black mr-1.5 uppercase tracking-wider text-[10px] sm:text-xs ${
            activeVariant === 'byzantine' ? 'text-greek-gold' : activeVariant === 'rustic' ? 'text-[#485830]' : 'text-amber-900'
          }`}>
            {t('Notă Weekend')}:
          </span>
          <span className="font-medium">
            {noticeText}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
