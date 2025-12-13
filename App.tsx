import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { Collections } from './components/Collections';
import { Maison } from './components/Maison';
import { Journal } from './components/Journal';
import { Footer } from './components/Footer';
import { Shop } from './components/Shop';
import { CustomCursor } from './components/CustomCursor';
import { Preloader } from './components/Preloader';
import { Chatbot } from './components/Chatbot';
import { CartSidebar } from './components/CartSidebar';
import { Checkout } from './components/Checkout';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfUse } from './components/TermsOfUse';
import { ShippingReturns } from './components/ShippingReturns';
import { BookAppointment } from './components/BookAppointment';
import { OrderTracking } from './components/OrderTracking';
import { Careers } from './components/Careers';
import { ContactUs } from './components/ContactUs';
import { Profile } from './components/Profile';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(() => {
    // Check if returning from OAuth redirect to skip preloader
    const hash = window.location.hash;
    const search = window.location.search;
    return !(hash.includes('access_token') || hash.includes('type=recovery') || search.includes('code='));
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [navigationParams, setNavigationParams] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();

  // Handle URL parameters for deep linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const id = params.get('id');

    if (page) {
      setCurrentPage(page);
      if (id) {
        setNavigationParams({ orderId: id }); // Map 'id' to 'orderId' for tracking
      }
    }
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    // Allow navigation if params are present even if on same page (e.g. to open a different product)
    if (page === currentPage && !params && !isTransitioning) return;
    if (isTransitioning) return;

    // 1. Trigger exit animation
    setIsTransitioning(true);

    // 2. Wait for exit animation to complete (matching CSS duration)
    setTimeout(() => {
      setCurrentPage(page);
      setNavigationParams(params || null);
      window.scrollTo(0, 0);

      // 3. Small delay to ensure DOM render before triggering enter animation
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 700);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'collections':
        return <Collections onNavigate={handleNavigate} />;
      case 'maison':
        return <Maison />;
      case 'journal':
        return <Journal />;
      case 'shop':
        return <Shop initialProductId={navigationParams?.productId} />;
      case 'checkout':
        return <Checkout onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfUse />;
      case 'shipping':
        return <ShippingReturns />;
      case 'appointment':
        return <BookAppointment />;
      case 'tracking':
        return <OrderTracking initialOrderId={navigationParams?.orderId} />;
      case 'careers':
        return <Careers />;
      case 'contact':
        return <ContactUs />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
    
      <div className="min-h-screen bg-void text-offwhite font-body selection:bg-luxury selection:text-void cursor-none relative overflow-x-hidden">
        {/* Global Elements */}
        <CustomCursor />
        <Chatbot />
        <CartSidebar onCheckout={() => {
          if (user) {
            handleNavigate('checkout');
          } else {
            setIsAuthModalOpen(true);
          }
        }} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        
        {/* Main Layout */}
        <div className={`transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          {/* Header shows everywhere except potentially checkout if desired, but nice to keep navigation */}
          <Header 
            onNavigate={handleNavigate} 
            currentPage={currentPage} 
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
          
          <main 
            className={`relative z-10 min-h-screen transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isTransitioning 
                ? 'opacity-0 translate-y-12 blur-lg scale-[0.98]' 
                : 'opacity-100 translate-y-0 blur-0 scale-100'
            }`}
          >
            {renderPage()}
          </main>
          
          <Footer onNavigate={handleNavigate} />
        </div>
      </div>
    </>
  );
};

export default App;