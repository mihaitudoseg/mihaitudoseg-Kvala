import React, { useState, useEffect } from 'react';
import { useMenu } from '../context/MenuContext';
import { MenuItem, SiteImages, SiteContent, ReservationData, PromoItem, Page, GalleryImage } from '../types';
import { dbDebugInfo, dbService, API_BASE_URL } from '../services/db';
import { 
  Trash2, Upload, Plus, 
  ImageIcon, ArrowRight,
  Type, CheckCircle2, 
  Loader2, AlertCircle,
  RefreshCcw, Home, Utensils, CalendarDays, Info,
  ShieldCheck, Activity, DatabaseZap, Download,
  Eye, EyeOff, Layers, Settings2, ChevronUp, ChevronDown, Star, X,
  Images, Camera, ChevronLeft, ChevronRight, Edit3, MessageSquare
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
    menuItems, siteImages, siteContent, galleryImages, isDbActive,
    updateMenuItem, deleteMenuItem, deleteHiddenMenuItems, addMenuItem, reorderMenuItems,
    updateSiteImage, updateSiteContent, restoreDefaults,
    addGalleryImages, updateGalleryImage, deleteGalleryImage, reorderGalleryImages
  } = useMenu();
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!dbService.getAuthToken());
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'menu' | 'reservations' | 'gallery' | 'content' | 'images' | 'system'>('menu');
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

  // Gallery Admin State
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryProgress, setGalleryProgress] = useState<{ current: number; total: number } | null>(null);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [tempCaption, setTempCaption] = useState<string>('');

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [addModalError, setAddModalError] = useState<string | null>(null);
  const [newProductForm, setNewProductForm] = useState<{
    name: string;
    category: string;
    price: string;
    description: string;
    weight: string;
    calories: string;
    imageFile: File | null;
    imagePreview: string | null;
  }>({
    name: '',
    category: '',
    price: '',
    description: '',
    weight: '',
    calories: '',
    imageFile: null,
    imagePreview: null
  });

  const [dbStatus, setDbStatus] = useState<{
    status: 'idle' | 'loading' | 'ok' | 'error';
    latencyMs?: number;
    menuCount?: number;
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
        runDiagnostic();
      }
    }
  }, [activeTab, isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(false);
    setLoginErrorMessage('');

    try {
      const res = await dbService.login(password);
      if (res.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(true);
        setLoginErrorMessage(res.error || 'Parolă incorectă');
      }
    } catch (err: any) {
      setLoginError(true);
      setLoginErrorMessage(err.message || 'Eroare la autentificare');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const showSaveFeedback = (msg = "Salvat!") => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const loadReservations = async () => {
    setLoadingRes(true);
    try {
      const data = await dbService.getReservations();
      setReservations([...data].sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()));
    } finally {
      setLoadingRes(false);
    }
  };

  const openAddProductModal = () => {
    const defaultCat = (activeCategory !== 'all' && siteContent.categories.some(c => c.id === activeCategory))
      ? activeCategory
      : (siteContent.categories?.[0]?.id || 'aperitive');

    setNewProductForm({
      name: '',
      category: defaultCat,
      price: '',
      description: '',
      weight: '',
      calories: '',
      imageFile: null,
      imagePreview: null
    });
    setAddModalError(null);
    setIsAddModalOpen(true);
  };

  const closeAddProductModal = () => {
    if (isSubmittingProduct) return;
    setIsAddModalOpen(false);
    setAddModalError(null);
    if (newProductForm.imagePreview) {
      URL.revokeObjectURL(newProductForm.imagePreview);
    }
  };

  const handleModalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (newProductForm.imagePreview) {
        URL.revokeObjectURL(newProductForm.imagePreview);
      }
      setNewProductForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name.trim()) {
      setAddModalError('Introduceți numele preparatului.');
      return;
    }

    setIsSubmittingProduct(true);
    setAddModalError(null);

    try {
      const newId = `m_${Date.now()}`;
      let uploadedImageUrl: string | undefined = undefined;

      // Upload image to /upload.php if user picked an image
      if (newProductForm.imageFile) {
        uploadedImageUrl = await dbService.uploadImage(newProductForm.imageFile);
      }

      const numPrice = parseFloat(newProductForm.price.replace(',', '.')) || 0;

      const newProduct: MenuItem = {
        id: newId,
        name: newProductForm.name.trim(),
        category: newProductForm.category || siteContent.categories?.[0]?.id || 'uncategorized',
        price: numPrice,
        description: newProductForm.description.trim(),
        weight: newProductForm.weight.trim() || undefined,
        calories: newProductForm.calories.trim() || undefined,
        image: uploadedImageUrl || undefined,
        isHidden: false,
        isHighlighted: false
      };

      // Add to menu context and database (inserted at TOP of category)
      await addMenuItem(newProduct);

      // Automatically switch category filter to the newly created product's category
      setActiveCategory(newProduct.category);

      // Close modal and notify user
      setIsAddModalOpen(false);
      showSaveFeedback(`Preparatul „${newProduct.name}” a fost adăugat cu succes!`);
    } catch (err: any) {
      console.error('Error adding product:', err);
      setAddModalError(err?.message || 'Eroare la salvarea produsului. Vă rugăm să reîncercați.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handlePromoImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPersisting(id);
    try {
      const uploadedUrl = await dbService.uploadImage(file);
      const newPromoItems = (siteContent.promoItems || []).map(item => 
        item.id === id ? { ...item, image: uploadedUrl } : item
      );
      await updateSiteContent('promoItems', '', newPromoItems);
      showSaveFeedback("Imagine promoțională salvată");
    } catch (err: any) {
      alert(`Eroare la încărcarea imaginii: ${err.message}`);
    } finally { 
      setIsPersisting(null); 
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
      image: '',
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

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>, isMenu = true) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPersisting(id);
    try {
      const uploadedUrl = await dbService.uploadImage(file);
      if (isMenu) {
        await updateMenuItem(id, { image: uploadedUrl });
      } else {
        await updateSiteImage(id as keyof SiteImages, uploadedUrl);
      }
      showSaveFeedback("Imagine încărcată și salvată!");
    } catch (err: any) {
      alert(`Eroare la încărcarea imaginii: ${err.message}`);
    } finally { 
      setIsPersisting(null); 
    }
  };

  const handleBulkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsPersisting('bulk');
    let processedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const productName = file.name.replace(/\.[^/.]+$/, "").trim();
      
      try {
        const uploadedUrl = await dbService.uploadImage(file);
        const existingItem = menuItems.find(item => 
          item.name.toLowerCase().trim() === productName.toLowerCase()
        );

        if (existingItem) {
          await updateMenuItem(existingItem.id, { image: uploadedUrl });
        } else {
          const newId = `m_bulk_${Date.now()}_${i}`;
          await addMenuItem({
            id: newId,
            name: productName,
            description: '',
            price: 0,
            category: siteContent.categories?.[0]?.id || 'uncategorized',
            image: uploadedUrl,
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

  const handleGalleryMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingGallery(true);
    const fileList = Array.from(files);
    setGalleryProgress({ current: 0, total: fileList.length });

    const newItems: { url: string; caption?: string }[] = [];
    try {
      for (let i = 0; i < fileList.length; i++) {
        setGalleryProgress({ current: i + 1, total: fileList.length });
        const file = fileList[i];
        const uploadedUrl = await dbService.uploadImage(file);
        if (uploadedUrl) {
          newItems.push({ url: uploadedUrl, caption: '' });
        }
      }

      if (newItems.length > 0) {
        await addGalleryImages(newItems);
        showSaveFeedback(`${newItems.length} imagini adăugate în galerie!`);
      }
    } catch (err: any) {
      console.error('Gallery upload error:', err);
      alert('Eroare la încărcarea imaginilor în galerie: ' + (err?.message || 'Eroare necunoscută'));
    } finally {
      setIsUploadingGallery(false);
      setGalleryProgress(null);
      e.target.value = '';
    }
  };

  const handleMoveGallery = async (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryImages.length) return;
    const items = [...galleryImages];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    await reorderGalleryImages(items);
    showSaveFeedback('Ordinea imaginilor a fost salvată');
  };

  const handleSaveCaption = async (id: string, newCaption: string) => {
    await updateGalleryImage(id, { caption: newCaption.trim() });
    setEditingCaptionId(null);
    showSaveFeedback('Descriere salvată');
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (confirm('Sigur doriți să ștergeți această imagine din galerie?')) {
      await deleteGalleryImage(id);
      showSaveFeedback('Imagine ștearsă din galerie');
    }
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

  const inputClass = "w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-greek-blue outline-none text-sm shadow-sm transition-colors";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block";

  const runDiagnostic = async () => {
    setDbStatus({ status: 'loading', message: 'Se testează conexiunea la serverul api.wizart.ro...' });
    const result = await dbService.testApiConnection();
    setDbStatus({
      status: result.status,
      latencyMs: result.latencyMs,
      menuCount: result.menuCount,
      message: result.message
    });
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
              {loginError && (
                <p className="text-red-500 text-[10px] font-bold uppercase mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {loginErrorMessage || 'Parolă incorectă'}
                </p>
              )}
            </div>
            
            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 bg-greek-blue text-white rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isLoggingIn ? 'Se verifică...' : 'Autentificare'} {!isLoggingIn && <ArrowRight className="h-4 w-4" />}
            </button>
            
            <button 
              type="button"
              onClick={() => onNavigate(Page.HOME)}
              className="w-full py-3 text-gray-400 hover:text-gray-600 font-bold text-[10px] uppercase tracking-widest transition-colors"
            >
              Înapoi la Site
            </button>
          </form>
        </div>
      </div>
    );
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

      {/* Modal: Adaugă Produs Nou */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden my-8">
            <div className="bg-greek-blue text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                <h3 className="font-serif font-bold text-lg">Adaugă Produs Nou</h3>
              </div>
              <button 
                type="button" 
                onClick={closeAddProductModal}
                disabled={isSubmittingProduct}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="p-6 space-y-4">
              {addModalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{addModalError}</span>
                </div>
              )}

              <div>
                <label className={labelClass}>Nume Preparat *</label>
                <input 
                  type="text" 
                  required
                  value={newProductForm.name}
                  onChange={e => setNewProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Cotlet de berbecuț"
                  className={inputClass}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Categorie *</label>
                  <select 
                    value={newProductForm.category}
                    onChange={e => setNewProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className={inputClass}
                  >
                    {siteContent.categories?.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Preț (Lei) *</label>
                  <input 
                    type="text" 
                    value={newProductForm.price}
                    onChange={e => setNewProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Ex: 48"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Descriere / Ingrediente</label>
                <textarea 
                  rows={2}
                  value={newProductForm.description}
                  onChange={e => setNewProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: roșii, castraveți, feta grecească, ulei de măsline Kalamata..."
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Gramaj (opțional)</label>
                  <input 
                    type="text" 
                    value={newProductForm.weight}
                    onChange={e => setNewProductForm(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="Ex: 350gr"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Kcal (opțional)</label>
                  <input 
                    type="text" 
                    value={newProductForm.calories}
                    onChange={e => setNewProductForm(prev => ({ ...prev, calories: e.target.value }))}
                    placeholder="Ex: 420"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Imagine Preparat (opțional)</label>
                <div className="flex items-center gap-4">
                  {newProductForm.imagePreview ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border relative flex-shrink-0">
                      <img src={newProductForm.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer py-2 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition">
                    <Upload className="h-4 w-4 text-greek-blue" />
                    <span>{newProductForm.imageFile ? newProductForm.imageFile.name : 'Alege Fișier Imagine'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleModalImageChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={closeAddProductModal}
                  disabled={isSubmittingProduct}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Anulează
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="px-6 py-2.5 rounded-xl bg-greek-blue text-white font-bold text-xs uppercase hover:bg-blue-700 shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {isSubmittingProduct ? 'Se salvează...' : 'Adaugă Produs'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
              { id: 'gallery', icon: Images, label: 'Galerie' },
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
              <button 
                onClick={openAddProductModal} 
                className="bg-greek-blue text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-blue-700 transition shadow-lg"
              >
                <Plus className="h-4 w-4" /> Adaugă Produs
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {menuItems.filter(item => activeCategory === 'all' || item.category === activeCategory).map(item => (
                <div key={item.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row transition-all hover:border-greek-blue/30 ${item.isHidden ? 'opacity-50 border-dashed bg-gray-50/50' : ''}`}>
                  <div className="w-full md:w-40 h-40 bg-gray-50 relative group flex-shrink-0">
                    {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon className="h-8 w-8" /></div>}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-white text-[10px] font-black uppercase transition-opacity">
                      {isPersisting === item.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                      {isPersisting === item.id ? 'Se încarcă...' : 'Schimbă Poza'}
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(item.id, e)} />
                    </label>
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
                <h2 className="text-xl font-serif font-bold text-gray-900">Istoric Rezervări Online</h2>
                <p className="text-xs text-gray-500">Toate rezervările primite prin formularul site-ului.</p>
              </div>
              <button 
                onClick={loadReservations} 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
              >
                <RefreshCcw className={`h-4 w-4 ${loadingRes ? 'animate-spin' : ''}`} /> Actualizează
              </button>
            </div>

            {loadingRes ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                <Loader2 className="h-8 w-8 text-greek-blue animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-bold uppercase">Se încarcă rezervările...</p>
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                <CalendarDays className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-base font-serif font-bold text-gray-900 mb-1">Nu există rezervări</h3>
                <p className="text-xs text-gray-400">Rezervările trimise de clienți vor apărea automat aici.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="py-4 px-6">Client</th>
                        <th className="py-4 px-6">Telefon</th>
                        <th className="py-4 px-6">Data & Ora</th>
                        <th className="py-4 px-6">Persoane</th>
                        <th className="py-4 px-6">Mențiuni</th>
                        <th className="py-4 px-6 text-right">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {reservations.map(res => (
                        <tr key={res.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-4 px-6 font-bold text-gray-900">{res.name}</td>
                          <td className="py-4 px-6 text-gray-600 font-mono text-xs">{res.phone}</td>
                          <td className="py-4 px-6 text-gray-900 font-medium">
                            <span className="bg-blue-50 text-greek-blue px-2.5 py-1 rounded-lg text-xs font-bold mr-2">{res.date}</span>
                            <span className="text-gray-500 font-bold">{res.time}</span>
                          </td>
                          <td className="py-4 px-6 text-gray-600 font-bold">{res.guests} pers.</td>
                          <td className="py-4 px-6 text-gray-500 text-xs italic">{res.notes || '-'}</td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={async () => {
                                if (res.id && confirm('Ștergi această rezervare?')) {
                                  await dbService.deleteReservation(res.id);
                                  loadReservations();
                                  showSaveFeedback("Rezervare ștearsă");
                                }
                              }}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Gallery Upload Section */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-greek-blue flex items-center gap-2">
                    <Images className="h-6 w-6 text-greek-blue" /> Galerie Foto Kvala
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Încărcați mai multe fotografii simultan. Toate imaginile sunt salvate automat pe serverul backend (api.wizart.ro).
                  </p>
                </div>
                <div className="text-xs font-mono font-bold bg-blue-50 text-greek-blue px-3 py-1.5 rounded-xl border border-blue-100 self-start sm:self-auto">
                  {galleryImages.length} {galleryImages.length === 1 ? 'imagine' : 'imagini'} în galerie
                </div>
              </div>

              {/* Upload Drop Zone / Button */}
              <div className="mb-6">
                <label 
                  htmlFor="gallery-file-upload-input"
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isUploadingGallery 
                      ? 'border-greek-blue bg-blue-50/50 cursor-wait' 
                      : 'border-gray-300 hover:border-greek-blue bg-gray-50/50 hover:bg-blue-50/20'
                  }`}
                >
                  <input
                    id="gallery-file-upload-input"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={isUploadingGallery}
                    onChange={handleGalleryMultiUpload}
                    className="hidden"
                  />

                  {isUploadingGallery ? (
                    <div className="text-center py-2">
                      <Loader2 className="h-10 w-10 text-greek-blue animate-spin mx-auto mb-3" />
                      <p className="font-bold text-sm text-gray-800">
                        Se încarcă imaginile pe server...
                      </p>
                      {galleryProgress && (
                        <p className="text-xs text-greek-blue font-mono font-bold mt-1">
                          Procesat {galleryProgress.current} din {galleryProgress.total} fișiere
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <div className="w-14 h-14 rounded-full bg-blue-50 text-greek-blue flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <Upload className="h-7 w-7" />
                      </div>
                      <p className="font-bold text-sm text-gray-800 mb-1">
                        Apasă pentru a selecta una sau mai multe fotografii
                      </p>
                      <p className="text-xs text-gray-500 max-w-md mx-auto">
                        Acceptă fișiere JPG, PNG sau WebP. Poți alege mai multe fișiere deodată din galeria dispozitivului.
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Customizing page header text */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Titlu Pagină Galerie (Public)
                  </label>
                  <input
                    type="text"
                    value={siteContent.galleryPage?.title || 'Galerie Kvala'}
                    onChange={e => updateSiteContent('galleryPage', 'title', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-greek-blue outline-none"
                    placeholder="Ex: Galerie Kvala"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Subtitlu Pagină Galerie (Public)
                  </label>
                  <input
                    type="text"
                    value={siteContent.galleryPage?.subtitle || ''}
                    onChange={e => updateSiteContent('galleryPage', 'subtitle', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-greek-blue outline-none"
                    placeholder="Ex: Momente autentice, preparate proaspete..."
                  />
                </div>
              </div>
            </div>

            {/* Gallery Images List */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-6 flex items-center justify-between">
                <span>Fotografii în Galerie ({galleryImages.length})</span>
                <span className="text-xs font-normal text-gray-500">
                  Folosiți săgețile &larr; &rarr; pentru reordonare
                </span>
              </h3>

              {galleryImages.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                  <Camera className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">Nu există fotografii încărcate în galerie.</p>
                  <p className="text-xs text-gray-400 mt-1">Încărcați primele imagini folosind zona de mai sus.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {galleryImages.map((image, index) => (
                    <div 
                      key={image.id || index}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      {/* Image Thumbnail Container */}
                      <div className="relative aspect-square bg-gray-100 overflow-hidden group">
                        <img 
                          src={image.url} 
                          alt={image.caption || `Galerie ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Order badge */}
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-mono font-bold">
                          #{index + 1}
                        </div>

                        {/* Quick Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryImage(image.id)}
                          className="absolute top-2 right-2 p-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md transition-colors"
                          title="Șterge imaginea"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Controls and Caption */}
                      <div className="p-4 flex flex-col justify-between flex-1 gap-3 bg-white">
                        {/* Caption input */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Descriere / Legendă
                          </label>
                          <input
                            type="text"
                            defaultValue={image.caption || ''}
                            onBlur={e => handleSaveCaption(image.id, e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            placeholder="Adaugă o scurtă descriere..."
                            className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:bg-white focus:ring-2 focus:ring-greek-blue outline-none transition-all"
                          />
                        </div>

                        {/* Reorder & Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveGallery(index, 'left')}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Mută la stânga (mai devreme)"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              disabled={index === galleryImages.length - 1}
                              onClick={() => handleMoveGallery(index, 'right')}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Mută la dreapta (mai târziu)"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryImage(image.id)}
                            className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Șterge
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
               <h2 className="text-lg font-serif font-bold text-greek-blue mb-4 flex items-center gap-2"><Type className="h-5 w-5" /> Informații Generale Site</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className={labelClass}>Titlu Principal (Hero)</label>
                   <input type="text" value={siteContent.home.heroTitle} onChange={e => updateSiteContent('home', 'heroTitle', e.target.value)} className={inputClass} />
                 </div>
                 <div>
                   <label className={labelClass}>Subtitlu Principal (Hero)</label>
                   <input type="text" value={siteContent.home.heroSubtitle} onChange={e => updateSiteContent('home', 'heroSubtitle', e.target.value)} className={inputClass} />
                 </div>
                 <div>
                   <label className={labelClass}>Telefon Rezervări</label>
                   <input type="text" value={siteContent.general.phone} onChange={e => updateSiteContent('general', 'phone', e.target.value)} className={inputClass} />
                 </div>
                 <div>
                   <label className={labelClass}>Adresă Restaurant</label>
                   <input type="text" value={siteContent.general.address} onChange={e => updateSiteContent('general', 'address', e.target.value)} className={inputClass} />
                 </div>
                 <div>
                   <label className={labelClass}>Program de Funcționare</label>
                   <input type="text" value={siteContent.general.hours} onChange={e => updateSiteContent('general', 'hours', e.target.value)} className={inputClass} />
                 </div>
                 <div>
                   <label className={labelClass}>Email Contact</label>
                   <input type="text" value={siteContent.general.email} onChange={e => updateSiteContent('general', 'email', e.target.value)} className={inputClass} />
                 </div>
                 <div>
                   <label className={labelClass}>Instagram Handle</label>
                   <input type="text" value={siteContent.general.instagram} onChange={e => updateSiteContent('general', 'instagram', e.target.value)} className={inputClass} />
                 </div>
                 <div>
                   <label className={labelClass}>Facebook Page</label>
                   <input type="text" value={siteContent.general.facebook} onChange={e => updateSiteContent('general', 'facebook', e.target.value)} className={inputClass} />
                 </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
               <h2 className="text-lg font-serif font-bold text-greek-blue mb-4 flex items-center gap-2"><Info className="h-5 w-5" /> Banner Informativ Disponibilitate Weekend</h2>
               <div className="space-y-4">
                 <p className="text-xs text-gray-500 leading-relaxed">
                   Acest text este afișat în partea superioară a paginilor de <b>Meniu</b> și <b>Rezervări</b>, precum și pe pagina principală.
                 </p>
                 <div>
                   <label className={labelClass}>Text Notificare Weekend</label>
                   <textarea 
                     rows={3}
                     value={siteContent.home?.weekendNotice || ''} 
                     onChange={e => updateSiteContent('home', 'weekendNotice', e.target.value)} 
                     className={inputClass} 
                   />
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-serif font-bold text-greek-blue mb-6 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" /> Imagini Principale Site & Logo
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { key: 'hero', label: 'Imagine Hero (Antet Principal)', contain: false, hint: 'Recomandat 1920×1080px' },
                  { key: 'story', label: 'Imagine Poveste / Terasă', contain: false, hint: 'Recomandat 1200×800px' },
                  { key: 'menuHeader', label: 'Imagine Antet Meniu', contain: false, hint: 'Recomandat 1920×600px' },
                  { key: 'logo', label: 'Logo Site', contain: true, hint: 'PNG / WebP transparent recomandat' }
                ].map(img => {
                  const currentImgUrl = siteImages[img.key as keyof SiteImages];
                  const isLogo = img.key === 'logo';

                  return (
                    <div key={img.key} className="p-4 border border-gray-200 rounded-2xl bg-gray-50/70 flex flex-col items-center justify-between">
                      <div className="w-full text-center mb-3">
                        <p className="text-xs font-bold text-gray-800">{img.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{img.hint}</p>
                      </div>

                      <div className={`w-full h-44 rounded-xl overflow-hidden relative mb-3 group shadow-inner border border-gray-200/80 ${
                        isLogo ? 'bg-white flex items-center justify-center p-3' : 'bg-gray-200'
                      }`}>
                        {currentImgUrl ? (
                          <img 
                            src={currentImgUrl} 
                            alt={img.label}
                            className={`w-full h-full ${img.contain ? 'object-contain' : 'object-cover'}`} 
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1 p-2 text-center">
                            <ImageIcon className="h-8 w-8 text-gray-300" />
                            <span className="text-[11px] text-gray-400 font-medium">Nicio imagine încărcată</span>
                          </div>
                        )}

                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer text-white text-xs font-bold uppercase transition-opacity">
                          {isPersisting === img.key ? (
                            <Loader2 className="h-6 w-6 animate-spin mb-1" />
                          ) : (
                            <Upload className="h-6 w-6 mb-1" />
                          )}
                          <span>{isPersisting === img.key ? 'Se încarcă...' : currentImgUrl ? 'Schimbă' : 'Încarcă'}</span>
                          <input 
                            type="file" 
                            accept={isLogo ? "image/png,image/webp,image/svg+xml,image/jpeg" : "image/*"} 
                            className="hidden" 
                            onChange={e => handleImageUpload(img.key, e, false)} 
                          />
                        </label>
                      </div>

                      <div className="w-full flex items-center gap-2">
                        <label className="flex-1 py-2 px-3 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm text-center">
                          {isPersisting === img.key ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-greek-blue" />
                          ) : (
                            <Upload className="h-3.5 w-3.5 text-gray-500" />
                          )}
                          <span>{isPersisting === img.key ? 'Se procesează...' : currentImgUrl ? 'Înlocuiește' : 'Încarcă'}</span>
                          <input 
                            type="file" 
                            accept={isLogo ? "image/png,image/webp,image/svg+xml,image/jpeg" : "image/*"} 
                            className="hidden" 
                            onChange={e => handleImageUpload(img.key, e, false)} 
                          />
                        </label>

                        {isLogo && currentImgUrl && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm('Doriți să ștergeți logo-ul personalizat și să reveniți la emblema standard?')) {
                                await updateSiteImage('logo', '');
                                showSaveFeedback('Logo-ul a fost resetat la emblema standard.');
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-200 rounded-xl transition-colors shadow-sm"
                            title="Șterge logo-ul personalizat"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* System / Backend Diagnostic for api.wizart.ro */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
               <div className="flex justify-between items-center border-b pb-4 mb-6">
                 <h2 className="text-xl font-serif font-bold text-greek-blue flex items-center gap-2"><Activity className="h-7 w-7" /> Stare Backend & Sincronizare Cloud (api.wizart.ro)</h2>
                 <button 
                   onClick={runDiagnostic} 
                   className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
                   title="Re-testează conexiunea la server"
                 >
                   <RefreshCcw className={`h-4 w-4 ${dbStatus.status === 'loading' ? 'animate-spin' : ''}`} /> Re-testează Serverul
                 </button>
               </div>
               
               <div className="space-y-6">
                  {/* Status Box */}
                  <div className={`p-6 rounded-2xl border transition-all ${
                    dbStatus.status === 'ok' ? 'bg-green-50 border-green-200 text-green-800' :
                    dbStatus.status === 'loading' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                    dbStatus.status === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                    'bg-gray-50 border-gray-200 text-gray-700'
                  }`}>
                    <div className="flex items-start gap-4">
                      {dbStatus.status === 'ok' && <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />}
                      {dbStatus.status === 'loading' && <Loader2 className="h-6 w-6 text-blue-600 mt-0.5 animate-spin flex-shrink-0" />}
                      {dbStatus.status === 'error' && <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />}
                      {dbStatus.status === 'idle' && <Activity className="h-6 w-6 text-gray-400 mt-0.5 flex-shrink-0" />}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-xs uppercase tracking-wider">Backend API: {API_BASE_URL}</p>
                          {dbStatus.latencyMs !== undefined && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/80 border">
                              {dbStatus.latencyMs} ms
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium leading-relaxed">
                          {dbStatus.message || 'Apăsați pe butonul de re-testare de mai sus pentru a verifica conexiunea în timp real.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Preparate Meniu</p>
                      <p className="text-2xl font-serif font-black text-greek-blue">{menuItems.length}</p>
                      <p className="text-[11px] text-gray-500 mt-1">Sincronizate cu api.wizart.ro</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Preparate Ascunse</p>
                      <p className="text-2xl font-serif font-black text-orange-600">{menuItems.filter(i => i.isHidden).length}</p>
                      <p className="text-[11px] text-gray-500 mt-1">Vizibile doar în admin</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Categorii Active</p>
                      <p className="text-2xl font-serif font-black text-emerald-600">{siteContent.categories?.length || 0}</p>
                      <p className="text-[11px] text-gray-500 mt-1">Structură meniu</p>
                    </div>
                  </div>

                  {/* Bulk delete hidden */}
                  {menuItems.filter(i => i.isHidden).length > 0 && (
                    <button 
                      onClick={async () => {
                        const hiddenCount = menuItems.filter(i => i.isHidden).length;
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
                      {isDeletingHidden ? 'Se șterge...' : `Șterge Toate Cele ${menuItems.filter(i => i.isHidden).length} Produse Ascunse`}
                    </button>
                  )}
               </div>
            </div>

            {/* Mass import */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
               <h2 className="text-xl font-serif font-bold text-greek-blue mb-6 flex items-center gap-2 border-b pb-4"><DatabaseZap className="h-7 w-7" /> Import Masiv Poze</h2>
               <div className="space-y-6">
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                     <h4 className="text-xs font-black uppercase text-greek-blue tracking-widest mb-3 flex items-center gap-2"><Upload className="h-4 w-4" /> Încarcă Poze Multiple în Cloud (/upload.php)</h4>
                     <p className="text-[11px] text-gray-600 leading-relaxed mb-5">
                       Selectați mai multe fișiere simultan. Imaginile se încarcă direct pe serverul api.wizart.ro prin /upload.php și se asociază automat preparatelor existente.
                     </p>
                     
                     <label className={`w-full py-4 flex flex-col items-center justify-center border-2 border-dashed border-greek-blue/30 rounded-2xl cursor-pointer hover:bg-white transition-all group ${isPersisting === 'bulk' ? 'opacity-50 pointer-events-none' : ''}`}>
                        {isPersisting === 'bulk' ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 text-greek-blue animate-spin mb-2" />
                            <span className="text-[10px] font-black uppercase text-greek-blue">Se încarcă pozele pe server...</span>
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
               </div>
            </div>

            {/* Reset */}
            <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
               <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-2 flex items-center gap-2"><AlertCircle className="h-3 w-3" /> Zonă Periculoasă</h4>
               <p className="text-[11px] text-red-700 leading-snug mb-4">Resetarea va reinițializa datele din meniu la valorile implicite.</p>
               
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
        )}
      </div>
    </div>
  );
};
