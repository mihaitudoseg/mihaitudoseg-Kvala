
import React from 'react';
import { MapPin, Phone, Mail, Instagram, Facebook, Settings } from 'lucide-react';
import { Page } from '../types';
import { useMenu } from '../context/MenuContext';

interface FooterProps {
  onNavigate?: (page: Page) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { siteContent, activeVariant, t } = useMenu();

  const footerStyles = {
    aegean: {
      bar: "bg-white text-gray-900 border-t border-gray-100",
      accent: "text-greek-gold",
      text: "text-gray-500",
      subAccent: "text-greek-blue",
      subText: "text-gray-400"
    },
    byzantine: {
      bar: "bg-[#07090F] text-[#EADBB7]/90 border-t border-greek-gold/20",
      accent: "text-greek-gold font-display font-medium",
      text: "text-[#EADBB7]/70 font-serif",
      subAccent: "text-greek-gold",
      subText: "text-gray-500"
    },
    rustic: {
      bar: "bg-[#FCFAF4] text-amber-950/90 border-t border-[#485830]/15",
      accent: "text-[#485830] font-sans font-bold",
      text: "text-amber-950/70 font-serif",
      subAccent: "text-amber-900",
      subText: "text-stone-400"
    }
  };

  const f = footerStyles[activeVariant] || footerStyles.aegean;

  return (
    <footer className={`pt-24 pb-12 transition-colors duration-500 ${f.bar}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <h3 className={`text-xs font-light uppercase tracking-[0.3em] mb-8 ${f.accent}`}>{t('Contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mr-4 mt-1" />
                <span className={`text-sm font-light ${f.text}`}>{siteContent.general.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-4" />
                <span className={`text-sm font-light ${f.text}`}>{siteContent.general.phone}</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={`text-xs font-light uppercase tracking-[0.3em] mb-8 ${f.accent}`}>{t('Program')}</h3>
            <p className={`text-sm font-light tracking-wide ${f.text}`}>{siteContent.general.hours}</p>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <h3 className={`font-serif text-3xl font-light mb-4 tracking-[0.1em] ${activeVariant === 'byzantine' ? 'text-greek-gold font-display' : ''}`}>KVALA</h3>
            <p className={`text-[10px] font-light uppercase tracking-[0.4em] mb-8 text-center md:text-right ${f.subText}`}>{siteContent.general.footerTagline}</p>
          </div>
        </div>
        <div className={`border-t border-gray-100/10 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-light uppercase tracking-widest ${f.subText}`}>
          <div>&copy; {new Date().getFullYear()} Kvala Cotroceni.</div>
          {onNavigate && <button onClick={() => onNavigate(Page.ADMIN)} className="flex items-center gap-2 hover:opacity-80 transition-opacity mt-4 md:mt-0"><Settings className="h-3 w-3" /> Admin</button>}
        </div>
      </div>
    </footer>
  );
};
