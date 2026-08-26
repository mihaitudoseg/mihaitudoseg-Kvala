
import React, { useState, useEffect } from 'react';
import { useMenu } from '../context/MenuContext';
import { motion } from 'motion/react';
import { AlertCircle, Clock, Calendar } from 'lucide-react';
import { isWeekend, isWeekendRestrictedItem } from '../services/menuRules';
import { WeekendBanner } from '../components/WeekendBanner';

interface MenuPageProps {
}

export const MenuPage: React.FC<MenuPageProps> = () => {
  const { menuItems, siteImages, siteContent, activeVariant, t } = useMenu();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const todayIsWeekend = isWeekend();

  const visibleCategories = (siteContent.categories || []).filter(cat => {
    if (cat.isHidden) return false;
    return menuItems.some(item => item.category === cat.id && !item.isHidden);
  });

  useEffect(() => {
    if (visibleCategories.length > 0) {
      if (!activeCategory || !visibleCategories.some(c => c.id === activeCategory)) {
        setActiveCategory(visibleCategories[0].id);
      }
    }
  }, [visibleCategories, activeCategory]);

  const filteredItems = menuItems.filter(item => {
    if (item.isHidden) return false;
    const cat = siteContent.categories?.find(c => c.id === item.category);
    if (cat?.isHidden) return false;

    return item.category === activeCategory;
  });

  const menuStyles = {
    aegean: {
      pageBg: "bg-sand pb-20",
      contentBg: "bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-12",
      categoryBar: "bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2 mb-12 border border-white overflow-x-auto scrollbar-hide sticky top-24 z-20",
      catActive: "bg-greek-blue text-white shadow-xl scale-105",
      catInactive: "text-gray-500 hover:bg-greek-blue/5 hover:text-greek-blue",
      itemTitle: "text-xl md:text-2xl font-serif font-black text-gray-900 group-hover:text-greek-blue transition-colors duration-300 uppercase leading-snug mb-1 md:mb-2 tracking-tight",
      priceText: "text-lg md:text-xl font-black text-greek-blue",
      descText: "text-gray-600 text-sm md:text-base italic mb-3 leading-relaxed first-letter:uppercase font-medium max-w-xl mx-auto",
      imgContainer: "w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-md border-2 border-white group-hover:shadow-greek-blue/20 transition-all duration-500 mb-4 relative bg-gray-100",
      divider: "hidden",
      caloriesBadge: "text-[10px] md:text-xs font-bold text-greek-gold/60 uppercase tracking-widest",
    },
    byzantine: {
      pageBg: "bg-[#090B12] pb-20",
      contentBg: "bg-[#0E111C] rounded-3xl shadow-2xl shadow-greek-gold/5 border border-greek-gold/20 p-6 md:p-12",
      categoryBar: "bg-black/60 backdrop-blur-sm rounded-2xl shadow-lg p-2 mb-12 border border-greek-gold/15 overflow-x-auto scrollbar-hide sticky top-24 z-20",
      catActive: "bg-greek-gold text-gray-950 font-black shadow-xl scale-105",
      catInactive: "text-[#EADBB7]/60 hover:bg-greek-gold/10 hover:text-greek-gold",
      itemTitle: "text-lg md:text-xl font-display font-medium text-greek-gold tracking-widest transition-colors duration-300 uppercase mb-1 md:mb-2",
      priceText: "text-[#F3EFE0] font-sans font-semibold tracking-wide text-base md:text-lg",
      descText: "text-[#EADBB7]/85 text-xs md:text-sm font-serif italic max-w-xl mx-auto leading-relaxed mb-4",
      imgContainer: "max-w-sm w-full aspect-[16/10] rounded-t-2xl rounded-b-2xl overflow-hidden shadow-lg border border-[#EADBB7]/20 group-hover:border-greek-gold/70 transition-all duration-500 mb-4 mx-auto relative bg-[#090B12]",
      divider: "hidden",
      caloriesBadge: "text-[10px] md:text-xs font-bold text-greek-gold uppercase tracking-widest",
    },
    rustic: {
      pageBg: "bg-[#FAF6EE] pb-20",
      contentBg: "bg-[#FFFDF9] rounded-3xl shadow-xl border-2 border-amber-900/10 p-6 md:p-12",
      categoryBar: "bg-amber-100/10 backdrop-blur-sm rounded-2xl shadow-lg p-2 mb-12 border border-amber-900/10 overflow-x-auto scrollbar-hide sticky top-24 z-20",
      catActive: "bg-[#485830] text-[#FCFAF4] font-black",
      catInactive: "text-amber-950/70 hover:bg-[#485830]/15 hover:text-[#485830]",
      itemTitle: "text-lg md:text-xl font-serif font-bold text-[#485830] transition-colors duration-300 mb-1 md:mb-2 tracking-tight",
      priceText: "text-base md:text-lg font-black text-amber-900",
      descText: "text-stone-700 text-xs md:text-sm font-serif italic max-w-xl mx-auto leading-relaxed mb-4",
      imgContainer: "max-w-sm w-full aspect-[16/10] rounded-xl overflow-hidden shadow-md border-[4px] border-white -rotate-0.5 group-hover:rotate-0 transition-transform duration-500 mb-4 mx-auto relative bg-amber-50",
      divider: "hidden",
      caloriesBadge: "text-[10px] md:text-xs font-bold text-amber-900/60 uppercase tracking-widest",
    }
  };

  const m = menuStyles[activeVariant];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${m.pageBg}`}>
      {/* Weekend Availability Banner */}
      <WeekendBanner />

      <div className="h-[40vh] relative bg-gray-900 overflow-hidden">
        <img 
          src={siteImages?.menuHeader} 
          alt="Menu Header" 
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-all duration-500 ${activeVariant === 'byzantine' ? 'opacity-30 brightness-50' : 'opacity-50'}`} 
        />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`text-5xl md:text-7xl font-bold tracking-wider drop-shadow-2xl uppercase mb-4 ${activeVariant === 'byzantine' ? 'font-display text-greek-gold' : 'font-serif text-white'}`}
          >
            {siteContent?.menuPage?.title || t('Meniul Nostru')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className={`text-white/80 text-lg max-w-xl font-medium italic ${activeVariant === 'byzantine' ? 'font-serif text-[#EADBB7]/80' : ''}`}
          >
            {siteContent?.menuPage?.description || t('O experiență culinară autentică.')}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        {visibleCategories.length > 0 && (
          <div className={m.categoryBar}>
            <div className="flex space-x-2 md:justify-center min-w-max">
              {visibleCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-3 rounded-xl font-sans font-black uppercase text-[10px] md:text-xs tracking-widest transition-all duration-300 whitespace-nowrap ${
                    activeCategory === cat.id ? m.catActive : m.catInactive
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Weekend Notice banner when in weekend or viewing categories with restricted items */}
        {activeCategory === 'tigaie-greceasca' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-2xl border flex items-start sm:items-center gap-3 text-xs sm:text-sm ${
              todayIsWeekend
                ? 'bg-red-50/90 border-red-200 text-red-900 shadow-sm'
                : activeVariant === 'byzantine'
                ? 'bg-[#121624] border-greek-gold/30 text-[#EADBB7]'
                : activeVariant === 'rustic'
                ? 'bg-[#F7F2E7] border-amber-900/20 text-amber-950'
                : 'bg-amber-50/90 border-amber-200 text-amber-950'
            }`}
          >
            <AlertCircle className={`w-5 h-5 shrink-0 ${todayIsWeekend ? 'text-red-600' : 'text-greek-gold'}`} />
            <div>
              <span className="font-bold">
                {todayIsWeekend ? '⚠️ ' + t('Indisponibil în weekend') + ': ' : 'ℹ️ ' + t('Notă Weekend') + ': '}
              </span>
              <span>
                {siteContent.home?.weekendNotice || "În weekend (Sâmbătă și Duminică), următoarele produse nu sunt disponibile: Tigaie Grecească de pui, Tigaie Grecească de porc, Gyros de pui, Gyros de porc."}
              </span>
            </div>
          </motion.div>
        )}

        <div className={`transition-all duration-500 ${m.contentBg}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-16">
            {filteredItems.length > 0 ? filteredItems.map((item) => {
              const isRestricted = isWeekendRestrictedItem(item);
              const isUnavailableToday = todayIsWeekend && isRestricted;

              return (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`relative group flex flex-col items-center text-center pb-2 border-b border-gray-100/10 md:border-b-0 last:border-0 last:pb-0 md:pb-0 ${
                  isUnavailableToday ? 'opacity-75' : ''
                }`}
              >
                <div className="w-full max-w-xl">
                  {item.image && (
                    <div className={`${m.imgContainer} ${isUnavailableToday ? 'grayscale-[0.35]' : ''}`}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                        onLoad={(e) => (e.currentTarget.parentElement?.classList.remove('bg-gray-100', 'bg-amber-50', 'bg-[#090B12]'))}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Weekend restriction badge overlay on image */}
                      {isUnavailableToday && (
                        <div className="absolute top-3 left-3 bg-red-600/95 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 backdrop-blur-xs">
                          <Clock className="w-3 h-3" />
                          <span>{t('Indisponibil astăzi (Weekend)')}</span>
                        </div>
                      )}
                      {!todayIsWeekend && isRestricted && (
                        <div className="absolute top-3 left-3 bg-gray-900/85 text-white px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 text-greek-gold" />
                          <span>{t('Disponibil Luni - Vineri')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col items-center mb-2 md:mb-3">
                    <h3 className={m.itemTitle}>
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-3 mb-2 flex-wrap justify-center">
                      <span className={`${m.priceText} ${isUnavailableToday ? 'line-through text-gray-400' : ''}`}>
                        {item.price} Lei
                      </span>
                      {isUnavailableToday && (
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-100">
                          {t('Indisponibil în weekend')}
                        </span>
                      )}
                      {(item.weight || item.calories) && (
                        <>
                          <div className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${activeVariant === 'byzantine' ? 'bg-greek-gold/40' : activeVariant === 'rustic' ? 'bg-[#485830]/40' : 'bg-greek-gold/40'}`}></div>
                          <div className="flex items-center gap-1.5">
                            {item.weight && <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{item.weight}</span>}
                            {item.weight && item.calories && <span className="text-gray-300">|</span>}
                            {item.calories && (
                              <span className={m.caloriesBadge}>
                                {item.calories.toString().toLowerCase().includes('kcal') ? item.calories : `${item.calories} kcal`}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-w-2xl mx-auto">
                    {item.description && (
                      <p className={m.descText}>
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex justify-center gap-3 flex-wrap">
                       {item.isVegetarian && (
                         activeVariant === 'rustic' ? (
                           <span className="text-[9px] font-black uppercase tracking-[0.12em] bg-emerald-50 text-[#485830] px-3 py-1 rounded-md border border-[#485830]/10 shadow-sm">
                             🌿 Grădină
                           </span>
                         ) : activeVariant === 'byzantine' ? (
                           <span className="text-[9px] font-display uppercase tracking-[0.15em] bg-yellow-500/10 text-greek-gold px-3 py-1 rounded border border-greek-gold/20">
                             ✦ Vegetarian
                           </span>
                         ) : (
                           <span className="text-[9px] font-black uppercase tracking-[0.15em] bg-green-50 text-green-600 px-4 py-1 rounded-full border border-green-100 shadow-sm">
                             Vegetarian
                           </span>
                         )
                       )}
                       
                       {/* Sommelier Pairing Recommendation specific to Byzantine luxurious setup */}
                       {activeVariant === 'byzantine' && item.category !== 'vinuri' && item.category !== 'cocktails-fara-alcool' && (
                         <div className="text-[9px] bg-greek-gold/10 text-greek-gold border border-greek-gold/15 px-3 py-1 rounded font-display uppercase tracking-wider">
                           🏺 Sommelier pairing
                         </div>
                       )}
                    </div>
                  </div>
                </div>
                
                {/* Variant-specific Divider */}
                {m.divider !== 'hidden' && (
                  activeVariant === 'byzantine' ? (
                    <div className={`${m.divider} group-last:hidden`}>
                      <div className="w-16 h-px bg-greek-gold/30"></div>
                      <span className="text-greek-gold/40 text-xs">✦</span>
                      <div className="w-16 h-px bg-greek-gold/30"></div>
                    </div>
                  ) : (
                    <div className={`${m.divider}`}></div>
                  )
                )}
              </motion.div>
            );}) : (
              <div className="col-span-2 text-center py-24">
                <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-sm">{t('Niciun preparat în această categorie')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
