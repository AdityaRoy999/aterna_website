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
import { JobApplication } from './components/JobApplication';
import { Wishlist } from './components/Wishlist';
import { AdminDashboard } from './admin/AdminDashboard';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import Lenis from 'lenis';
import AOS from 'aos';
import 'aos/dist/aos.css';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    
    // Check for /admin path
    if (window.location.pathname.startsWith('/admin')) {
      return 'admin';
    }
    
    // Check for explicit admin page param
    if (page === 'admin') {
      return 'admin';
    }
    
    // Check for stored admin redirect flag (fallback for OAuth redirects)
    if (localStorage.getItem('redirect_to_admin') === 'true') {
      return 'admin';
    }

    if (page) return page;
    return 'home';
  });

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

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      mirror: false,
      offset: 100,
    });
  }, []);

  // Handle URL parameters and cleanup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const id = params.get('id');

    // Handle Admin Redirect Cleanup
    const storedRedirect = localStorage.getItem('redirect_to_admin');
    
    if (storedRedirect === 'true' || page === 'admin') {
      localStorage.removeItem('redirect_to_admin');
      
      // Force admin state if not already set
      if (currentPage !== 'admin') {
        setCurrentPage('admin');
      }
      
      // Clean up URL to show /admin
      if (!window.location.pathname.startsWith('/admin')) {
        window.history.replaceState(null, '', '/admin');
      }
    }

    if (id) {
      setNavigationParams({ orderId: id });
    }
  }, [currentPage]);

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
        return <Careers onNavigate={handleNavigate} />;
      case 'apply':
        return <JobApplication job={navigationParams?.job} onNavigate={handleNavigate} />;
      case 'wishlist':
        return <Wishlist onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactUs />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  const isAdminPage = currentPage === 'admin';

  return (
    <>
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
    
      <div className={`min-h-screen relative overflow-x-hidden ${
        isAdminPage 
          ? 'bg-void text-offwhite font-body cursor-none selection:bg-luxury selection:text-void' 
          : 'bg-void text-offwhite font-body cursor-none selection:bg-luxury selection:text-void'
      }`}>
        {/* Global Elements */}
        <CustomCursor />
        {!isAdminPage && (
          <>
            <Chatbot onOpenAuth={() => setIsAuthModalOpen(true)} />
            <CartSidebar onCheckout={() => {
              if (user) {
                handleNavigate('checkout');
              } else {
                setIsAuthModalOpen(true);
              }
            }} />
          </>
        )}
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        
        {/* Main Layout */}
        <div className={`transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          {/* Header shows everywhere except potentially checkout if desired, but nice to keep navigation */}
          {!isAdminPage && (
            <Header 
              onNavigate={handleNavigate} 
              currentPage={currentPage} 
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}
          
          <main 
            className={`relative z-10 min-h-screen transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isTransitioning 
                ? 'opacity-0 translate-y-12 blur-lg scale-[0.98]' 
                : 'opacity-100 translate-y-0 blur-0 scale-100'
            }`}
          >
            {renderPage()}
          </main>
          
          {!isAdminPage && <Footer onNavigate={handleNavigate} />}
        </div>
      </div>
    </>
  );
};

export default App;