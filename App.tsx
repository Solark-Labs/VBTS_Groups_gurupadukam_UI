import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartModal } from './components/CartModal';
import { ToastContainer } from './components/Toast';
import { PadukaAI } from './components/PadukaAI';
import { SplashOverlay } from './components/SplashOverlay';
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

const BrandSplashScreen: React.FC = () => {
  const { language } = useAppContext();
  const [visible, setVisible] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('gp_brand_splash_seen') !== '1';
    } catch {
      return true;
    }
  });

  const dismiss = () => {
    try {
      sessionStorage.setItem('gp_brand_splash_seen', '1');
    } catch {
      // Ignore storage error
    }
    setVisible(false);
  };

  const isTe = language === 'te';

  return (
    <SplashOverlay
      visible={visible}
      onDismiss={dismiss}
      autoDismissMs={4200}
      eyebrow={isTe ? 'ॐ శ్రీ గురుభ్యో నమః · gurupadukam.com' : 'ॐ श्री गुरुभ्यो नमः · gurupadukam.com'}
      title={isTe ? 'గురు పాదుకంకు స్వాగతం' : 'Welcome to Guru Padukam'}
      subtitle={
        isTe
          ? 'ధృవీకరించబడిన వేద పురోహితులు, గౌరవప్రదమైన అపర సేవ మరియు పూజా సామగ్రి ఒకే వేదికపై.'
          : 'Verified Vedic Purohits, dignified Apara Seva, and hyperlocal Pooja Stores — transparent and guided.'
      }
      features={
        isTe
          ? [
              { icon: '🛡️', title: 'ఆధార్ + ₹1 KYC ధృవీకరణ పొందిన పురోహితులు', desc: 'కేవలం ₹11 టోకెన్‌తో బుకింగ్ — దక్షిణ పురోహితుడితో నేరుగా మాట్లాడుకోవచ్చు.' },
              { icon: '🔄', title: 'ఉచిత తేదీ మార్పిడి & ₹11 వాలెట్ భద్రత', desc: 'పురోహితుడు రద్దు చేస్తే ₹11 మీ వాలెట్‌లో చేరుతుంది — మరో పురోహితుడిని వెంటనే బుక్ చేయవచ్చు.' },
              { icon: '🏪', title: 'భాగస్వామి పూజా స్టోర్‌లు & ప్రత్యక్ష సహాయం', desc: 'పూజా సామగ్రి సమస్య ఉంటే గురు పాదుకం బృందం మీ తరపున వ్యాపారితో మాట్లాడుతుంది.' },
            ]
          : [
              { icon: '🛡️', title: 'Aadhaar + ₹1 Witness KYC Purohits @ ₹11 Token', desc: 'Pay only ₹11 online via Cashfree to confirm — settle Dakshina directly and honestly.' },
              { icon: '🔄', title: 'Free Swaps & Zero-Loss Wallet Safety', desc: 'If a Purohit cancels prior to ritual, ₹11 credits instantly to your Wallet for your next booking.' },
              { icon: '🏪', title: 'Partner Pooja Stores & Dedicated Support', desc: 'Fresh flowers, essentials & return gifts — Guru Padukam speaks to merchants on your behalf.' },
            ]
      }
      ctaLabel={isTe ? 'గురు పాదుకంలోకి ప్రవేశించండి →' : 'Enter Guru Padukam →'}
    />
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
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
    </ErrorBoundary>
  );
};

export default App;
