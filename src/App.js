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

// Stable references prevent unnecessary Toaster re-renders
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
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
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
