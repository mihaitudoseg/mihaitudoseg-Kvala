
import React, { useState, useEffect } from 'react';
import { useMenu } from '../context/MenuContext';
import { MenuItem, SiteImages, SiteContent, ReservationData, Category, PromoItem, Page } from '../types';
import { dbDebugInfo, dbService, supabase } from '../services/db';
import { 
  Trash2, Upload, Plus, 
  ImageIcon, ArrowRight,
  Type, CheckCircle2, 
  Loader2, AlertCircle,
  RefreshCcw, Home, Utensils, CalendarDays, PhoneCall, Info,
  ShieldCheck, XCircle, User, Users, Calendar, Clock, Activity,
  DatabaseZap, QrCode, Download, ExternalLink, Bell,
  Eye, EyeOff, Layers, Settings2, Hash, FileText, Printer,
  MessageCircle, FileDown, ChevronUp, ChevronDown, Star, Waves, Wine, GlassWater, Package
} from 'lucide-react';
import { PrintMenuTemplate } from '../components/PrintMenuTemplate';
import { TablematMenuTemplate } from '../components/TablematMenuTemplate';
import { WineMenuTemplate } from '../components/WineMenuTemplate';
import { BeverageMenuTemplate } from '../components/BeverageMenuTemplate';

interface AdminPageProps {
  onNavigate: (page: Page) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { 
    menuItems, siteImages, siteContent, isDbActive,
    updateMenuItem, deleteMenuItem, deleteHiddenMenuItems, addMenuItem, reorderMenuItems,
    updateSiteImage, updateSiteContent, restoreDefaults
  } = useMenu();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'menu' | 'content' | 'images' | 'reservations' | 'system'>('menu');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isPersisting, setIsPersisting] = useState<string | null>(null);
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loadingRes, setLoadingRes] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showTablematPreview, setShowTablematPreview] = useState(false);
  const [showWinePreview, setShowWinePreview] = useState(false);
  const [showBeveragePreview, setShowBeveragePreview] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeletingHidden, setIsDeletingHidden] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    status: 'idle' | 'loading' | 'ok' | 'error_tables' | 'error_rls' | 'no_connection';
    message: string;
  }>({ status: 'idle', message: '' });

  const handleFullReset = async () => {
    setIsResetting(true);
    try {
      await restoreDefaults();
    } catch (e) {
      console.error(e);
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'reservations') loadReservations();
      if (activeTab === 'system') {
        checkDatabaseTables();
        runDiagnostic();
      }
    }
  }, [activeTab, isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPass = (import.meta as any).env.VITE_ADMIN_PASSWORD || 'admin123';
    if (password === adminPass) {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-blue-50 rounded-2xl mb-4">
              <ShieldCheck className="h-10 w-10 text-greek-blue" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Acces Restricționat</h1>
            <p className="text-sm text-gray-500 font-medium">Introduceți parola pentru administrare</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Parolă Admin</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-gray-50 border ${loginError ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-greek-blue outline-none transition-all`}
                placeholder="••••••••"
                autoFocus
              />
              {loginError && <p className="text-red-500 text-[10px] font-bold uppercase mt-2 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Parolă incorectă</p>}
            </div>
            
            <button 
              type="submit"
              className="w-full py-4 bg-greek-blue text-white rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Autentificare <ArrowRight className="h-4 w-4" />
            </button>
            
            <button 
              type="button"
              onClick={() => window.location.href = '/'}
              className="w-full py-3 text-gray-400 hover:text-gray-600 font-bold text-[10px] uppercase tracking-widest transition-colors"
            >
              Înapoi la Site
            </button>
          </form>
        </div>
      </div>
    );
  }

  const showSaveFeedback = (msg = "Salvat!") => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const loadReservations = async () => {
    setLoadingRes(true);
    const data = await dbService.getReservations();
    setReservations([...data].sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()));
    setLoadingRes(false);
  };

  const handlePromoImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = async () => {
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
          
          setIsPersisting(id);
          try {
            const newPromoItems = (siteContent.promoItems || []).map(item => 
              item.id === id ? { ...item, image: compressedBase64 } : item
            );
            await updateSiteContent('promoItems', '', newPromoItems);
            showSaveFeedback("Imagine promoțională salvată");
          } finally { setIsPersisting(null); }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePromoItem = (id: string, updates: Partial<PromoItem>) => {
    const newPromoItems = (siteContent.promoItems || []).map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    updateSiteContent('promoItems', '', newPromoItems);
  };

  const addPromoItem = () => {
    const newItem: PromoItem = {
      id: `promo_${Date.now()}`,
      name: 'Produs Nou Promo',
      description: 'Descriere promoție...',
      image: 'https://picsum.photos/seed/promo/800/600',
      tag: 'Promoție Nouă'
    };
    const newPromoItems = [...(siteContent.promoItems || []), newItem];
    updateSiteContent('promoItems', '', newPromoItems);
    showSaveFeedback("Promoție adăugată");
  };

  const deletePromoItem = (id: string) => {
    if (confirm("Ștergi această promoție din PDF?")) {
      const newPromoItems = (siteContent.promoItems || []).filter(item => item.id !== id);
      updateSiteContent('promoItems', '', newPromoItems);
      showSaveFeedback("Promoție ștearsă");
    }
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>, isMenu = true) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = async () => {
          // Optimizare pentru viteză: 800px este suficient pentru web/mobil
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Calitate 0.5 pentru un echilibru optim de viteză pe mobil
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
          
          setIsPersisting(id);
          try {
            if (isMenu) await updateMenuItem(id, { image: compressedBase64 });
            else await updateSiteImage(id as keyof SiteImages, compressedBase64);
            showSaveFeedback("Imagine optimizată și salvată");
          } finally { setIsPersisting(null); }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBulkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsPersisting('bulk');
    let processedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Eliminăm extensia și curățăm numele
      const productName = file.name.replace(/\.[^/.]+$/, "").trim();
      
      try {
        const imageData: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              const MAX_WIDTH = 800;
              const MAX_HEIGHT = 800;
              let width = img.width;
              let height = img.height;
              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.5));
            };
            img.onerror = reject;
            img.src = reader.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Căutăm produsul existent (case-insensitive)
        const existingItem = menuItems.find(item => 
          item.name.toLowerCase().trim() === productName.toLowerCase()
        );

        if (existingItem) {
          await updateMenuItem(existingItem.id, { image: imageData });
        } else {
          // Creăm produs nou dacă nu există
          const newId = `m_bulk_${Date.now()}_${i}`;
          await addMenuItem({
            id: newId,
            name: productName,
            description: '',
            price: 0,
            category: siteContent.categories?.[0]?.id || 'uncategorized',
            image: imageData,
            isHidden: false
          });
        }
        processedCount++;
      } catch (err) {
        console.error(`Error processing ${file.name}:`, err);
      }
    }

    setIsPersisting(null);
    showSaveFeedback(`Importat cu succes ${processedCount} imagini/produse!`);
  };

  const addCategory = () => {
    if (!newCatLabel.trim()) return;
    const id = newCatLabel.toLowerCase().replace(/\s+/g, '-');
    const newCats = [...(siteContent.categories || []), { id, label: newCatLabel, isHidden: false }];
    updateSiteContent('categories', '', newCats);
    setNewCatLabel('');
    showSaveFeedback("Categorie adăugată");
  };

  const deleteCategory = (id: string) => {
    if (confirm(`Ștergi categoria "${id}"? Produsele vor rămâne, dar categoria va dispărea.`)) {
      const newCats = siteContent.categories.filter(c => c.id !== id);
      updateSiteContent('categories', '', newCats);
      showSaveFeedback("Categorie ștearsă");
    }
  };

  const renameCategory = (id: string, newLabel: string) => {
    const newCats = siteContent.categories.map(c => c.id === id ? { ...c, label: newLabel } : c);
    updateSiteContent('categories', '', newCats);
  };

  const toggleCategoryVisibility = (id: string) => {
    const newCats = siteContent.categories.map(c => c.id === id ? { ...c, isHidden: !c.isHidden } : c);
    updateSiteContent('categories', '', newCats);
    showSaveFeedback(newCats.find(c => c.id === id)?.isHidden ? "Categorie ascunsă" : "Categorie vizibilă");
  };

  const moveItem = async (id: string, direction: 'up' | 'down') => {
    const itemsInCategory = menuItems.filter(item => item.category === activeCategory);
    const index = itemsInCategory.findIndex(item => item.id === id);
    
    if (direction === 'up' && index > 0) {
      const newItemsInCategory = [...itemsInCategory];
      [newItemsInCategory[index - 1], newItemsInCategory[index]] = [newItemsInCategory[index], newItemsInCategory[index - 1]];
      
      // Reconstruct full menuItems array with new order for this category
      const otherItems = menuItems.filter(item => item.category !== activeCategory);
      await reorderMenuItems([...otherItems, ...newItemsInCategory]);
      showSaveFeedback("Poziție actualizată");
    } else if (direction === 'down' && index < itemsInCategory.length - 1) {
      const newItemsInCategory = [...itemsInCategory];
      [newItemsInCategory[index + 1], newItemsInCategory[index]] = [newItemsInCategory[index], newItemsInCategory[index + 1]];
      
      const otherItems = menuItems.filter(item => item.category !== activeCategory);
      await reorderMenuItems([...otherItems, ...newItemsInCategory]);
      showSaveFeedback("Poziție actualizată");
    }
  };

  const handleOpenPrintPreview = () => {
    setShowPrintPreview(true);
  };

  const handleDownloadWord = () => {
    const visibleMenuItems = menuItems.filter(item => !item.isHidden);
    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          body { font-family: 'Times New Roman', serif; }
          h1 { color: #0057B7; text-align: center; }
          h2 { color: #C5A059; border-bottom: 2px solid #C5A059; margin-top: 20pt; }
        </style>
      </head>
      <body>
        <h1>KVALA - TAVERNA URBANA</h1>
        <p style='text-align:center;'>Meniu Exportat - ${new Date().toLocaleDateString('ro-RO')}</p>
    `;

    siteContent.categories.forEach(cat => {
      const items = visibleMenuItems.filter(i => i.category === cat.id);
      if (items.length > 0) {
        html += `<h2>${cat.label}</h2>`;
        items.forEach(item => {
          const isHighlighted = item.isHighlighted;
          html += `<p style="${isHighlighted ? 'background-color: #f0f7ff; border: 1px solid #C5A059; padding: 5pt;' : ''}">
            <strong>${item.name}</strong> ${isHighlighted ? '★' : ''} - ${item.price} Lei<br/>
            ${item.description || ''} ${item.weight ? '(' + item.weight + ')' : ''}
          </p>`;
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

  const inputClass = "w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-greek-blue outline-none text-sm shadow-sm transition-colors";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block";

  const runDiagnostic = async () => {
    if (!supabase) {
      setDbStatus({ 
        status: 'no_connection', 
        message: 'Clientul Supabase nu este inițializat. Verificați MANUAL_URL și MANUAL_KEY în db.ts.' 
      });
      return;
    }
    setDbStatus({ status: 'loading', message: 'Se testează citirea și scrierea în cloud...' });
    try {
      // 1. Test select to see if the table exists
      const { data, error } = await supabase.from('menu_items').select('id').limit(1);
      if (error) {
        setDbStatus({ 
          status: 'error_tables', 
          message: `Eroare citire: ${error.message}. Tabelele nu există încă în baza de date Supabase.` 
        });
        return;
      }

      // 2. Test writing to check RLS (Row Level Security) settings
      const testKey = 'diag_' + Date.now();
      const { error: writeError } = await supabase
        .from('site_settings')
        .upsert({ key: testKey, content: { test: true } });

      if (writeError) {
        if (writeError.message.toLowerCase().includes('security') || writeError.message.toLowerCase().includes('policy') || writeError.code === '42501' || (writeError as any).status === 401 || (writeError as any).status === 403) {
          setDbStatus({
            status: 'error_rls',
            message: `RLS (Row Level Security) blochează scrierea de date. Trebuie dezactivat RLS sau setate politici publice în editorul SQL.`
          });
        } else {
          setDbStatus({
            status: 'error_rls',
            message: `Eroare de scriere: ${writeError.message}`
          });
        }
        return;
      }

      // Cleanup
      await supabase.from('site_settings').delete().eq('key', testKey);

      setDbStatus({
        status: 'ok',
        message: 'Conexiunea Cloud este 100% activă! Editările și pozele se salvează în cloud și sunt vizibile instant pe toate telefoanele și tabletele.'
      });
    } catch (err: any) {
      setDbStatus({
        status: 'no_connection',
        message: `Eroare de rețea: ${err.message || err}`
      });
    }
  };

  function checkDatabaseTables() {
    console.log("Checking system tables integrity...");
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      {saveStatus && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-5 w-5" /> {saveStatus}
        </div>
      )}
      
      {showPrintPreview && (
        <PrintMenuTemplate isPreview={true} onClose={() => setShowPrintPreview(false)} />
      )}

      {showTablematPreview && (
        <TablematMenuTemplate isPreview={true} onClose={() => setShowTablematPreview(false)} />
      )}

      {showWinePreview && (
        <WineMenuTemplate isPreview={true} onClose={() => setShowWinePreview(false)} />
      )}

      {showBeveragePreview && (
        <BeverageMenuTemplate isPreview={true} onClose={() => setShowBeveragePreview(false)} />
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-blue-50 rounded-lg"><Utensils className="h-6 w-6 text-greek-blue" /></div>
             <div>
               <h1 className="text-2xl font-serif font-bold text-gray-900 leading-none">KVALA Admin</h1>
             </div>
             <button 
               onClick={() => onNavigate(Page.HOME)}
               className="ml-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
             >
               <Home className="h-4 w-4" /> Înapoi la Site
             </button>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto max-w-full">
            {[
              { id: 'menu', icon: Utensils, label: 'Meniu' },
              { id: 'reservations', icon: CalendarDays, label: 'Rezervări' },
              { id: 'content', icon: Type, label: 'Texte' },
              { id: 'images', icon: ImageIcon, label: 'Media' },
              { id: 'system', icon: Settings2, label: 'Sistem' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => {
                  setActiveTab(tab.id as any);
                }} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-greek-blue shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeCategory === 'all' ? (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 flex items-center gap-3 text-blue-700">
            <Info className="h-5 w-5" />
            <p className="text-sm font-medium">Selectați o categorie specifică pentru a putea reordona produsele (sus/jos).</p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 flex items-center gap-3 text-amber-700">
            <Layers className="h-5 w-5" />
            <p className="text-sm font-medium">Folosiți săgețile din dreptul fiecărui produs pentru a-i schimba poziția în meniu.</p>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-8 animate-fade-in-up">



            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
               <h2 className="text-lg font-serif font-bold text-greek-blue mb-4 flex items-center gap-2"><Layers className="h-5 w-5" /> Gestionare Categorii</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {siteContent.categories?.map(cat => (
                    <div key={cat.id} className={`p-3 border rounded-xl flex items-center justify-between transition-all ${cat.isHidden ? 'bg-gray-50 opacity-60' : 'bg-white shadow-sm border-gray-100'}`}>
                       <div className="flex flex-col flex-1 mr-2">
                         <input 
                           type="text" 
                           value={cat.label} 
                           onChange={(e) => renameCategory(cat.id, e.target.value)}
                           onBlur={() => showSaveFeedback("Nume categorie salvat")}
                           className="text-xs font-bold text-gray-800 bg-transparent border-none focus:ring-0 p-0 w-full"
                         />
                         <span className="text-[9px] text-gray-400 font-mono tracking-tighter">{cat.id}</span>
                       </div>
                       <div className="flex gap-1">
                         <button onClick={() => toggleCategoryVisibility(cat.id)} className="p-1.5 hover:bg-blue-50 rounded text-gray-400 hover:text-greek-blue transition-colors">
                           {cat.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                         </button>
                         <button onClick={() => deleteCategory(cat.id)} className="p-1.5 hover:bg-red-50 rounded text-red-200 hover:text-red-500 transition-colors">
                           <Trash2 className="h-4 w-4" />
                         </button>
                       </div>
                    </div>
                  ))}
                  <div className="p-1 bg-white border border-dashed border-gray-300 rounded-xl flex items-center gap-2">
                     <input 
                       type="text" 
                       placeholder="Categorie nouă..." 
                       value={newCatLabel} 
                       onChange={e => setNewCatLabel(e.target.value)} 
                       className="flex-1 bg-white px-3 py-2 text-xs outline-none text-gray-900 placeholder-gray-400" 
                     />
                     <button onClick={addCategory} className="bg-greek-blue text-white p-2 rounded-lg hover:bg-blue-700 transition mr-1"><Plus className="h-4 w-4" /></button>
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide max-w-full">
                <button onClick={() => setActiveCategory('all')} className={`px-4 py-2 rounded-full text-[10px] font-bold border uppercase tracking-wider transition-all ${activeCategory === 'all' ? 'bg-greek-blue text-white border-greek-blue shadow-md' : 'bg-white text-gray-500 border-gray-200'}`}>Toate</button>
                {siteContent.categories?.map(cat => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-2 rounded-full text-[10px] font-bold border uppercase tracking-wider transition-all ${activeCategory === cat.id ? 'bg-greek-blue text-white border-greek-blue shadow-md' : 'bg-white text-gray-500 border-gray-200'} ${cat.isHidden ? 'opacity-40 border-dashed' : ''}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
              <button onClick={() => addMenuItem({ id: `m_${Date.now()}`, name: 'Produs Nou', description: 'Descriere...', price: 0, category: siteContent.categories?.[0]?.id || 'uncategorized' })} className="bg-greek-blue text-white px-5 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-blue-700 transition shadow-lg"><Plus className="h-4 w-4" /> Adaugă Produs</button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {menuItems.filter(item => activeCategory === 'all' || item.category === activeCategory).map(item => (
                <div key={item.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row transition-all hover:border-greek-blue/30 ${item.isHidden ? 'opacity-50 border-dashed bg-gray-50/50' : ''}`}>
                  <div className="w-full md:w-40 h-40 bg-gray-50 relative group flex-shrink-0">
                    {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon className="h-8 w-8" /></div>}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-white text-[10px] font-black uppercase transition-opacity"><Upload className="h-4 w-4 mr-1" /> Schimbă Poza<input type="file" className="hidden" onChange={e => handleImageUpload(item.id, e)} /></label>
                  </div>
                  <div className="p-5 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="md:col-span-2">
                         <label className={labelClass}>Nume Preparat {item.isHidden && <span className="text-red-500 font-black ml-2">[ASCUNS DIN MENIU]</span>}</label>
                         <input type="text" value={item.name} onChange={e => { updateMenuItem(item.id, { name: e.target.value }); showSaveFeedback(); }} className={inputClass} />
                       </div>
                       <div>
                         <label className={labelClass}>Categorie</label>
                         <select value={item.category} onChange={e => { updateMenuItem(item.id, { category: e.target.value }); showSaveFeedback(); }} className={inputClass}>
                           {siteContent.categories?.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                         </select>
                       </div>
                       <div className="md:col-span-2">
                         <label className={labelClass}>Descriere / Ingrediente</label>
                         <input type="text" value={item.description || ''} onChange={e => { updateMenuItem(item.id, { description: e.target.value }); showSaveFeedback(); }} className={inputClass} />
                       </div>
                       <div className="grid grid-cols-3 gap-2">
                         <div><label className={labelClass}>Preț (Lei)</label><input type="text" value={item.price} onChange={e => { updateMenuItem(item.id, { price: e.target.value }); showSaveFeedback(); }} className={inputClass} /></div>
                         <div><label className={labelClass}>Gramaj</label><input type="text" value={item.weight || ''} onChange={e => { updateMenuItem(item.id, { weight: e.target.value }); showSaveFeedback(); }} className={inputClass} /></div>
                         <div><label className={labelClass}>Kcal</label><input type="text" value={item.calories || ''} onChange={e => { updateMenuItem(item.id, { calories: e.target.value }); showSaveFeedback(); }} className={inputClass} /></div>
                       </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 border-t pt-4 lg:border-0 lg:pt-0">
                       {activeCategory !== 'all' && (
                         <div className="flex flex-col gap-1 mr-4 bg-gray-50 p-1 rounded-lg border border-gray-100">
                            <button 
                              onClick={() => moveItem(item.id, 'up')}
                              className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-400 hover:text-greek-blue transition-all disabled:opacity-20"
                              title="Mută Sus"
                              disabled={menuItems.filter(i => i.category === activeCategory).findIndex(i => i.id === item.id) === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => moveItem(item.id, 'down')}
                              className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-400 hover:text-greek-blue transition-all disabled:opacity-20"
                              title="Mută Jos"
                              disabled={menuItems.filter(i => i.category === activeCategory).findIndex(i => i.id === item.id) === menuItems.filter(i => i.category === activeCategory).length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                         </div>
                       )}
                       <button 
                         onClick={() => { updateMenuItem(item.id, { isHighlighted: !item.isHighlighted }); showSaveFeedback(); }} 
                         className={`p-2 rounded-lg transition-all ${item.isHighlighted ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500'}`} 
                         title={item.isHighlighted ? 'Elimină Evidențierea' : 'Evidențiază în Meniu'}
                       >
                         <Star className={`h-5 w-5 ${item.isHighlighted ? 'fill-yellow-500' : ''}`} />
                       </button>
                       <button onClick={() => { updateMenuItem(item.id, { isHidden: !item.isHidden }); showSaveFeedback(); }} className={`p-2 rounded-lg transition-all ${item.isHidden ? 'bg-orange-100 text-orange-600' : 'bg-greek-blue/10 text-greek-blue hover:bg-blue-100'}`} title={item.isHidden ? 'Afișează' : 'Ascunde'}>
                         {item.isHidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                       </button>
                       <button onClick={() => confirm('Ștergi definitiv acest produs?') && deleteMenuItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors" title="Șterge"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
              <div>
                 <h2 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2"><Calendar className="h-7 w-7 text-greek-blue" /> Agenda Rezervărilor</h2>
                 <p className="text-sm text-gray-500 font-medium">Gestionați cererile primite de la clienți</p>
              </div>
              <button onClick={loadReservations} className="p-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 shadow-sm transition-all active:scale-95">
                <RefreshCcw className={`h-5 w-5 text-greek-blue ${loadingRes ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {reservations.length > 0 ? reservations.map(res => (
                <div key={res.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-greek-blue/40 transition-all">
                  <div className="flex gap-6 items-center flex-1 w-full">
                    <div className="text-center min-w-[70px] bg-blue-50 p-3 rounded-2xl">
                       <p className="text-2xl font-black text-greek-blue leading-none">{res.time}</p>
                       <p className="text-[10px] uppercase font-black text-blue-300 mt-1">{res.date}</p>
                    </div>
                    <div className="flex-1">
                       <p className="font-bold text-gray-900 text-lg leading-tight">{res.name}</p>
                       <p className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-1"><PhoneCall className="h-3 w-3" /> {res.phone}</p>
                    </div>
                    <div className="px-4 py-2 bg-greek-blue text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-2">
                       <Users className="h-4 w-4" /> {res.guests} <span className="hidden sm:inline">Pers.</span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                    <a href={`https://wa.me/${res.phone.replace(/\D/g,'')}`} target="_blank" className="flex-1 md:flex-none py-2 px-4 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition flex items-center justify-center gap-2 font-bold text-xs uppercase"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
                    <button onClick={async () => { if(confirm('Sunteți sigur că doriți să ștergeți această rezervare?')) { await dbService.deleteReservation(res.id!); loadReservations(); showSaveFeedback("Șters!"); } }} className="p-2 text-gray-200 hover:text-red-500 transition-colors" title="Șterge"><Trash2 className="h-6 w-6" /></button>
                  </div>
                </div>
              )) : (
                <div className="bg-white py-24 text-center rounded-3xl border border-dashed border-gray-300 flex flex-col items-center">
                   <Calendar className="h-16 w-16 text-gray-200 mb-4" />
                   <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">Nicio rezervare înregistrată</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
              <div>
                 <h2 className="text-xl font-serif font-bold text-greek-blue mb-6 flex items-center gap-2 border-b pb-3"><Home className="h-5 w-5" /> Homepage & Poveste</h2>
                 <div className="space-y-4">
                    <div><label className={labelClass}>Titlu Principal (Hero)</label><input type="text" value={siteContent.home.heroTitle} onChange={(e) => { updateSiteContent('home', 'heroTitle', e.target.value); showSaveFeedback(); }} className={inputClass} /></div>
                    <div><label className={labelClass}>Subtitlu (Locație)</label><input type="text" value={siteContent.home.heroSubtitle} onChange={(e) => { updateSiteContent('home', 'heroSubtitle', e.target.value); showSaveFeedback(); }} className={inputClass} /></div>
                    <div className="pt-4"><label className={labelClass}>Titlu Secțiune Poveste</label><input type="text" value={siteContent.home.storyTitle} onChange={(e) => { updateSiteContent('home', 'storyTitle', e.target.value); showSaveFeedback(); }} className={inputClass} /></div>
                    <div><label className={labelClass}>Text Poveste (Paragraf)</label><textarea rows={6} value={siteContent.home.storyText} onChange={(e) => { updateSiteContent('home', 'storyText', e.target.value); showSaveFeedback(); }} className={inputClass} /></div>
                 </div>
              </div>

              <div>
                 <h2 className="text-xl font-serif font-bold text-greek-blue mb-6 flex items-center gap-2 border-b pb-3"><Utensils className="h-5 w-5" /> Pagina Meniu Client</h2>
                 <div className="space-y-4">
                    <div><label className={labelClass}>Titlu Pagina Meniu</label><input type="text" value={siteContent.menuPage.title} onChange={(e) => { updateSiteContent('menuPage', 'title', e.target.value); showSaveFeedback(); }} className={inputClass} /></div>
                    <div><label className={labelClass}>Descriere Scurtă</label><input type="text" value={siteContent.menuPage.description} onChange={(e) => { updateSiteContent('menuPage', 'description', e.target.value); showSaveFeedback(); }} className={inputClass} /></div>
                 </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-serif font-bold text-greek-blue mb-6 flex items-center gap-2 border-b pb-3"><CalendarDays className="h-5 w-5" /> Rezervări & Contact</h2>
                <div className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className={labelClass}>Program de Funcționare</label><input type="text" value={siteContent.general.hours} onChange={(e) => { updateSiteContent('general', 'hours', e.target.value); showSaveFeedback(); }} className={inputClass} /></div>
                      <div><label className={labelClass}>Telefon WhatsApp</label><input type="text" value={siteContent.general.phone} onChange={(e) => { updateSiteContent('general', 'phone', e.target.value); showSaveFeedback(); }} className={inputClass} /></div>
                   </div>
                   <div><label className={labelClass}>Email Contact</label><input type="text" value={siteContent.general.email} onChange={(e) => { updateSiteContent('general', 'email', e.target.value); showSaveFeedback(); }} className={inputClass} /></div>
                   <div><label className={labelClass}>Adresă Completă</label><textarea rows={2} value={siteContent.general.address} onChange={(e) => { updateSiteContent('general', 'address', e.target.value); showSaveFeedback(); }} className={inputClass} /></div>
                   <div className="pt-4"><label className={labelClass}>Slogan Subsol (Footer)</label><input type="text" value={siteContent.general.footerTagline} onChange={(e) => { updateSiteContent('general', 'footerTagline', e.target.value); showSaveFeedback(); }} className={inputClass} /></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 border-l-4 border-l-greek-gold">
                <div className="flex items-center justify-between mb-6 border-b pb-3">
                   <h2 className="text-xl font-serif font-bold text-greek-gold flex items-center gap-2"><Bell className="h-5 w-5" /> Pop-up Notificare</h2>
                   <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                      <span className="text-[10px] font-black uppercase text-yellow-700">Activ</span>
                      <input type="checkbox" checked={siteContent.popup.isActive} onChange={(e) => { updateSiteContent('popup', 'isActive', e.target.checked); showSaveFeedback(); }} className="h-5 w-5 accent-greek-gold cursor-pointer" />
                   </div>
                </div>
                <div className="space-y-4">
                   <div><label className={labelClass}>Titlu Anunț</label><input type="text" value={siteContent.popup.title} onChange={(e) => { updateSiteContent('popup', 'title', e.target.value); showSaveFeedback(); }} className={inputClass} /></div>
                   <div><label className={labelClass}>Mesaj / Detalii Eveniment</label><textarea rows={3} value={siteContent.popup.message} onChange={(e) => { updateSiteContent('popup', 'message', e.target.value); showSaveFeedback(); }} className={inputClass} /></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {[
              { key: 'logo', label: 'Logo Site (Fundal alb/transparent)', desc: 'Folosit în navigare.' },
              { key: 'hero', label: 'Imagine Background Principală', desc: 'Prima imagine pe homepage.' },
              { key: 'story', label: 'Imagine Secțiune Poveste', desc: 'Mijlocul paginii principale.' },
              { key: 'menuHeader', label: 'Banner Pagina Meniu', desc: 'Imaginea de sus din meniu.' },
              { key: 'tablematImage', label: 'Imagine Set Masă (A3)', desc: 'Imaginea mare din subsolul setului de masă.' }
            ].map(item => (
              <div key={item.key} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full">
                <div className="mb-4">
                   <h3 className="font-serif font-bold text-gray-800">{item.label}</h3>
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{item.desc}</p>
                </div>
                <div className={`aspect-video bg-gray-50 rounded-xl overflow-hidden relative group border border-gray-100 mb-4 ${item.key === 'logo' ? 'flex items-center justify-center p-4' : ''}`}>
                  {siteImages[item.key as keyof SiteImages] ? (
                    <img 
                      src={siteImages[item.key as keyof SiteImages]} 
                      className={item.key === 'logo' ? 'max-h-full max-w-full object-contain' : 'w-full h-full object-cover'} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-[10px] font-bold uppercase tracking-widest">Nicio imagine setată</div>
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-black uppercase">
                     <Upload className="h-6 w-6 mb-2" /> 
                     <span>Încarcă Imagine</span>
                     <input type="file" className="hidden" onChange={(e) => handleImageUpload(item.key, e, false)} />
                  </label>
                </div>
                <div className="mt-auto bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-mono truncate">{siteImages[item.key as keyof SiteImages] || 'Fără URL definit'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'system' && (
          <div className="animate-fade-in-up grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
               <h2 className="text-xl font-serif font-bold text-greek-gold mb-6 flex items-center gap-2 border-b border-greek-gold/20 pb-4"><QrCode className="h-7 w-7" /> Cod QR Meniu</h2>
               <div className="flex flex-col items-center">
                 <div className="bg-white p-6 border-2 border-gray-100 rounded-3xl mb-6 shadow-inner">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent((siteContent.general.publicUrl || window.location.origin).replace(/\/$/, '') + '/?page=menu')}`} className="w-48 h-48" />
                 </div>
                 <div className="w-full space-y-4 text-center">
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Acest cod permite clienților să acceseze meniul scanându-l cu telefonul. Îl puteți printa și pune pe mesele restaurantului.</p>
                    
                     <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-left mb-4">
                        <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 block">URL Public (IMPORTANT)</label>
                        <p className="text-[10px] text-amber-700 mb-2 leading-tight">Am setat automat URL-ul public (<b>https://kvala.ro</b>) pentru ca QR-ul să meargă pe orice telefon.</p>
                        <input 
                          type="text" 
                          placeholder="https://kvala.ro"
                          value={siteContent.general.publicUrl || ''} 
                          onChange={(e) => { updateSiteContent('general', 'publicUrl', e.target.value); showSaveFeedback(); }}
                          className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-greek-blue font-mono text-[10px] outline-none focus:ring-2 focus:ring-amber-400" 
                        />
                     </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                       <label className={labelClass}>URL Destinație QR (Final)</label>
                       <input 
                         type="text" 
                         readOnly 
                         value={(siteContent.general.publicUrl || window.location.origin).replace(/\/$/, '') + '/?page=menu'} 
                         className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-greek-blue font-mono text-[10px] outline-none" 
                       />
                    </div>
                    <button onClick={() => window.print()} className="w-full py-4 bg-greek-blue text-white rounded-2xl font-bold uppercase text-xs flex items-center justify-center gap-3 hover:bg-blue-700 transition shadow-xl"><Download className="h-5 w-5" /> Printează Codul QR</button>
                 </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
               <h2 className="text-xl font-serif font-bold text-greek-blue mb-6 flex items-center gap-2 border-b pb-4"><DatabaseZap className="h-7 w-7" /> Import Masiv Date</h2>
               <div className="space-y-6">
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                     <h4 className="text-xs font-black uppercase text-greek-blue tracking-widest mb-3 flex items-center gap-2"><Upload className="h-4 w-4" /> Importă Poze Glovo / Editates</h4>
                     <p className="text-[11px] text-gray-600 leading-relaxed mb-5">
                       Selectați mai multe fișiere simultan. Sistemul va extrage numele produsului din numele fișierului și va actualiza imaginea produsului existent sau va crea unul nou dacă nu este găsit.
                     </p>
                     
                     <label className={`w-full py-4 flex flex-col items-center justify-center border-2 border-dashed border-greek-blue/30 rounded-2xl cursor-pointer hover:bg-white transition-all group ${isPersisting === 'bulk' ? 'opacity-50 pointer-events-none' : ''}`}>
                        {isPersisting === 'bulk' ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 text-greek-blue animate-spin mb-2" />
                            <span className="text-[10px] font-black uppercase text-greek-blue">Se procesează pozele...</span>
                          </div>
                        ) : (
                          <>
                            <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                              <ImageIcon className="h-6 w-6 text-greek-blue" />
                            </div>
                            <span className="text-[10px] font-black uppercase text-greek-blue">Selectează Poze (Multiple)</span>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleBulkImageUpload}
                            />
                          </>
                        )}
                     </label>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Instrucțiuni:</p>
                     <ul className="text-[10px] text-gray-500 space-y-1 list-disc pl-4">
                       <li>Numele fișierului (ex: "Pizza Margherita.jpg") trebuie să fie identic cu numele produsului.</li>
                       <li>Imaginile vor fi optimizate automat înainte de upload.</li>
                       <li>Dacă produsul nu există, va fi creat automat în prima categorie disponibilă.</li>
                     </ul>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
               <div className="flex justify-between items-center border-b pb-4 mb-6">
                 <h2 className="text-xl font-serif font-bold text-greek-blue flex items-center gap-2"><Activity className="h-7 w-7" /> Diagnostic & Sincronizare Cloud</h2>
                 <button 
                   onClick={runDiagnostic} 
                   className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                   title="Re-testează conexiunea cloud"
                 >
                   <RefreshCcw className={`h-3 w-3 ${dbStatus.status === 'loading' ? 'animate-spin' : ''}`} /> Re-testează
                 </button>
               </div>
               <div className="space-y-6">
                  {/* Status Box */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    dbStatus.status === 'ok' ? 'bg-green-50 border-green-200 text-green-800' :
                    dbStatus.status === 'loading' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                    dbStatus.status === 'error_rls' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                    dbStatus.status === 'error_tables' ? 'bg-red-50 border-red-200 text-red-800' :
                    'bg-gray-50 border-gray-200 text-gray-700'
                  }`}>
                    <div className="flex items-start gap-3">
                      {dbStatus.status === 'ok' && <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />}
                      {dbStatus.status === 'loading' && <Loader2 className="h-5 w-5 text-blue-600 mt-0.5 animate-spin flex-shrink-0" />}
                      {(dbStatus.status === 'error_rls' || dbStatus.status === 'error_tables' || dbStatus.status === 'no_connection') && <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />}
                      {dbStatus.status === 'idle' && <Activity className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />}
                      
                      <div className="flex-1">
                        <p className="font-bold text-xs uppercase tracking-wider mb-1">Status Sincronizare Real-Time</p>
                        <p className="text-sm font-medium">{dbStatus.message || 'Apăsați pe butonul de re-testare de mai sus pentru a verifica statusul.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* SQL Setup Helper for User */}
                  {(dbStatus.status === 'error_tables' || dbStatus.status === 'error_rls' || dbStatus.status === 'idle') && (
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
                      <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                        <DatabaseZap className="h-5 w-5 text-greek-blue" /> Cum activez salvarea permanentă și online?
                      </h4>
                      <p className="text-xs text-blue-700 leading-relaxed mb-4">
                        Pentru ca modificările și pozele adăugate în panoul de administrare să fie salvate online permanent (pe internet) și să apară instant tuturor clienților de pe telefoane, trebuie să vă asigurați că tabelele sunt create corect în contul dvs. de <b>Supabase</b> și au securitatea (RLS) configurată corect.
                      </p>
                      
                      <p className="text-xs font-bold text-blue-900 mb-2">Instrucțiuni simple pas cu pas:</p>
                      <ol className="text-xs text-blue-700 list-decimal pl-4 mb-4 space-y-1">
                        <li>Intrați în contul dvs. <b>Supabase</b> (la proiectul <code>ewpshixprglxtrsmdhyq</code>).</li>
                        <li>Din meniul din stânga, dați click pe <b>SQL Editor</b>.</li>
                        <li>Apăsați pe <b>"New query"</b> (Query nou).</li>
                        <li>Copiați codul SQL de mai jos, lipiți-l în editor și apăsați butonul <b>Run</b> (Rulează).</li>
                      </ol>

                      <div className="relative mb-4">
                        <div className="absolute top-2 right-2">
                          <button 
                            onClick={() => {
                              const sqlCode = document.getElementById('supabase-sql-script')?.innerText;
                              if (sqlCode) {
                                navigator.clipboard.writeText(sqlCode);
                                showSaveFeedback("Copiat în clipboard!");
                              }
                            }}
                            className="bg-white hover:bg-gray-100 text-greek-blue border border-gray-200 px-2 py-1 rounded text-[10px] font-bold shadow-sm transition-all animate-pulse"
                          >
                            Copiază Codul SQL
                          </button>
                        </div>
                        <pre 
                          id="supabase-sql-script"
                          className="bg-gray-900 text-gray-100 font-mono text-[9px] p-4 rounded-xl max-h-48 overflow-y-auto leading-relaxed border border-gray-800"
                        >
{`-- 1. Creează tabela pentru preparatele din meniu (menu_items)
CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    category TEXT,
    weight TEXT,
    calories TEXT,
    "order" INTEGER,
    "isHighlighted" BOOLEAN DEFAULT false,
    "isHidden" BOOLEAN DEFAULT false,
    image TEXT
);

-- 2. Creează tabela pentru setările site-ului (site_settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    content JSONB NOT NULL
);

-- 3. Creează tabela pentru rezervări (reservations)
CREATE TABLE IF NOT EXISTS public.reservations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    guests INTEGER,
    date TEXT,
    time TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Dezactivează Row Level Security (RLS) pentru simplitate, ca oricine să poată edita din aplicație:
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;`}
                        </pre>
                      </div>
                      <p className="text-[10px] text-blue-600 italic">După rularea codului în editorul SQL Supabase, apăsați pe butonul <b>Re-testează</b> de mai sus pentru a confirma conexiunea!</p>
                    </div>
                  )}

                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                           <p className="text-2xl font-black text-greek-blue leading-none">{menuItems.length}</p>
                           <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Preparate</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                           <p className="text-2xl font-black text-orange-600 leading-none">{menuItems.filter(i => i.isHidden).length}</p>
                           <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Ascunse</p>
                        </div>
                     </div>
                     {menuItems.filter(i => i.isHidden).length > 0 && (
                       <button 
                         onClick={async () => {
                           const hiddenCount = menuItems.filter(i => i.isHidden).length;
                           if (hiddenCount === 0) {
                             showSaveFeedback("Nu sunt produse ascunse.");
                             return;
                           }
                           
                           setIsDeletingHidden(true);
                           try {
                             await deleteHiddenMenuItems();
                             showSaveFeedback(`Succes: ${hiddenCount} produse șterse!`);
                           } catch (e) {
                             console.error("Delete error:", e);
                             showSaveFeedback("Eroare la ștergere!");
                           } finally {
                             setIsDeletingHidden(false);
                           }
                         }}
                         disabled={isDeletingHidden}
                         className="w-full py-3 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                       >
                         {isDeletingHidden ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                         {isDeletingHidden ? 'Se șterge...' : 'Șterge Toate Produsele Ascunse'}
                       </button>
                     )}
                  </div>
                  
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                     <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-2 flex items-center gap-2"><AlertCircle className="h-3 w-3" /> Zonă Periculoasă</h4>
                     <p className="text-[11px] text-red-700 leading-snug mb-4">Resetarea va șterge orice modificare personalizată și va reveni la meniul și setările de bază.</p>
                     
                     {!showResetConfirm ? (
                       <button 
                         onClick={() => setShowResetConfirm(true)} 
                         className="w-full py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl text-xs font-black uppercase hover:bg-red-50 transition-all"
                       >
                         Resetare Totală Date
                       </button>
                     ) : (
                       <div className="flex gap-2">
                         <button 
                           onClick={handleFullReset} 
                           disabled={isResetting}
                           className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase hover:bg-red-700 shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                         >
                           {isResetting ? <><Loader2 className="h-4 w-4 animate-spin" /> Se resetează...</> : 'Sunt sigur, Resetează!'}
                         </button>
                         <button 
                           onClick={() => setShowResetConfirm(false)} 
                           disabled={isResetting}
                           className="px-4 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-black uppercase hover:bg-gray-50 transition-all disabled:opacity-50"
                         >
                           Anulează
                         </button>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
