import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartModal } from './components/CartModal';
import { ToastContainer } from './components/Toast';
import { PadukaAI } from './components/PadukaAI';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Purohits } from './pages/Purohits';
import { PurohitProfile } from './pages/PurohitProfile';
import { PurohitDashboard } from './pages/PurohitDashboard';
import { Apara } from './pages/Apara';
import { AparaProfile } from './pages/AparaProfile';
import { Marketplace } from './pages/Marketplace';
import { About } from './pages/About';
import { TrackOrder } from './pages/TrackOrder';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { ShippingPolicy } from './pages/ShippingPolicy';
import { ReturnPolicy } from './pages/ReturnPolicy';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen font-sans">
          <Navbar />
          <main className="flex-grow">
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
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
            </Routes>
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
    </AppProvider>
  );
};

export default App;
