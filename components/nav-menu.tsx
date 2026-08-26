import React, { useState } from 'react';
import { Menu, X, UtensilsCrossed } from 'lucide-react';
import { Page, DesignVariant } from '../types';
import { useMenu } from '../context/MenuContext';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { siteImages, activeVariant, setActiveVariant, language, setLanguage, t } = useMenu();

  const navItems = [
    { label: t('Acasă'), value: Page.HOME },
    { label: t('Meniu'), value: Page.MENU },
    { label: t('Rezervări'), value: Page.RESERVATIONS },
    { label: t('Contact'), value: Page.CONTACT },
  ];

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setIsOpen(false);
  };

  const navStyles = {
    aegean: {
      bar: "bg-white/95 border-b border-greek-blue/10",
      logo: "text-greek-blue",
      sub: "text-gray-500",
      btnActive: "text-greek-blue border-b-2 border-greek-blue",
      btnInactive: "text-gray-600 hover:text-greek-blue",
      mobileBg: "bg-white border-t border-gray-100",
      mobileActive: "bg-blue-50 text-greek-blue",
      mobileInactive: "text-gray-700 hover:bg-gray-50",
      logoPill: "bg-greek-blue"
    },
    byzantine: {
      bar: "bg-[#090B12]/95 border-b border-greek-gold/30 shadow-lg shadow-greek-gold/5",
      logo: "text-greek-gold font-display tracking-widest",
      sub: "text-[#EADBB7]/60 font-sans",
      btnActive: "text-greek-gold border-b-2 border-greek-gold font-display",
      btnInactive: "text-[#EADBB7]/85 hover:text-greek-gold transition-colors duration-300",
      mobileBg: "bg-[#090B12] border-t border-greek-gold/15",
      mobileActive: "bg-greek-gold/15 text-greek-gold",
      mobileInactive: "text-[#EADBB7]/80 hover:bg-[#141824]",
      logoPill: "bg-greek-gold"
    },
    rustic: {
      bar: "bg-[#FCFAF4]/95 border-b border-[#485830]/15",
      logo: "text-[#485830] tracking-wide",
      sub: "text-amber-950/60 font-serif",
      btnActive: "text-[#485830] border-b-2 border-[#485830]",
      btnInactive: "text-amber-950/80 hover:text-[#485830]",
      mobileBg: "bg-[#FCFAF4] border-t border-amber-900/10",
      mobileActive: "bg-[#485830]/10 text-[#485830]",
      mobileInactive: "text-amber-950/80 hover:bg-amber-100/20",
      logoPill: "bg-[#485830]"
    }
  };

  const s = navStyles[activeVariant];

  const switcherStyles = {
    aegean: "bg-sky-50/50 border border-sky-100/50",
    byzantine: "bg-black/40 border border-greek-gold/20",
    rustic: "bg-amber-100/20 border border-[#485830]/10"
  };

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-sm transition-all duration-500 shadow-md ${s.bar}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group shrink-0"
            onClick={() => handleNavClick(Page.HOME)}
          >
            {siteImages.logo ? (
               <img 
                 src={siteImages.logo} 
                 alt="Kvala Logo" 
                 className="h-10 max-h-12 w-auto max-w-[130px] sm:max-w-[180px] mr-3 object-contain shrink-0" 
               />
            ) : (
               <div className={`${s.logoPill} p-2 rounded-full mr-3 group-hover:opacity-80 transition-all shrink-0`}>
                  <UtensilsCrossed className="h-6 w-6 text-white" />
               </div>
            )}
            <div>
              <span className={`font-serif text-2xl font-bold block leading-none ${s.logo}`}>KVALA</span>
              <span className={`text-[10px] tracking-widest uppercase ${s.sub}`}>Cotroceni</span>
            </div>
          </div>

          {/* Desktop Menu & Switcher */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-12">
            <div className="flex space-x-6 lg:space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleNavClick(item.value)}
                  className={`font-sans text-sm font-semibold tracking-wide transition-colors duration-200 uppercase pb-1 ${
                    currentPage === item.value ? s.btnActive : s.btnInactive
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Design switcher */}
            <div className={`flex items-center gap-0.5 p-0.5 rounded-full ${switcherStyles[activeVariant]} select-none`}>
              {(['aegean', 'byzantine', 'rustic'] as const).map((v) => {
                const labels = { aegean: '🏝️ Egeea', byzantine: '👑 Bizanț', rustic: '🌿 Rustic' };
                const isActive = activeVariant === v;
                return (
                  <button
                    key={v}
                    onClick={() => setActiveVariant(v)}
                    className={`px-2 md:px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                      isActive
                        ? v === 'byzantine'
                          ? 'bg-greek-gold text-gray-950 font-black shadow-sm'
                          : v === 'rustic'
                          ? 'bg-[#485830] text-stone-100'
                          : 'bg-greek-blue text-white'
                        : activeVariant === 'byzantine'
                          ? 'text-gray-500 hover:text-[#EADBB7]'
                          : activeVariant === 'rustic'
                          ? 'text-amber-800/50 hover:text-[#485830]'
                          : 'text-gray-400 hover:text-greek-blue'
                    }`}
                  >
                    {labels[v]}
                  </button>
                );
              })}
            </div>

            {/* Language switcher */}
            <div className={`flex items-center gap-0.5 p-0.5 rounded-full ${switcherStyles[activeVariant]} select-none`}>
              <button
                onClick={() => setLanguage('ro')}
                className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                  language === 'ro'
                    ? activeVariant === 'byzantine'
                      ? 'bg-greek-gold text-gray-950 font-black shadow-sm'
                      : activeVariant === 'rustic'
                      ? 'bg-[#485830] text-stone-100'
                      : 'bg-greek-blue text-white'
                    : activeVariant === 'byzantine'
                      ? 'text-gray-500 hover:text-[#EADBB7]'
                      : activeVariant === 'rustic'
                      ? 'text-amber-800/50 hover:text-[#485830]'
                      : 'text-gray-400 hover:text-greek-blue'
                }`}
              >
                RO
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                  language === 'en'
                    ? activeVariant === 'byzantine'
                      ? 'bg-greek-gold text-gray-950 font-black shadow-sm'
                      : activeVariant === 'rustic'
                      ? 'bg-[#485830] text-stone-100'
                      : 'bg-greek-blue text-white'
                    : activeVariant === 'byzantine'
                      ? 'text-gray-500 hover:text-[#EADBB7]'
                      : activeVariant === 'rustic'
                      ? 'text-amber-800/50 hover:text-[#485830]'
                      : 'text-gray-400 hover:text-greek-blue'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Mobile Right layout (Includes mini switchers and Hamburger) */}
          <div className="md:hidden flex items-center gap-2">
            {/* Tiny Design Switcher for Mobile */}
            <div className={`flex items-center gap-0.5 p-0.5 rounded-full ${switcherStyles[activeVariant]} select-none text-[8px]`}>
              {(['aegean', 'byzantine', 'rustic'] as const).map((v) => {
                const labels = { aegean: 'Egeea', byzantine: 'Bizanț', rustic: 'Rustic' };
                const isActive = activeVariant === v;
                return (
                  <button
                    key={v}
                    onClick={() => setActiveVariant(v)}
                    className={`px-1 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tight transition-all duration-200 ${
                      isActive
                        ? v === 'byzantine'
                          ? 'bg-greek-gold text-gray-950 font-black'
                          : v === 'rustic'
                          ? 'bg-[#485830] text-stone-100'
                          : 'bg-greek-blue text-white'
                        : activeVariant === 'byzantine'
                          ? 'text-gray-500 hover:text-[#EADBB7]'
                          : activeVariant === 'rustic'
                          ? 'text-amber-800/50 hover:text-[#485830]'
                          : 'text-gray-400 hover:text-greek-blue'
                    }`}
                  >
                    {labels[v]}
                  </button>
                );
              })}
            </div>

            {/* Tiny Language Switcher for Mobile */}
            <div className={`flex items-center gap-0.5 p-0.5 rounded-full ${switcherStyles[activeVariant]} select-none text-[8px]`}>
              <button
                onClick={() => setLanguage('ro')}
                className={`px-1 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tight transition-all duration-200 ${
                  language === 'ro'
                    ? activeVariant === 'byzantine'
                      ? 'bg-greek-gold text-gray-950 font-black'
                      : activeVariant === 'rustic'
                      ? 'bg-[#485830] text-stone-100'
                      : 'bg-greek-blue text-white'
                    : activeVariant === 'byzantine'
                      ? 'text-gray-500 hover:text-[#EADBB7]'
                      : activeVariant === 'rustic'
                      ? 'text-amber-800/50 hover:text-[#485830]'
                      : 'text-gray-400 hover:text-greek-blue'
                }`}
              >
                RO
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-1 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tight transition-all duration-200 ${
                  language === 'en'
                    ? activeVariant === 'byzantine'
                      ? 'bg-greek-gold text-gray-950 font-black'
                      : activeVariant === 'rustic'
                      ? 'bg-[#485830] text-stone-100'
                      : 'bg-greek-blue text-white'
                    : activeVariant === 'byzantine'
                      ? 'text-gray-500 hover:text-[#EADBB7]'
                      : activeVariant === 'rustic'
                      ? 'text-amber-800/50 hover:text-[#485830]'
                      : 'text-gray-400 hover:text-greek-blue'
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`${s.btnInactive} focus:outline-none p-1`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className={`md:hidden ${s.mobileBg}`}>
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => handleNavClick(item.value)}
                className={`block w-full text-left px-4 py-3 text-base font-semibold uppercase tracking-wider rounded-xl transition-all ${
                  currentPage === item.value ? s.mobileActive : s.mobileInactive
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Language switcher inside dropdown */}
            <div className="pt-4 border-t border-gray-100/10 flex justify-center px-4">
              <div className={`flex items-center gap-0.5 p-0.5 rounded-full ${switcherStyles[activeVariant]} select-none`}>
                <button
                  onClick={() => setLanguage('ro')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    language === 'ro'
                      ? activeVariant === 'byzantine'
                        ? 'bg-greek-gold text-gray-950 font-black shadow-sm'
                        : activeVariant === 'rustic'
                        ? 'bg-[#485830] text-stone-100'
                        : 'bg-greek-blue text-white'
                      : activeVariant === 'byzantine'
                        ? 'text-gray-500 hover:text-[#EADBB7]'
                        : activeVariant === 'rustic'
                        ? 'text-amber-800/50 hover:text-[#485830]'
                        : 'text-gray-400 hover:text-greek-blue'
                  }`}
                >
                  Română
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    language === 'en'
                      ? activeVariant === 'byzantine'
                        ? 'bg-greek-gold text-gray-950 font-black shadow-sm'
                        : activeVariant === 'rustic'
                        ? 'bg-[#485830] text-stone-100'
                        : 'bg-greek-blue text-white'
                      : activeVariant === 'byzantine'
                        ? 'text-gray-500 hover:text-[#EADBB7]'
                        : activeVariant === 'rustic'
                        ? 'text-amber-800/50 hover:text-[#485830]'
                        : 'text-gray-400 hover:text-greek-blue'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
