
import React, { useState } from 'react';
import { useMenu } from '../context/MenuContext';
import { MenuItem } from '../types';
import { 
  X, DownloadCloud, Loader2, CheckCircle, 
  FileDown, Waves, Star, MapPin, Phone,
  Snowflake, UtensilsCrossed, RefreshCcw
} from 'lucide-react';

const GreekKeyBorder = () => (
  <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none" className="text-greek-gold/40">
    <pattern id="greek-key" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M0 0h20v20H0V0zm2 2v16h16V2H2zm2 2h12v12H4V4zm2 2v8h8V6H6zm2 2h4v4H8V8z" fill="currentColor" fillRule="evenodd" />
    </pattern>
    <rect width="100%" height="20" fill="url(#greek-key)" />
  </svg>
);

const LaurelWreath = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 90c-22.1 0-40-17.9-40-40 0-2.2.2-4.4.5-6.5 1.1-7.5 4.5-14.3 9.5-19.8 1.4-1.5 3.7-1.6 5.2-.2 1.5 1.4 1.6 3.7.2 5.2-4.1 4.5-6.8 10.1-7.7 16.2-.3 1.7-.5 3.5-.5 5.3 0 18.2 14.8 33 33 33s33-14.8 33-33c0-1.8-.2-3.6-.5-5.3-.9-6.1-3.6-11.7-7.7-16.2-1.4-1.5-1.3-3.8.2-5.2 1.5-1.4 3.8-1.3 5.2.2 5 5.5 8.4 12.3 9.5 19.8.3 2.1.5 4.3.5 6.5 0 22.1-17.9 40-40 40z" />
    <path d="M30 45c-2 0-4-1-5-3-1-2 0-4 2-5l10-5c2-1 4 0 5 2s0 4-2 5l-10 5c0 1-1 1-1 1zM70 45c1 0 2 0 3-1l10-5c2-1 3-3 2-5s-3-3-5-2l-10 5c-2 1-3 3-2 5 1 2 2 3 2 3zM25 60c-2 0-4-1-5-3-1-2 0-4 2-5l12-6c2-1 4 0 5 2s0 4-2 5l-12 6c-1 1-2 1-2 1zM75 60c1 0 2 0 3-1l12-6c2-1 3-3 2-5s-3-3-5-2l-12 6c-2 1-3 3-2 5 1 2 2 3 2 3zM25 75c-2 0-4-1-5-3-1-2 0-4 2-5l15-5c2-1 4 0 5 2s0 4-2 5l-15 5c-1 1-2 1-2 1zM75 75c1 0 2 0 3-1l15-5c2-1 3-3 2-5s-3-3-5-2l-15 5c-2 1-3 3-2 5 1 2 2 3 2 3z" />
  </svg>
);

const ColumnSVG = ({ side }: { side: 'left' | 'right' }) => (
  <svg viewBox="0 0 60 800" className={`h-full w-auto ${side === 'left' ? 'mr-4' : 'ml-4'} text-greek-gold/20`} fill="currentColor">
    <rect x="0" y="20" width="60" height="10" />
    <rect x="5" y="30" width="50" height="15" rx="5" />
    <circle cx="15" cy="55" r="10" />
    <circle cx="45" cy="55" r="10" />
    <rect x="10" y="65" width="40" height="5" />
    <rect x="15" y="70" width="5" height="700" />
    <rect x="25" y="70" width="5" height="700" />
    <rect x="35" y="70" width="5" height="700" />
    <rect x="45" y="70" width="5" height="700" />
    <rect x="10" y="70" width="40" height="700" opacity="0.1" />
    <rect x="10" y="770" width="40" height="10" />
    <rect x="5" y="780" width="50" height="10" rx="2" />
    <rect x="0" y="790" width="60" height="10" />
  </svg>
);

interface TablematMenuTemplateProps {
  isPreview?: boolean;
  onClose?: () => void;
}

export const TablematMenuTemplate: React.FC<TablematMenuTemplateProps> = ({ isPreview, onClose }) => {
  const { menuItems, siteContent, siteImages } = useMenu();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Includem toate categoriile vizibile în afară de vinuri conform solicitării
  const filteredCategories = (siteContent.categories || []).filter(cat => 
    !cat.id.startsWith('vinuri') && cat.id !== 'vinul-casei' && cat.id !== 'spumante' && !cat.isHidden
  );

  const handleDownloadPDF = async () => {
    const element = document.getElementById('tablemat-pdf-export');
    if (!element) {
      alert("Eroare: Elementul pentru export nu a fost găsit.");
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    window.scrollTo(0, 0);

    const exporter = (window as any).html2pdf;
    if (!exporter) {
      setIsGenerating(false);
      alert("Eroare: Librăria de export PDF nu a putut fi încărcată.");
      return;
    }

    const date = new Date().toISOString().split('T')[0];
    const opt = {
      margin: 0,
      filename: `Kvala-Tablemat-A3-${date}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 3, 
        useCORS: true, 
        letterRendering: true, 
        backgroundColor: '#ffffff',
        logging: false,
        width: 1587, // A3 width at 96dpi
        height: 1123, // A3 height at 96dpi
      },
      jsPDF: { unit: 'mm', format: 'a3', orientation: 'landscape', compress: true }
    };

    try {
      await exporter().set(opt).from(element).save();
      setIsGenerating(false);
      setIsDone(true);
      setTimeout(() => setIsDone(false), 3000);
    } catch (error) {
      console.error("PDF Export Error:", error);
      setIsGenerating(false);
    }
  };

  const TablematContent = () => {
    // Filtrăm produsele ascunse și asigurăm unicitatea după nume pentru a evita dublurile în PDF
    const visibleMenuItems = menuItems.filter(item => !item.isHidden).reduce((acc: MenuItem[], current) => {
      const x = acc.find(item => item.name === current.name);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    const mainCategories = filteredCategories.filter(cat => cat.id !== 'garnituri' && cat.id !== 'sosuri');
    const bottomCategories = filteredCategories.filter(cat => cat.id === 'garnituri' || cat.id === 'sosuri');

    // Calculăm numărul total de elemente pentru a ajusta dimensiunea fontului
    const totalItems = visibleMenuItems.length;
    const totalCategories = filteredCategories.length;
    
    // Reguli de scalare bazate pe densitate
    let columnCount = 4;
    let fontSizeScale = 1;
    let spacingScale = 1;

    if (totalItems > 60) {
      columnCount = 5;
      fontSizeScale = 0.85;
      spacingScale = 0.8;
    } else if (totalItems > 45) {
      columnCount = 4;
      fontSizeScale = 0.9;
      spacingScale = 0.9;
    }

    return (
      <div id="tablemat-capture-container" className="bg-white p-0 m-0 overflow-hidden" style={{ width: '420mm', height: '297mm', boxSizing: 'border-box', position: 'relative' }}>
        {/* Fundal texturat */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }}></div>
        
        {/* Linii Aurii Elegante */}
        <div className="absolute inset-[4mm] border-2 border-greek-gold/30 pointer-events-none z-20"></div>
        <div className="absolute inset-[6mm] border border-greek-gold/15 pointer-events-none z-20"></div>

        <div className="w-full h-full p-8 relative flex flex-col">
          {/* Header ultra-compact */}
          <div className="flex justify-between items-center mb-2 border-b-4 border-double border-greek-gold/30 pb-3 px-10 relative z-30">
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <LaurelWreath className="absolute inset-0 text-greek-gold/30" />
                <div className="z-10 bg-greek-blue p-3 rounded-2xl text-white shadow-xl">
                  {siteImages.logo ? (
                    <img src={siteImages.logo} alt="Logo" className="h-8 w-8 object-contain brightness-0 invert" />
                  ) : (
                    <UtensilsCrossed className="h-8 w-8" />
                  )}
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-serif font-black text-greek-blue tracking-tighter uppercase leading-none">KVALA</h1>
                <p className="text-xs font-black text-greek-gold tracking-[0.4em] uppercase mt-1">Taverna Urbană • Cotroceni</p>
              </div>
            </div>
            
            <div className="text-center flex-1 px-10">
              <p className="text-2xl font-serif italic text-gray-800 leading-tight">"{siteContent.home.heroTitle}"</p>
              <div className="flex justify-center gap-10 mt-3">
                <div className="flex items-center gap-2 text-greek-blue font-black text-base">
                  <Phone className="h-5 w-5 text-greek-gold" />
                  <span>{siteContent.general.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-greek-blue font-black text-base">
                  <MapPin className="h-5 w-5 text-greek-gold" />
                  <span>{siteContent.general.address}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-2 border-l-4 border-greek-gold/20">
              <div className="bg-white p-1.5 rounded-xl shadow-inner border border-gray-100">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent((siteContent.general.publicUrl || window.location.origin).replace(/\/$/, '') + '/?page=menu')}`} 
                  alt="QR Meniu" 
                  className="w-16 h-16"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="flex flex-col items-start justify-center">
                <p className="text-[10px] font-black text-greek-gold uppercase tracking-[0.4em] leading-none mb-1">Scanează pentru</p>
                <h4 className="text-2xl font-serif font-black text-greek-blue tracking-tighter uppercase leading-none">MENIU CU POZE</h4>
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Vă dorim poftă bună!</p>
              </div>
            </div>
          </div>

          {/* Layout dinamic pe coloane */}
          <div 
            className="space-y-2 relative overflow-visible z-30 px-10 flex-1"
            style={{ 
              columnCount: columnCount, 
              columnGap: '2rem',
              fontSize: `${fontSizeScale}rem` 
            }}
          >
            {mainCategories.map((cat, catIdx) => {
              const items = visibleMenuItems.filter(i => i.category === cat.id);
              if (items.length === 0) return null;

              return (
                <div key={cat.id} className="break-inside-avoid mb-4 flex flex-col" style={{ marginBottom: `${1.5 * spacingScale}rem` }}>
                  <div className="flex items-center gap-2 mb-2 border-b-2 border-greek-gold/30 pb-1">
                    <h2 className="font-serif font-black text-greek-blue uppercase tracking-tight whitespace-nowrap" style={{ fontSize: `${22 * fontSizeScale}px` }}>
                      {cat.label}
                    </h2>
                    <div className="h-px bg-greek-gold/20 flex-1"></div>
                  </div>
                  
                  <div className="space-y-2" style={{ gap: `${0.5 * spacingScale}rem` }}>
                    {items.map(item => {
                      const isSpecial = item.isHighlighted;
                      return (
                        <div key={item.id} className={`group break-inside-avoid ${isSpecial ? 'bg-greek-blue/5 p-2 rounded-xl -mx-1 border border-greek-gold/20 shadow-sm' : ''}`}>
                          <div className="flex justify-between items-baseline gap-2 mb-0.5">
                            <div className="flex-1 flex items-baseline gap-2 overflow-hidden">
                              <h3 className="font-serif font-black text-gray-900 uppercase leading-none tracking-tight truncate" style={{ fontSize: `${(isSpecial ? 15 : 14) * fontSizeScale}px` }}>
                                {item.name}
                                {isSpecial && <Star className="inline-block h-3 w-3 ml-1 text-greek-gold fill-greek-gold" />}
                                {item.name.toLowerCase().includes('cartofi prăjiți') && <Snowflake className="inline-block h-3 w-3 ml-1 text-blue-400" />}
                              </h3>
                              {item.weight && (
                                <span className="font-black text-greek-gold uppercase tracking-widest shrink-0" style={{ fontSize: `${10 * fontSizeScale}px` }}>
                                  {item.weight}
                                  {item.calories && (
                                    <span className="ml-2 text-gray-400">
                                      / {item.calories.toString().toLowerCase().includes('kcal') ? item.calories : `${item.calories} kcal`}
                                    </span>
                                  )}
                                </span>
                              )}
                              {!item.weight && item.calories && (
                                <span className="font-black text-gray-400 uppercase tracking-widest shrink-0" style={{ fontSize: `${10 * fontSizeScale}px` }}>
                                  {item.calories.toString().toLowerCase().includes('kcal') ? item.calories : `${item.calories} kcal`}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="font-serif font-black text-greek-blue" style={{ fontSize: `${(isSpecial ? 17 : 16) * fontSizeScale}px` }}>{item.price}</span>
                              <span className="font-black text-greek-blue/40" style={{ fontSize: `${9 * fontSizeScale}px` }}>LEI</span>
                            </div>
                          </div>
                          {(item.description || isSpecial) && (
                            <p className="text-gray-700 leading-tight font-medium italic mb-0" style={{ fontSize: `${(isSpecial ? 12 : 11) * fontSizeScale}px` }}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Randul de jos pentru Garnituri & Sosuri - Ridicat pentru a nu se tăia cu bordura de jos */}
          {bottomCategories.length > 0 && (
            <div className="mt-2 pt-2 border-t-2 border-greek-blue/20 px-10 relative z-30">
              {(() => {
                const allBottomItems = visibleMenuItems.filter(i => 
                  bottomCategories.some(cat => cat.id === i.category)
                );
                
                if (allBottomItems.length === 0) return null;

                return (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-[22px] font-serif font-black text-greek-blue uppercase tracking-tight whitespace-nowrap">
                        {bottomCategories.map(c => c.label).join(' & ')}
                      </h2>
                      <div className="h-px bg-greek-gold/20 flex-1"></div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-x-12 gap-y-3">
                      {allBottomItems.map(item => {
                        const isSpecial = item.isHighlighted;
                        return (
                          <div key={item.id} className={`group ${isSpecial ? 'bg-greek-blue/5 p-2 rounded-xl -mx-1 border border-greek-gold/20 shadow-sm' : ''}`}>
                            <div className="flex justify-between items-baseline gap-2 mb-1">
                              <div className="flex-1 flex items-baseline gap-2 overflow-hidden">
                                <h3 className={`${isSpecial ? 'text-[15px]' : 'text-[14px]'} font-serif font-black text-gray-900 uppercase leading-none tracking-tight truncate`}>
                                  {item.name}
                                  {isSpecial && <Star className="inline-block h-3 w-3 ml-1 text-greek-gold fill-greek-gold" />}
                                  {item.name.toLowerCase().includes('cartofi prăjiți') && <Snowflake className="inline-block h-3 w-3 ml-1 text-blue-400" />}
                                </h3>
                                {item.weight && (
                                  <span className="text-[10px] font-black text-greek-gold uppercase tracking-widest shrink-0">
                                    {item.weight}
                                    {item.calories && (
                                      <span className="ml-2 text-gray-400">
                                        / {item.calories.toString().toLowerCase().includes('kcal') ? item.calories : `${item.calories} kcal`}
                                      </span>
                                    )}
                                  </span>
                                )}
                                {!item.weight && item.calories && (
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">
                                    {item.calories.toString().toLowerCase().includes('kcal') ? item.calories : `${item.calories} kcal`}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className={`${isSpecial ? 'text-[17px]' : 'text-[16px]'} font-serif font-black text-greek-blue`}>{item.price}</span>
                                <span className="text-[9px] font-black text-greek-blue/40">LEI</span>
                              </div>
                            </div>
                            {(item.description || isSpecial) && (
                              <p className={`${isSpecial ? 'text-[12px]' : 'text-[11px]'} text-gray-700 leading-tight font-medium italic mb-0`}>
                                {item.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Container ascuns pentru export PDF - mereu la scară 1:1 */}
      <div style={{ position: 'absolute', left: '-10000px', top: 0, pointerEvents: 'none' }}>
        <div id="tablemat-pdf-export">
          <TablematContent />
        </div>
      </div>

      {isPreview && (
        <div className="fixed inset-0 z-[9999] bg-gray-950/98 backdrop-blur-3xl flex flex-col no-print animate-fade-in">
          <div className="bg-white/10 border-b border-white/10 px-10 py-6 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-6">
              <div className="bg-greek-blue p-4 rounded-2xl shadow-xl border border-white/20">
                {isGenerating ? <Loader2 className="h-8 w-8 animate-spin" /> : <FileDown className="h-8 w-8" />}
              </div>
              <div>
                <h3 className="font-serif font-black text-3xl tracking-tighter leading-none">Set Masă (Tablemat)</h3>
                <p className="text-[10px] text-greek-gold uppercase font-black tracking-[0.4em] mt-2 flex items-center gap-2">
                  <Star className="h-3 w-3 fill-greek-gold" /> Format A3 Landscape • Doar Mâncare
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 bg-white text-greek-blue hover:bg-greek-gold hover:text-white transition-all shadow-2xl"
              >
                <RefreshCcw className="h-4 w-4" /> Înapoi
              </button>
              <button 
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className={`px-10 py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl ${
                  isDone ? 'bg-green-600 text-white' : 'bg-greek-blue text-white hover:bg-blue-600'
                } disabled:opacity-50`}
              >
                {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Se generează...</> : isDone ? <><CheckCircle className="h-4 w-4" /> Descărcat!</> : <><DownloadCloud className="h-4 w-4" /> Descarcă PDF A3</>}
              </button>
              <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all border border-white/10"><X className="h-6 w-6" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-black/70 p-12 flex flex-col items-center justify-start custom-scrollbar">
             <div className="origin-top transition-transform duration-1000 ease-out" style={{ transform: 'scale(0.7)' }}>
                <TablematContent />
             </div>
          </div>
          <style>{`
            #tablemat-capture-container { box-shadow: 0 50px 150px rgba(0,0,0,0.9); border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar { width: 10px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.5); }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.4); border-radius: 20px; }
          `}</style>
        </div>
      )}

      <div className="hidden print:block"><TablematContent /></div>
    </>
  );
};
