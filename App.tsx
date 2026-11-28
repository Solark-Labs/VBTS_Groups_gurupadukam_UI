import React, { useEffect, useState, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartModal } from './components/CartModal';
import { ToastContainer } from './components/Toast';
import { PadukaAI } from './components/PadukaAI';
import { GalaxyBrandSplash } from './components/GalaxyBrandSplash';
import { Home } from './pages/Home';

const Services = lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const Purohits = lazy(() => import('./pages/Purohits').then(m => ({ default: m.Purohits })));
const PurohitProfile = lazy(() => import('./pages/PurohitProfile').then(m => ({ default: m.PurohitProfile })));
const PurohitDashboard = lazy(() => import('./pages/PurohitDashboard').then(m => ({ default: m.PurohitDashboard })));
const Apara = lazy(() => import('./pages/Apara').then(m => ({ default: m.Apara })));
const AparaProfile = lazy(() => import('./pages/AparaProfile').then(m => ({ default: m.AparaProfile })));
const Marketplace = lazy(() => import('./pages/Marketplace').then(m => ({ default: m.Marketplace })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const TrackOrder = lazy(() => import('./pages/TrackOrder').then(m => ({ default: m.TrackOrder })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy').then(m => ({ default: m.ShippingPolicy })));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy').then(m => ({ default: m.ReturnPolicy })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

const BrandSplashScreen: React.FC = () => {
  const { language } = useAppContext();
  const [visible, setVisible] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gp_brand_splash_seen') !== '1';
    } catch {
      return true;
    }
  });

  const dismiss = () => {
    try {
      localStorage.setItem('gp_brand_splash_seen', '1');
    } catch {
      // Ignore storage error
    }
    setVisible(false);
  };

  return (
    <GalaxyBrandSplash
      visible={visible}
      onDismiss={dismiss}
      language={language === 'te' ? 'te' : 'en'}
    />
  );
};

const PAGE_TITLES: Record<string, string> = {
  '/': 'Guru Padukam — Verified Vedic Purohits, Apara Seva & Pooja Essentials',
  '/services': 'Vedic Services & Rituals | Guru Padukam',
  '/purohits': 'Book Verified Purohits | Guru Padukam',
  '/purohit-dashboard': 'Purohit Partner Portal | Guru Padukam',
  '/apara': 'Apara Seva & Shraddha Peetas | Guru Padukam',
  '/marketplace': 'Pooja Samagri Marketplace | Guru Padukam',
  '/products': 'Pooja Samagri Marketplace | Guru Padukam',
  '/about': 'About Us | Guru Padukam',
  '/contact': 'Contact Us | Guru Padukam',
  '/track-order': 'Track Order & Booking | Guru Padukam',
  '/login': 'Sign In / Register | Guru Padukam',
  '/profile': 'My Profile | Guru Padukam',
  '/admin': 'Admin Dashboard | Guru Padukam',
  '/privacy': 'Privacy Policy | Guru Padukam',
  '/terms': 'Terms of Service | Guru Padukam',
  '/shipping-policy': 'Shipping & Delivery Policy | Guru Padukam',
  '/return-policy': 'Refund & Cancellation Policy | Guru Padukam',
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const { setCartOpen } = useAppContext();
  useEffect(() => {
    window.scrollTo(0, 0);
    setCartOpen(false);
    document.title = PAGE_TITLES[pathname] || 'Guru Padukam';
  }, [pathname, setCartOpen]);
  return null;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen font-sans">
          <Navbar />
          <BrandSplashScreen />
          <main className="flex-grow">
            <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center bg-cream text-maroon font-cinzel text-sm">Loading…</div>}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/purohits" element={<Purohits />} />
              <Route path="/purohits/:id" element={<PurohitProfile />} />
              <Route path="/purohit-dashboard" element={<PurohitDashboard />} />
              <Route path="/apara" element={<Apara />} />
              <Route path="/apara/:id" element={<AparaProfile />} />
              <Route path="/marketplace" element={<Marketplace />} />
              {/* Legacy route */}
              <Route path="/products" element={<Marketplace />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<About />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </main>
          <Footer />
          <CartModal />
          <ToastContainer />
          <PadukaAI />

          {/* WhatsApp Float (Bottom-Left so Bottom-Right belongs to Guru Padukam AI Logo) */}
          <a
            href="https://wa.me/919949730175?text=Namaste%20Guru%20Padukam!%20%F0%9F%99%8F%20I%20need%20help%20with%20my%20pooja%20requirements."
            className="fixed bottom-6 left-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg z-50 hover:-translate-y-1 hover:shadow-xl transition-all"
            target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8" />
          </a>
        </div>
      </HashRouter>
      <SpeedInsights />
    </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
