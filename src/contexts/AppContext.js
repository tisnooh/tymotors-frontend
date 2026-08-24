import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Cart, Products, Wishlist } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const AppContext = createContext(null);

const DEFAULT_CART = { items: [], subtotal: 0, currency: 'EUR' };
const DEFAULT_WISHLIST = { items: [] };

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(DEFAULT_CART);
  const [wishlist, setWishlist] = useState(DEFAULT_WISHLIST);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      const data = await Cart.get();
      setCart(data);
    } catch (e) {
      // Network errors are not blocking for guest sessions
      // eslint-disable-next-line no-console
      console.warn('[TYMotors] refreshCart failed:', e?.message || e);
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    try {
      if (user) {
        const guestIds = JSON.parse(localStorage.getItem('ty_guest_wishlist') || '[]');
        if (guestIds.length) {
          await Promise.allSettled(guestIds.map((productId) => Wishlist.add(productId)));
          localStorage.removeItem('ty_guest_wishlist');
        }
        setWishlist(await Wishlist.get());
      } else {
        const guestIds = JSON.parse(localStorage.getItem('ty_guest_wishlist') || '[]');
        if (!guestIds.length) { setWishlist(DEFAULT_WISHLIST); return; }
        const products = await Products.list({ limit: 100 });
        setWishlist({ items: (products.items || []).filter((product) => guestIds.includes(product.id)) });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[TYMotors] refreshWishlist failed:', e?.message || e);
    }
  }, [user]);

  useEffect(() => {
    if (user) Cart.claim().then(setCart).catch(() => refreshCart());
    else refreshCart();
    refreshWishlist();
  }, [user, refreshCart, refreshWishlist]);

  const addToCart = useCallback(async (productId, quantity = 1, selectedVehicle = null) => {
    const data = await Cart.add(productId, quantity, selectedVehicle);
    setCart(data);
    return data;
  }, []);

  const updateCart = useCallback(async (productId, quantity) => {
    const data = await Cart.update(productId, quantity);
    setCart(data);
    return data;
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    const data = await Cart.remove(productId);
    setCart(data);
    return data;
  }, []);

  const clearCart = useCallback(async () => {
    const data = await Cart.clear();
    setCart(data);
    return data;
  }, []);

  const toggleWishlist = useCallback(
    async (productId) => {
      const isIn = wishlist.items.some((p) => p.id === productId);
      if (user) {
        const data = isIn ? await Wishlist.remove(productId) : await Wishlist.add(productId);
        setWishlist(data);
        return data;
      }
      const ids = JSON.parse(localStorage.getItem('ty_guest_wishlist') || '[]');
      const nextIds = isIn ? ids.filter((id) => id !== productId) : [...new Set([...ids, productId])];
      localStorage.setItem('ty_guest_wishlist', JSON.stringify(nextIds));
      const products = await Products.list({ limit: 100 });
      const data = { items: (products.items || []).filter((product) => nextIds.includes(product.id)) };
      setWishlist(data);
      return data;
    },
    [user, wishlist.items]
  );

  const isInWishlist = useCallback(
    (productId) => wishlist.items.some((p) => p.id === productId),
    [wishlist.items]
  );

  const cartCount = useMemo(
    () => cart.items.reduce((acc, it) => acc + (it.quantity || 0), 0),
    [cart.items]
  );
  const wishlistCount = wishlist.items.length;

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      wishlist,
      wishlistCount,
      refreshCart,
      refreshWishlist,
      addToCart,
      updateCart,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isInWishlist,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      mobileMenuOpen,
      setMobileMenuOpen,
      loading,
      setLoading,
    }),
    [
      cart,
      cartCount,
      wishlist,
      wishlistCount,
      refreshCart,
      refreshWishlist,
      addToCart,
      updateCart,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isInWishlist,
      cartOpen,
      searchOpen,
      mobileMenuOpen,
      loading,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
