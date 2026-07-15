import React from 'react';
import '@/App.css';
import '@/lib/i18n';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider } from '@/contexts/AppContext';
import { SmoothScrollProvider } from '@/components/layout/SmoothScrollProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { SearchOverlay } from '@/components/layout/SearchOverlay';
import { Loader } from '@/components/layout/Loader';
import { SeoManager } from '@/components/layout/SeoManager';
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

const Home = React.lazy(() => import('@/pages/Home'));
const Shop = React.lazy(() => import('@/pages/Shop'));
const CategoryPage = React.lazy(() => import('@/pages/CategoryPage'));
const ProductDetail = React.lazy(() => import('@/pages/ProductDetail'));
const BrandsIndex = React.lazy(() => import('@/pages/BrandsIndex'));
const BrandDetail = React.lazy(() => import('@/pages/BrandDetail'));
const Customize = React.lazy(() => import('@/pages/Customize'));
const Cart = React.lazy(() => import('@/pages/Cart'));
const Wishlist = React.lazy(() => import('@/pages/Wishlist'));
const AdminPanel = React.lazy(() => import('@/pages/AdminPanel'));
const OrderSuccess = React.lazy(() => import('@/pages/OrderSuccess'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

const TOASTER_STYLE = {
  background: 'rgba(10,11,14,0.95)',
  color: '#F2F4F7',
  border: '1px solid #232B3A',
  fontFamily: 'Inter, ui-sans-serif',
};

const TOAST_OPTIONS = { style: TOASTER_STYLE };

function Shell() {
  const location = useLocation();
  const [ready, setReady] = React.useState(() => sessionStorage.getItem('ty_loader_seen') === '1');
  const handleDone = React.useCallback(() => {
    sessionStorage.setItem('ty_loader_seen', '1');
    setReady(true);
  }, []);
  const showLoader = !ready && location.pathname !== '/admin';

  return (
    <div className="App relative">
      <SeoManager />
      {showLoader && <Loader onDone={handleDone} />}
      <React.Suspense fallback={<div className="min-h-screen bg-[#050608]" aria-label="Chargement" />}>
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
              <Route path="/order-success" element={<OrderSuccess />} />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </>
        } />
        </Routes>
      </React.Suspense>
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
