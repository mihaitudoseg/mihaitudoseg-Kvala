
import React, { useState } from 'react';
import { useMenu } from '../context/MenuContext';
import { MenuItem } from '../types';
import { 
  X, Phone, 
  DownloadCloud, Star,
  Loader2, CheckCircle, Waves,
  FileDown, Wine, RefreshCcw
} from 'lucide-react';

interface WineMenuTemplateProps {
  isPreview?: boolean;
  onClose?: () => void;
}

const PageWrapper: React.FC<{ children?: React.ReactNode; pageNumber: number }> = ({ children, pageNumber }) => (
  <div className="pdf-page bg-white relative overflow-hidden flex flex-col" 
       style={{ 
         width: '210mm', 
         height: '297mm', 
         pageBreakAfter: 'always',
         margin: '0 auto',
         boxSizing: 'border-box',
         position: 'relative'
       }}>
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }}></div>
    <div className="absolute inset-4 border-[1px] border-greek-gold/40 pointer-events-none"></div>
    <div className="absolute inset-8 border-[2px] border-greek-blue/5 pointer-events-none"></div>
    
    <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-greek-gold/60"></div>
    <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-greek-gold/60"></div>
    <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-greek-gold/60"></div>
    <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-greek-gold/60"></div>
    
    <div className="relative z-10 px-16 py-12 h-full flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      
      <div className="mt-8 pt-6 flex justify-between items-center border-t border-greek-gold/20 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-greek-blue/60 uppercase tracking-[0.4em]">KVALA TAVERNA URBANA</span>
            <div className="h-1 w-1 rounded-full bg-greek-gold/60"></div>
            <span className="text-[10px] font-black text-greek-blue/60 uppercase tracking-[0.4em]">VINURI ȘI BERE</span>
          </div>
        <span className="text-xs font-serif italic text-greek-gold font-bold">Pagina {pageNumber}</span>
      </div>
    </div>
  </div>
);

export const WineMenuTemplate: React.FC<WineMenuTemplateProps> = ({ isPreview, onClose }) => {
  const { menuItems, siteContent, siteImages } = useMenu();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const wineCategories = ['vinuri', 'bere'];
  const wineItems = menuItems.filter(item => wineCategories.includes(item.category) && !item.isHidden);
  const categories = siteContent.categories.filter(c => wineCategories.includes(c.id));
  
  const handleDownloadPDF = async () => {
    const element = document.getElementById('wine-pdf-container');
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
      filename: `Kvala-Meniu-Vinuri-Bere-${date}.pdf`,
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

  const WineContent = () => {
    const totalWines = wineItems.length;
    
    // Reguli de scalare mai agresive pentru a evita tăierea textului
    let wineColumnCount = 1;
    let wineFontSizeScale = 1;
    let wineSpacingScale = 1;

    if (totalWines > 22) {
      wineColumnCount = 2;
      wineFontSizeScale = 0.75;
      wineSpacingScale = 0.6;
    } else if (totalWines > 12) {
      wineColumnCount = 2;
      wineFontSizeScale = 0.85;
      wineSpacingScale = 0.8;
    } else if (totalWines > 8) {
      wineFontSizeScale = 0.95;
      wineSpacingScale = 0.9;
    }

    return (
      <div id="wine-pdf-container" className="bg-white" style={{ width: '210mm', height: '297mm', overflow: 'hidden' }}>
        <PageWrapper pageNumber={1}>
          <div className="flex flex-col items-center mb-6">
            <div className="mb-3 p-3 border-4 border-greek-blue/10 bg-white relative">
              <Wine className="h-10 w-10 text-greek-blue" />
            </div>
            <h1 className="text-4xl font-serif font-black text-greek-blue tracking-tighter mb-1 uppercase">VINURI ȘI BERE</h1>
            <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-0.5 bg-greek-gold/40"></div>
               <p className="text-xs font-black text-greek-gold tracking-[0.4em] uppercase">Selecție Premium</p>
               <div className="w-10 h-0.5 bg-greek-gold/40"></div>
            </div>
          </div>

          <div 
            className="gap-x-12"
            style={{ 
              columnCount: wineColumnCount,
              fontSize: `${wineFontSizeScale}rem`,
              lineHeight: '1.2'
            }}
          >
            {categories.map(cat => {
              const itemsInCategory = wineItems.filter(i => i.category === cat.id);
              if (itemsInCategory.length === 0) return null;

              return (
                <div key={cat.id} className="mb-8 break-inside-avoid">
                  <h2 className="font-serif font-black text-greek-blue uppercase tracking-widest border-b-2 border-greek-gold/20 pb-1 mb-4" style={{ fontSize: `${20 * wineFontSizeScale}px` }}>
                    {cat.label}
                  </h2>
                  <div className="space-y-3">
                    {itemsInCategory.map((item) => (
                      <div key={item.id} className="border-b border-greek-gold/5 pb-2 mb-2 break-inside-avoid" style={{ marginBottom: `${1.2 * wineSpacingScale}rem` }}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="font-serif font-bold text-gray-900 uppercase tracking-tight" style={{ fontSize: `${17 * wineFontSizeScale}px` }}>
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <span className="font-serif font-bold text-greek-blue" style={{ fontSize: `${17 * wineFontSizeScale}px` }}>{item.price}</span>
                            <span className="font-black text-greek-blue/40" style={{ fontSize: `${10 * wineFontSizeScale}px` }}>LEI</span>
                          </div>
                        </div>
                        <p className="text-gray-600 italic leading-tight" style={{ fontSize: `${11 * wineFontSizeScale}px` }}>
                          {item.description}
                        </p>
                        {item.weight && (
                          <span className="font-black text-greek-gold uppercase tracking-widest mt-1 block" style={{ fontSize: `${8 * wineFontSizeScale}px` }}>
                            {item.weight}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-4 text-center">
            <p className="text-xs font-serif italic text-gray-400 mb-1">"Vinul este poezia îmbuteliată."</p>
            <div className="flex justify-center gap-2 text-greek-blue/20">
              <Star className="h-2.5 w-2.5 fill-current" />
              <Star className="h-2.5 w-2.5 fill-current" />
              <Star className="h-2.5 w-2.5 fill-current" />
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
              <Wine className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-3xl">Meniu Vinuri și Bere A4</h3>
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
              <WineContent />
           </div>
        </div>
      </div>
    );
  }

  return <div className="hidden print:block"><WineContent /></div>;
};
