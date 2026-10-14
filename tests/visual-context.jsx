// Visual-only context. Local UI state, never a customer session/API mutation.
import React, { createContext, useContext, useState } from 'react';
const VisualContext = createContext(null);
export function VisualAppProvider({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  return <VisualContext.Provider value={{ mobileMenuOpen, setMobileMenuOpen, searchOpen, setSearchOpen,
    cartCount: 0, wishlistCount: 0, isInWishlist: () => false,
    addToCart: async () => {}, toggleWishlist: async () => {} }}>{children}</VisualContext.Provider>;
}
export const useApp = () => useContext(VisualContext);
