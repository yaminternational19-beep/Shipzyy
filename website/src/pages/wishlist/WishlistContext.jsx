import React, { createContext, useState, useEffect, useContext } from 'react';

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const isLiked = prev.find((item) => item.id === product.id);
      if (isLiked) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isProductLiked = (productId) => wishlist.some((item) => item.id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isProductLiked }}>
      {children}
    </WishlistContext.Provider>
  );
};