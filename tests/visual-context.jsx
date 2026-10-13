// Visual-only navbar context. No cart, auth or remote mutations.
export const useApp = () => ({
  cartCount: 0, wishlistCount: 0, setSearchOpen: () => {}, setMobileMenuOpen: () => {},
  isInWishlist: () => false, addToCart: async () => {}, toggleWishlist: async () => {},
});
