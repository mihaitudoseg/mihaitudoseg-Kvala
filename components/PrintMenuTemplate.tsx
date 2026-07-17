
import React, { useState } from 'react';
import { useMenu } from '../context/MenuContext';
import { MenuItem } from '../types';
import { 
  UtensilsCrossed, X, MapPin, Phone, 
  DownloadCloud, Star,
  Loader2, CheckCircle, Waves,
  FileText, FileDown, RefreshCcw
} from 'lucide-react';

interface PrintMenuTemplateProps {
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
    {/* Fundal texturat discret */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }}></div>
    
    {/* Borduri decorative premium */}
    <div className="absolute inset-4 border-[1px] border-greek-gold/40 pointer-events-none"></div>
    <div className="absolute inset-8 border-[2px] border-greek-blue/5 pointer-events-none"></div>
    
    {/* Ornamente colț exagerate pentru eleganță */}
    <div className="absolute top-4 left-4 w-24 h-24 border-t-4 border-l-4 border-greek-gold/60"></div>
    <div className="absolute top-4 right-4 w-24 h-24 border-t-4 border-r-4 border-greek-gold/60"></div>
    <div className="absolute bottom-4 left-4 w-24 h-24 border-b-4 border-l-4 border-greek-gold/60"></div>
    <div className="absolute bottom-4 right-4 w-24 h-24 border-b-4 border-r-4 border-greek-gold/60"></div>
    
    <div className="relative z-10 px-16 py-8 h-full flex flex-col justify-between">
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      
      {/* Footer Pagină - Mărit și el */}
      <div className="mt-4 pt-8 flex justify-between items-center border-t-2 border-greek-gold/20 shrink-0">
        <div className="flex items-center gap-6">
          <span className="text-[11px] font-black text-greek-blue/60 uppercase tracking-[0.6em]">KVALA TAVERNA URBANA</span>
          <div className="h-1.5 w-1.5 rounded-full bg-greek-gold/60"></div>
          <span className="text-[11px] font-black text-greek-blue/60 uppercase tracking-[0.6em]">COTROCENI</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-0.5 bg-greek-gold/40"></div>
          <span className="text-sm font-serif italic text-greek-gold font-bold">Pagina {pageNumber}</span>
        </div>
      </div>
    </div>
  </div>
);

const PromoSection: React.FC<{ index: number }> = ({ index }) => {
  const { siteContent } = useMenu();
  const promoItems = (siteContent.promoItems || []).filter(p => !p.isHidden);
  if (promoItems.length === 0) return null;
  
  const promo = promoItems[index % promoItems.length];
  return (
    <div className="mt-auto pt-4 border-t-4 border-double border-greek-gold/30">
      <div className="bg-greek-blue/5 p-4 rounded-2xl flex gap-6 items-center border border-greek-gold/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-greek-gold text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-md">
          {promo.tag}
        </div>
        <div className="w-32 h-24 shrink-0 rounded-xl overflow-hidden shadow-inner border-2 border-white">
          <img src={promo.image} alt={promo.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-serif font-black text-greek-blue uppercase leading-none mb-1">{promo.name}</h4>
          <p className="text-[10px] text-gray-600 leading-tight italic font-medium">{promo.description}</p>
        </div>
      </div>
    </div>
  );
};

const MenuItemCard: React.FC<{ item: MenuItem; isRecommendation?: boolean }> = ({ item, isRecommendation }) => (
  <div className="flex flex-col break-inside-avoid mb-2 group relative">
    {isRecommendation && (
      <div className="absolute -top-2 -right-2 z-20 bg-greek-gold text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl rotate-2">
        Recomandare
      </div>
    )}
    <div className="w-full aspect-[21/7] rounded-xl overflow-hidden shadow-md border-2 border-white ring-1 ring-greek-gold/10 mb-2 bg-gray-50">
      <img 
        src={item.image || `https://picsum.photos/seed/${item.id}/1200/400`} 
        alt={item.name} 
        className="w-full h-full object-cover" 
      />
    </div>
    <div className="flex-1 px-4">
      <div className="flex justify-between items-baseline gap-4 mb-1 border-b border-greek-gold/20 pb-0.5">
        <h3 className="text-lg font-serif font-black text-gray-900 uppercase leading-none tracking-tight">
          {item.name}
        </h3>
        <div className="flex items-center gap-2 bg-greek-blue/5 px-2 py-0.5 rounded-lg">
          <span className="text-lg font-serif font-black text-greek-blue">{item.price}</span>
          <span className="text-[9px] font-black text-greek-blue/40">LEI</span>
        </div>
      </div>
      <p className={`text-[11px] text-gray-600 leading-snug font-medium italic mb-1 ${isRecommendation ? '' : 'line-clamp-2'}`}>
        {item.description || 'Preparat autentic Kvala, gătit cu ingrediente proaspete și pasiune.'}
      </p>
      {item.weight && (
        <div className="flex items-center gap-2">
          <div className="h-px w-4 bg-greek-gold/50"></div>
          <span className="text-[9px] font-black text-greek-gold uppercase tracking-[0.2em]">
            {item.weight}
            {item.calories && (
              <span className="ml-2 text-gray-400">
                / {item.calories.toString().toLowerCase().includes('kcal') ? item.calories : `${item.calories} kcal`}
              </span>
            )}
          </span>
        </div>
      )}
      {!item.weight && item.calories && (
        <div className="flex items-center gap-2">
          <div className="h-px w-4 bg-gray-300"></div>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
            {item.calories.toString().toLowerCase().includes('kcal') ? item.calories : `${item.calories} kcal`}
          </span>
        </div>
      )}
    </div>
  </div>
);

export const PrintMenuTemplate: React.FC<PrintMenuTemplateProps> = ({ isPreview, onClose }) => {
  const { menuItems, siteContent, siteImages } = useMenu();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const categories = (siteContent.categories || []).filter(cat => !cat.isHidden);
  
  const handleDownloadPDF = async () => {
    const element = document.getElementById('pdf-capture-container');
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
      filename: `Kvala-Menu-Editorial-${date}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true, 
        backgroundColor: '#ffffff',
        logging: false,
        scrollY: 0,
        scrollX: 0,
        x: 0,
        y: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
      pagebreak: { mode: ['css', 'legacy'] }
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

  const handleDownloadWord = () => {
    const visibleMenuItems = menuItems.filter(item => !item.isHidden);
    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Meniu Kvala</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 50pt; }
          h1 { color: #0057B7; text-align: center; font-size: 36pt; text-transform: uppercase; letter-spacing: 6pt; }
          h2 { color: #C5A059; border-bottom: 3px solid #C5A059; padding-bottom: 12pt; margin-top: 45pt; font-size: 26pt; text-transform: uppercase; }
          .item { margin-bottom: 25pt; border-bottom: 1px dashed #ddd; padding-bottom: 15pt; }
          .price { color: #0057B7; font-weight: bold; font-size: 16pt; }
          .desc { font-style: italic; color: #444; font-size: 12pt; margin-top: 6pt; }
        </style>
      </head>
      <body>
        <h1>KVALA - TAVERNA URBANĂ</h1>
        <p style='text-align:center; font-style:italic; font-size: 16pt;'>${siteContent.home.heroTitle}</p>
    `;

    categories.forEach(cat => {
      const items = visibleMenuItems.filter(i => i.category === cat.id);
      if (items.length > 0) {
        html += `<h2>${cat.label}</h2>`;
        items.forEach(item => {
          const isHighlighted = item.isHighlighted;
          html += `
            <div class="item" style="${isHighlighted ? 'background-color: #f0f7ff; border: 1px solid #C5A059; padding: 10pt;' : ''}">
              <table width="100%">
                <tr>
                  <td style="font-size: 16pt; font-weight: bold;">${item.name.toUpperCase()} ${isHighlighted ? '★' : ''}</td>
                  <td style="text-align: right;" class="price">${item.price} LEI</td>
                </tr>
              </table>
              <div class="desc">${item.description || ''} ${item.weight ? '— ' + item.weight : ''}</div>
            </div>
          `;
        });
      }
    });

    html += `</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Meniu-Kvala-Word-${new Date().toISOString().split('T')[0]}.doc`;
    link.click();
  };

  const MenuContent = () => {
    const visibleMenuItems = menuItems.filter(item => !item.isHidden);
    
    // Pool de recomandări (produse evidențiate sau populare)
    const recommendations = visibleMenuItems.filter(i => 
      i.isHighlighted || ['dm1', 'dm8', 'sp2', 'sp5', 'sl1', 'ds4'].includes(i.id)
    );

    const pages: { category: string, items: { data: MenuItem, isRec: boolean }[], isContinuation: boolean }[] = [];
    
    categories.forEach(cat => {
      const catItems = visibleMenuItems.filter(i => i.category === cat.id);
      if (catItems.length === 0) return;

      // Împărțim produsele categoriei în grupuri de câte 2
      for (let i = 0; i < catItems.length; i += 2) {
        const chunk = catItems.slice(i, i + 2).map(item => ({ data: item, isRec: !!item.isHighlighted }));
        const isCont = i > 0;

        // Dacă ultimul chunk are mai puțin de 2 produse, umplem cu recomandări
        if (chunk.length < 2) {
          let recIdx = 0;
          while (chunk.length < 2) {
            const rec = recommendations[recIdx % recommendations.length];
            // Evităm să punem aceeași recomandare dacă e deja în pagină
            if (!chunk.some(c => c.data.id === rec.id)) {
              chunk.push({ data: rec, isRec: true });
            }
            recIdx++;
            // Safety break
            if (recIdx > 20) break;
          }
        }

        pages.push({ 
          category: cat.label, 
          items: chunk, 
          isContinuation: isCont 
        });
      }
    });

    return (
      <div id="pdf-capture-container" className="bg-white" style={{ width: '210mm', margin: '0' }}>
        {/* COPERTĂ PREMIUM */}
        <PageWrapper pageNumber={1}>
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-14 p-10 border-[10px] border-greek-blue/10 shadow-[0_50px_120px_rgba(0,87,183,0.2)] rotate-1 bg-white relative">
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-greek-gold shadow-2xl rotate-12 flex items-center justify-center">
                <Star className="h-8 w-8 text-white fill-white" />
              </div>
              {siteImages.logo ? (
                <img src={siteImages.logo} alt="Logo" className="h-32 w-auto object-contain" />
              ) : (
                <UtensilsCrossed className="h-32 w-32 text-greek-blue" />
              )}
            </div>
            <h1 className="text-[100px] font-serif font-black text-greek-blue tracking-tighter mb-4 leading-none uppercase">KVALA</h1>
            <div className="flex items-center gap-6 mb-12">
               <div className="w-20 h-1 bg-greek-gold/40"></div>
               <p className="text-3xl font-black text-greek-gold tracking-[0.6em] uppercase">Taverna Urbană</p>
               <div className="w-20 h-1 bg-greek-gold/40"></div>
            </div>
            
            <div className="max-w-3xl bg-sand/60 p-10 rounded-[40px] border-2 border-greek-gold/15 shadow-inner backdrop-blur-xl mb-16">
              <p className="text-3xl text-gray-800 italic leading-relaxed font-serif">"{siteContent.home.heroTitle}"</p>
            </div>
            
            <div className="flex gap-16 text-greek-blue/50 border-t-2 border-b-2 border-greek-gold/15 py-8 px-16">
                <div className="flex flex-col items-center"><Waves className="h-10 w-10 mb-2" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Tradiție</span></div>
                <div className="flex flex-col items-center"><Star className="h-10 w-10 mb-2" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Calitate</span></div>
                <div className="flex flex-col items-center"><MapPin className="h-10 w-10 mb-2" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Cotroceni</span></div>
            </div>
          </div>
        </PageWrapper>

        {/* PAGINI DE CONȚINUT */}
        {pages.map((page, pIdx) => (
          <PageWrapper key={`${page.category}-${pIdx}`} pageNumber={pIdx + 2}>
            <div className="flex flex-col h-full">
              <div className="mb-6 flex items-center gap-6">
                <div className="shrink-0 flex items-center gap-3">
                  <div className="bg-greek-blue text-white w-10 h-10 rounded-xl flex items-center justify-center font-serif text-xl font-black shadow-lg">
                    {pIdx + 1}
                  </div>
                  <h2 className="text-2xl font-serif font-black text-greek-blue uppercase tracking-tight">
                    {page.category}
                    {page.isContinuation && <span className="text-lg lowercase font-normal italic ml-3 text-greek-gold/50">(cont.)</span>}
                  </h2>
                </div>
                <div className="h-0.5 bg-greek-gold/30 flex-1"></div>
                <div className="flex gap-1">
                   {[1,2,3].map(s => <Star key={s} className="h-4 w-4 text-greek-gold/50 fill-greek-gold/10" />)}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-y-4 content-start flex-1 mb-4">
                {page.items.map((item, idx) => (
                  <MenuItemCard key={`${item.data.id}-${idx}`} item={item.data} isRecommendation={item.isRec} />
                ))}
              </div>
              <PromoSection index={pIdx} />
            </div>
          </PageWrapper>
        ))}

        {/* PAGINA FINALĂ - COREJCȚII TYPO & ALINIERE */}
        <PageWrapper pageNumber={pages.length + 2}>
           <div className="flex flex-col h-full items-center justify-center px-10 gap-12 text-center">
              <div className="space-y-8">
                 <div className="inline-block px-10 py-4 bg-greek-blue text-white rounded-full text-sm font-black uppercase tracking-[0.4em] shadow-xl transform -rotate-1">Yassas & Euxaristoume!</div>
                 <h2 className="text-5xl font-serif font-bold text-greek-blue leading-tight tracking-tighter">O experiență culinară sublimă.</h2>
                 <p className="text-xl text-gray-500 leading-relaxed italic border-l-8 border-greek-gold pl-8 py-4 bg-sand/40 rounded-r-3xl text-left mx-auto max-w-lg">Cotroceniul se întâlnește cu gustul autentic grecesc într-o poveste cu arome mediteraneene.</p>
                 
                 <div className="grid grid-cols-1 gap-8 pt-10 border-t-2 border-greek-gold/20 max-w-md mx-auto">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-greek-gold uppercase tracking-[0.4em]">Unde suntem</p>
                       <div className="flex items-center justify-center gap-3 text-greek-blue">
                          <MapPin className="h-5 w-5 text-greek-gold" />
                          <span className="font-bold text-gray-800 text-base leading-snug">{siteContent.general.address}</span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-greek-gold uppercase tracking-[0.4em]">Contact Direct</p>
                       <div className="flex items-center justify-center gap-3 text-greek-blue">
                          <Phone className="h-5 w-5 text-greek-gold" />
                          <span className="font-bold text-gray-800 text-xl tracking-wider">{siteContent.general.phone}</span>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="w-[280px] p-8 bg-white rounded-[60px] border-[4px] border-greek-blue flex flex-col items-center text-center shadow-2xl relative transform rotate-1">
                 <div className="absolute -top-6 bg-greek-gold text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-xl">Meniul Digital Live</div>
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent((siteContent.general.publicUrl || window.location.origin).replace(/\/$/, '') + '/?page=menu')}`} 
                   className="w-full h-auto mb-6 p-3 bg-white rounded-[40px] shadow-inner border border-gray-100" 
                 />
                 <p className="text-[10px] font-black uppercase text-greek-blue tracking-[0.4em] mb-2">Scanează și Descoperă</p>
                 <div className="w-16 h-1 bg-greek-gold/40 rounded-full"></div>
              </div>
           </div>
        </PageWrapper>
      </div>
    );
  };

  if (isPreview) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-950/98 backdrop-blur-3xl flex flex-col no-print animate-fade-in">
        <div className="bg-white/10 border-b border-white/10 px-10 sm:px-16 py-8 flex flex-col lg:flex-row justify-between items-center gap-8 text-white shrink-0">
          <div className="flex items-center gap-10">
            <div className="bg-greek-blue p-6 rounded-[3rem] shadow-[0_0_80px_rgba(0,87,183,0.5)] border border-white/20 transform hover:scale-110 transition-transform">
              {isGenerating ? <Loader2 className="h-12 w-12 animate-spin" /> : <DownloadCloud className="h-12 w-12" />}
            </div>
            <div>
              <h3 className="font-serif font-black text-5xl tracking-tighter leading-none">Meniu Editorial</h3>
              <p className="text-xs text-greek-gold uppercase font-black tracking-[0.6em] mt-4 flex items-center gap-4">
                <Star className="h-5 w-5 fill-greek-gold" /> PDF Premium (A4 Portrait)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 lg:flex-none px-8 py-6 rounded-[2.5rem] font-black text-xs uppercase flex items-center justify-center gap-3 bg-white text-greek-blue hover:bg-greek-gold hover:text-white transition-all shadow-2xl"
            >
              <RefreshCcw className="h-5 w-5" /> Înapoi la Admin
            </button>
            <button 
              onClick={handleDownloadWord}
              className="flex-1 lg:flex-none px-8 py-6 rounded-[2.5rem] font-black text-xs uppercase flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 shadow-xl"
            >
              <FileDown className="h-5 w-5 text-blue-300" /> Export Word
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className={`flex-1 lg:flex-none px-12 py-6 rounded-[2.5rem] font-black text-xs uppercase flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 shadow-[0_30px_60px_rgba(0,0,0,0.4)] ${
                isDone ? 'bg-green-600 text-white' : 'bg-greek-blue text-white hover:bg-blue-600'
              } disabled:opacity-50`}
            >
              {isGenerating ? <><Loader2 className="h-5 w-5 animate-spin" /> Se generează...</> : isDone ? <><CheckCircle className="h-5 w-5" /> Descărcat!</> : <><DownloadCloud className="h-5 w-5" /> Descarcă PDF Premium</>}
            </button>
            <button onClick={onClose} className="p-7 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all border border-white/10"><X className="h-10 w-10" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-black/70 p-16 sm:p-32 flex flex-col items-center gap-32 custom-scrollbar">
           <div className="origin-top transition-transform duration-1000 ease-out" style={{ transform: 'scale(0.8)' }}>
              <MenuContent />
           </div>
        </div>
        <style>{`
          .pdf-page { box-shadow: 0 50px 150px rgba(0,0,0,0.9); margin-bottom: 120px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); }
          .custom-scrollbar::-webkit-scrollbar { width: 14px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.5); }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.4); border-radius: 24px; border: 4px solid transparent; background-clip: padding-box; }
        `}</style>
      </div>
    );
  }

  return <div className="hidden print:block"><MenuContent /></div>;
};
