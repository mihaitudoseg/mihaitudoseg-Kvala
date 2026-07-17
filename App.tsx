
import React, { useState, useEffect } from 'react';
import { Page } from './types';
import { Navigation } from './components/nav-menu';
import { Footer } from './components/Footer';
import { EventPopup } from './components/EventPopup';
import { Home } from './pages/Home';
import { MenuPage } from './pages/MenuPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { MenuProvider, useMenu } from './context/MenuContext';
import { InventoryProvider } from './context/InventoryContext';
import { UtensilsCrossed, Loader2 } from 'lucide-react';
import { PrintMenuTemplate } from './components/PrintMenuTemplate';
import { InventoryPage } from './pages/InventoryPage';
import { TablematMenuTemplate } from './components/TablematMenuTemplate';
import { WineMenuTemplate } from './components/WineMenuTemplate';
import { BeverageMenuTemplate } from './components/BeverageMenuTemplate';

// Rebuild trigger
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showTablematPreview, setShowTablematPreview] = useState(false);
  const [showWinePreview, setShowWinePreview] = useState(false);
  const [showBeveragePreview, setShowBeveragePreview] = useState(false);
  const { isLoading, activeVariant } = useMenu();

  // Handle URL parameters (like ?page=menu for QR codes)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    if (pageParam && Object.values(Page).includes(pageParam as Page)) {
      setCurrentPage(pageParam as Page);
    }
    
    if (params.get('preview') === 'beverage') {
      setShowBeveragePreview(true);
    } else if (params.get('preview') === 'wine') {
      setShowWinePreview(true);
    } else if (params.get('preview') === 'tablemat') {
      setShowTablematPreview(true);
    } else if (params.get('preview') === 'print') {
      setShowPrintPreview(true);
    }
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const variantBgMap = {
    aegean: 'bg-sand text-gray-900',
    byzantine: 'bg-[#090B12] text-[#EADBB7]',
    rustic: 'bg-[#FAF6EE] text-amber-950',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand flex flex-col items-center justify-center">
        <div className="animate-bounce mb-4 text-greek-blue">
          <UtensilsCrossed className="h-12 w-12" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">KVALA</h2>
        <div className="flex items-center gap-2 text-greek-gold">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-bold uppercase tracking-widest">Se încarcă gustul Greciei...</span>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME:
        return <Home setPage={setCurrentPage} />;
      case Page.MENU:
        return <MenuPage />;
      case Page.RESERVATIONS:
        return <ReservationsPage />;
      case Page.CONTACT:
        return <ContactPage />;
      case Page.ADMIN:
        return <AdminPage onNavigate={setCurrentPage} />;
      case Page.INVENTORY:
        return <InventoryPage onNavigate={setCurrentPage} />;
      default:
        return <Home setPage={setCurrentPage} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${variantBgMap[activeVariant]}`}>
      <EventPopup />
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="flex-grow">
        {renderPage()}
      </main>

      <Footer onNavigate={setCurrentPage} />
      
      {/* Global Print Preview Modal */}
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
      
      {/* Hidden templates for browser print mechanism */}
      <PrintMenuTemplate />
      <TablematMenuTemplate />
      <WineMenuTemplate />
      <BeverageMenuTemplate />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <MenuProvider>
      <InventoryProvider>
        <AppContent />
      </InventoryProvider>
    </MenuProvider>
  );
};

export default App;
