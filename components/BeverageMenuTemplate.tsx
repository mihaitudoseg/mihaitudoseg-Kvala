
import React, { useState } from 'react';
import { useMenu } from '../context/MenuContext';
import { MenuItem } from '../types';
import { 
  X, Phone, 
  DownloadCloud, Star,
  Loader2, CheckCircle, Waves,
  FileDown, Coffee, GlassWater, RefreshCcw
} from 'lucide-react';

interface BeverageMenuTemplateProps {
  isPreview?: boolean;
  onClose?: () => void;
}

const PageWrapper: React.FC<{ children?: React.ReactNode; pageNumber: number }> = ({ children, pageNumber }) => (
  <div className="pdf-page bg-[#fdfcf8] relative overflow-hidden flex flex-col" 
       style={{ 
         width: '210mm', 
         height: '296.8mm', // Slightly less than 297mm to prevent extra page in some PDF engines
         margin: '0',
         padding: '0',
         boxSizing: 'border-box',
         position: 'relative'
       }}>
    {/* Background Texture */}
    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }}></div>
    
    {/* Ornate Borders */}
    <div className="absolute inset-4 border-[1px] border-greek-gold/30 pointer-events-none"></div>
    <div className="absolute inset-6 border-[3px] border-greek-blue/10 pointer-events-none"></div>
    <div className="absolute inset-[30px] border-[1px] border-greek-gold/20 pointer-events-none"></div>
    
    {/* Corner Ornaments - Refined & Larger */}
    <div className="absolute top-6 left-6 w-20 h-20 border-t-[6px] border-l-[6px] border-greek-gold/40 rounded-tl-sm"></div>
    <div className="absolute top-6 right-6 w-20 h-20 border-t-[6px] border-r-[6px] border-greek-gold/40 rounded-tr-sm"></div>
    <div className="absolute bottom-6 left-6 w-20 h-20 border-b-[6px] border-l-[6px] border-greek-gold/40 rounded-bl-sm"></div>
    <div className="absolute bottom-6 right-6 w-20 h-20 border-b-[6px] border-r-[6px] border-greek-gold/40 rounded-br-sm"></div>
    
    {/* Greek Meander Pattern (Subtle) */}
    <div className="absolute top-0 left-0 w-full h-2 bg-greek-blue/5"></div>
    <div className="absolute bottom-0 left-0 w-full h-2 bg-greek-blue/5"></div>
    
    <div className="relative z-10 px-16 py-14 h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      
      <div className="mt-auto pt-6 flex justify-between items-center border-t-2 border-greek-gold/20 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[12px] font-black text-greek-blue uppercase tracking-[0.6em]">KVALA TAVERNA URBANA</span>
          <div className="h-2 w-2 rounded-full bg-greek-gold"></div>
          <span className="text-[12px] font-black text-greek-blue/60 uppercase tracking-[0.6em]">EST. 2024</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-[1px] bg-greek-gold/40"></div>
          <span className="text-sm font-serif italic text-greek-gold font-bold">Pagina {pageNumber}</span>
          <div className="w-10 h-[1px] bg-greek-gold/40"></div>
        </div>
      </div>
    </div>
  </div>
);

export const BeverageMenuTemplate: React.FC<BeverageMenuTemplateProps> = ({ isPreview, onClose }) => {
  const { menuItems, siteContent, siteImages } = useMenu();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const excludedCategories = ['aperitive', 'din-mare', 'tigaie-greceasca', 'specialitati', 'salate', 'desert', 'garnituri', 'sosuri', 'vinuri', 'bere'];
  const beverageItems = menuItems.filter(item => !excludedCategories.includes(item.category) && !item.isHidden);
  
  const categories = siteContent.categories.filter(c => !excludedCategories.includes(c.id));
  
  const handleDownloadPDF = async () => {
    const element = document.getElementById('beverage-pdf-container');
    if (!element) return;

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
      filename: `Kvala-Meniu-Bauturi-${date}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
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

  const BeverageContent = () => {
    const totalItems = beverageItems.length;
    
    // Dynamic scaling to fill the page while ensuring single page fit
    let columnCount = 2;
    let fontSizeScale = 1.0; 
    let spacingScale = 1.0; 

    // Adjust scaling based on item count to fill the page
    if (totalItems > 65) {
      fontSizeScale = 0.65;
      spacingScale = 0.4;
    } else if (totalItems > 55) {
      fontSizeScale = 0.75;
      spacingScale = 0.55;
    } else if (totalItems > 45) {
      fontSizeScale = 0.85;
      spacingScale = 0.75;
    } else if (totalItems > 35) {
      fontSizeScale = 0.95;
      spacingScale = 0.9;
    }

    return (
      <div id="beverage-pdf-container" className="bg-[#fdfcf8]" style={{ width: '210mm', height: '296.8mm', overflow: 'hidden' }}>
        <PageWrapper pageNumber={1}>
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 relative">
              <div className="absolute -inset-4 border border-greek-gold/20 rounded-full"></div>
              <div className="p-4 border-2 border-greek-blue/20 bg-white rounded-full shadow-inner relative">
                <GlassWater className="h-12 w-12 text-greek-blue" />
              </div>
            </div>
            <h1 className="text-5xl font-serif font-black text-greek-blue tracking-tight mb-2 uppercase text-center">
              LISTĂ BĂUTURI
            </h1>
            <div className="flex items-center gap-6 mb-4">
               <div className="w-16 h-[2px] bg-greek-gold/40"></div>
               <p className="text-xs font-black text-greek-gold tracking-[0.5em] uppercase">Răcoritoare & Alcoolice</p>
               <div className="w-16 h-[2px] bg-greek-gold/40"></div>
            </div>
          </div>

          <div 
            className="gap-x-12"
            style={{ 
              columnCount: columnCount,
              fontSize: `${fontSizeScale}rem`,
              lineHeight: '1.25'
            }}
          >
            {categories.map(cat => {
              const itemsInCategory = beverageItems.filter(i => i.category === cat.id);
              if (itemsInCategory.length === 0) return null;

              return (
                <div key={cat.id} className="mb-10 break-inside-avoid">
                  <div className="flex flex-col mb-4">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-2.5 h-2.5 rotate-45 bg-greek-gold"></div>
                      <h2 className="font-serif font-black text-greek-blue uppercase tracking-widest border-b-2 border-greek-gold/30 pb-1 flex-1" style={{ fontSize: `${18 * fontSizeScale}px` }}>
                        {cat.label}
                      </h2>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {itemsInCategory.map((item) => (
                      <div key={item.id} className="group relative" style={{ marginBottom: `${1.5 * spacingScale}rem` }}>
                        <div className="flex justify-between items-baseline gap-4 mb-1">
                          <h3 className="font-serif font-bold text-gray-900 uppercase tracking-tight leading-tight flex-1" style={{ fontSize: `${16 * fontSizeScale}px` }}>
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0 bg-greek-blue/5 px-2 py-0.5 rounded border border-greek-blue/10">
                            <span className="font-serif font-black text-greek-blue" style={{ fontSize: `${16 * fontSizeScale}px` }}>{item.price}</span>
                            <span className="font-black text-greek-blue/30" style={{ fontSize: `${10 * fontSizeScale}px` }}>LEI</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-start gap-4">
                          {item.description && (
                            <p className="text-gray-600 italic leading-tight flex-1 font-medium" style={{ fontSize: `${11 * fontSizeScale}px` }}>
                              {item.description}
                            </p>
                          )}
                          {item.weight && (
                            <span className="font-black text-greek-gold/80 uppercase tracking-[0.1em] shrink-0 mt-0.5" style={{ fontSize: `${9 * fontSizeScale}px` }}>
                              {item.weight}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 w-full h-[0.5px] bg-greek-gold/10"></div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-8 text-center pb-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-6 w-full max-w-sm">
                <div className="flex-1 h-[1px] bg-greek-gold/20"></div>
                <p className="text-xs font-serif italic text-greek-gold/70 font-bold">"Bucură-te de fiecare înghițitură."</p>
                <div className="flex-1 h-[1px] bg-greek-gold/20"></div>
              </div>
              <div className="flex justify-center gap-6 text-greek-gold/40">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>
          </div>
        </PageWrapper>
      </div>
    );
  };

  if (isPreview) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-950/98 backdrop-blur-3xl flex flex-col no-print animate-fade-in">
        <div className="bg-white/10 border-b border-white/10 px-10 py-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-6">
            <div className="bg-greek-blue p-4 rounded-2xl shadow-xl">
              <GlassWater className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-3xl">Meniu Băuturi A4</h3>
              <p className="text-[10px] text-greek-gold uppercase font-black tracking-widest">Format Portrait</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="px-8 py-4 rounded-xl font-black text-xs uppercase flex items-center gap-3 bg-white text-greek-blue hover:bg-greek-gold hover:text-white transition-all shadow-2xl"
            >
              <RefreshCcw className="h-4 w-4" /> Înapoi
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className={`px-8 py-4 rounded-xl font-black text-xs uppercase flex items-center gap-3 transition-all ${
                isDone ? 'bg-green-600' : 'bg-greek-blue hover:bg-blue-600'
              } disabled:opacity-50`}
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : isDone ? <CheckCircle className="h-4 w-4" /> : <DownloadCloud className="h-4 w-4" />}
              {isGenerating ? 'Se generează...' : isDone ? 'Descărcat!' : 'Descarcă PDF'}
            </button>
            <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all"><X className="h-6 w-6" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-12 flex justify-center bg-black/40">
           <div className="scale-90 origin-top">
              <BeverageContent />
           </div>
        </div>
      </div>
    );
  }

  return <div className="hidden print:block"><BeverageContent /></div>;
};
