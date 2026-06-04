import React from 'react';
import '@/App.css';
import '@/lib/i18n';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider } from '@/contexts/AppContext';
import { SmoothScrollProvider } from '@/components/layout/SmoothScrollProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { SearchOverlay } from '@/components/layout/SearchOverlay';
import { Loader } from '@/components/layout/Loader';
import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import CategoryPage from '@/pages/CategoryPage';
import ProductDetail from '@/pages/ProductDetail';
import BrandsIndex from '@/pages/BrandsIndex';
import BrandDetail from '@/pages/BrandDetail';
import Customize from '@/pages/Customize';
import Cart from '@/pages/Cart';
import Wishlist from '@/pages/Wishlist';
import AdminPanel from '@/pages/AdminPanel';
import {
  ContactPage,
  ShippingPage,
  ReturnsPage,
  FAQPage,
  TrackPage,
  PrivacyPage,
  TermsPage,
  CookiesPage,
} from '@/pages/SupportPages';

const TOASTER_STYLE = {
  background: 'rgba(10,11,14,0.95)',
  color: '#F2F4F7',
  border: '1px solid #232B3A',
  fontFamily: 'Inter, ui-sans-serif',
};

const TOAST_OPTIONS = { style: TOASTER_STYLE };

function Shell() {
  const [ready, setReady] = React.useState(false);
  const handleDone = React.useCallback(() => setReady(true), []);

  return (
    <div className="App relative">
      {!ready && <Loader onDone={handleDone} />}
      <Routes>
        {/* Admin — sans Navbar/Footer */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Routes publiques */}
        <Route path="*" element={
          <>
            <Navbar />
            <MobileMenu />
            <SearchOverlay />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/brands" element={<BrandsIndex />} />
              <Route path="/brands/:slug" element={<BrandDetail />} />
              <Route path="/customize" element={<Customize />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              {/* Support */}
              <Route path="/support/contact" element={<ContactPage />} />
              <Route path="/support/shipping" element={<ShippingPage />} />
              <Route path="/support/returns" element={<ReturnsPage />} />
              <Route path="/support/faq" element={<FAQPage />} />
              <Route path="/support/track" element={<TrackPage />} />
              {/* Légal */}
              <Route path="/legal/privacy" element={<PrivacyPage />} />
              <Route path="/legal/terms" element={<TermsPage />} />
              <Route path="/legal/cookies" element={<CookiesPage />} />
              <Route path="*" element={<Home />} />
            </Routes>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <SmoothScrollProvider>
          <Shell />
          <Toaster theme="dark" position="bottom-right" toastOptions={TOAST_OPTIONS} />
        </SmoothScrollProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
