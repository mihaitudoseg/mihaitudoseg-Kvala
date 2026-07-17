
import React from 'react';
import { Page } from '../types';
import { ArrowRight, Star, MapPin, FileText } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { motion } from 'motion/react';

interface HomeProps {
  setPage: (page: Page) => void;
}

export const Home: React.FC<HomeProps> = ({ setPage }) => {
  const { siteImages, siteContent, activeVariant, t } = useMenu();

  const homeStyles = {
    aegean: {
      parentBg: "bg-white",
      sectionBg: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-500",
      subtitle: "text-greek-gold font-sans uppercase tracking-[0.5em]",
      titleFont: "font-serif font-light tracking-tight",
      divider: "bg-greek-gold/30 h-px",
      glowOverlay: "absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60",
      imgFrame: "rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100",
      btnPrimary: "px-12 py-4 bg-greek-blue text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-blue-700 transition-all duration-700 rounded-full",
      btnSecondary: "px-12 py-4 border border-gray-900 text-gray-900 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-900 hover:text-white transition-all duration-700 rounded-full",
    },
    byzantine: {
      parentBg: "bg-[#090B12]",
      sectionBg: "bg-[#0E111C]",
      textPrimary: "text-[#EADBB7] font-display",
      textSecondary: "text-[#EADBB7]/70",
      subtitle: "text-greek-gold font-display font-semibold tracking-[0.3em]",
      titleFont: "font-display font-medium tracking-wide",
      divider: "bg-greek-gold/40 h-0.5",
      glowOverlay: "absolute inset-0 bg-gradient-to-t from-[#090B12] via-transparent to-transparent opacity-90",
      imgFrame: "rounded-t-full rounded-b-2xl border-4 border-greek-gold/30 overflow-hidden shadow-2xl shadow-greek-gold/10 hover:border-greek-gold/60 transition-colors duration-1000 max-w-2xl mx-auto",
      btnPrimary: "px-12 py-4 bg-gradient-to-r from-greek-gold to-yellow-600 text-gray-950 text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 hover:shadow-greek-gold/40 transition-all duration-700 border border-greek-gold/50 shadow-lg shadow-greek-gold/10",
      btnSecondary: "px-12 py-4 border border-greek-gold text-greek-gold text-[10px] font-black uppercase tracking-[0.3em] hover:bg-greek-gold/15 transition-all duration-700",
    },
    rustic: {
      parentBg: "bg-[#FAF6EE]",
      sectionBg: "bg-[#FCFAF4]",
      textPrimary: "text-amber-950 font-serif",
      textSecondary: "text-amber-900/75",
      subtitle: "text-[#485830] font-sans font-bold tracking-[0.3em]",
      titleFont: "font-serif font-bold tracking-tight",
      divider: "bg-[#485830]/30 h-1 rounded-full",
      glowOverlay: "absolute inset-0 bg-gradient-to-t from-[#FAF6EE] via-transparent to-[#FAF6EE]/10 opacity-70",
      imgFrame: "rounded-3xl border-8 border-white shadow-2xl rotate-[-1.5deg] hover:rotate-[0deg] transition-all duration-700 max-w-2xl mx-auto",
      btnPrimary: "px-12 py-4 bg-[#485830] text-stone-100 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-emerald-900 transition-all duration-700 rounded-xl",
      btnSecondary: "px-12 py-4 border border-amber-950 text-amber-950 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-amber-950/5 transition-all duration-700 rounded-xl",
    }
  };

  const h = homeStyles[activeVariant];

  return (
    <div className={`flex flex-col transition-colors duration-500 ${h.parentBg}`}>
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: activeVariant === 'byzantine' ? 0.45 : activeVariant === 'rustic' ? 0.75 : 0.8 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src={siteImages.hero}
            alt="Hero" 
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-center transition-all duration-500 ${
              activeVariant === 'byzantine' ? 'brightness-50 grayscale-[0.3]' : activeVariant === 'rustic' ? 'sepia-[0.1]' : 'grayscale-[0.15]'
            }`}
          />
          <div className="absolute inset-0 bg-black/5"></div>
          <div className={h.glowOverlay}></div>
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={`${h.subtitle} text-xs uppercase mb-8`}
          >
            {siteContent.home.heroSubtitle}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className={`text-5xl md:text-8xl leading-none mb-12 max-w-4xl text-center capitalize tracking-tight ${h.titleFont} ${
              activeVariant === 'byzantine' ? 'text-greek-gold' : h.textPrimary
            }`}
          >
            {siteContent.home.heroTitle}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-6 md:gap-8 z-10"
          >
            <button onClick={() => setPage(Page.RESERVATIONS)} className={h.btnSecondary}>
              {t('Rezervă o Masă')}
            </button>
            <button onClick={() => setPage(Page.MENU)} className={h.btnPrimary}>
              {t('Meniu')}
            </button>
          </motion.div>
        </div>
      </div>

      <div className={`py-32 md:py-48 transition-colors duration-500 ${h.sectionBg}`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`text-4xl md:text-6xl text-center mb-10 ${h.titleFont} ${
              activeVariant === 'byzantine' ? 'text-greek-gold' : h.textPrimary
            }`}
          >
            {siteContent.home.storyTitle}
          </motion.h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: 72 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className={`${h.divider} mx-auto mb-16`}
          ></motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6 }}
            className={`leading-relaxed text-lg md:text-2xl mb-20 whitespace-pre-line font-light italic font-serif ${h.textSecondary}`}
          >
            {siteContent.home.storyText}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className={`${h.imgFrame} relative group`}
          >
            <img 
              src={siteImages.story}
              alt="Story" 
              referrerPolicy="no-referrer"
              className={`w-full h-[500px] md:h-[600px] object-cover transition-all duration-1000 ${
                activeVariant === 'byzantine' ? 'grayscale-[0.2] border-2 border-dashed border-greek-gold/10' : 'grayscale-[0.1]'
              } group-hover:grayscale-0 group-hover:scale-105`}
            />
            {activeVariant === 'rustic' && (
              <div className="absolute bottom-4 right-4 bg-white/95 text-stone-900 border border-stone-200 shadow-md font-serif text-sm px-4 py-2 rotate-[2deg] rounded shadow-sm italic hidden md:block">
                 "{t('Acasă în inima bisericii bizantine Cotroceni')}"
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
