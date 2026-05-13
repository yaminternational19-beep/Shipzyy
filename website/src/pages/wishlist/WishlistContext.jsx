import { createContext, useContext, useState, useEffect } from "react";
import { toggleWishlistApi, getWishlistItems } from "../../utils/wishlistApi";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync with Backend
  const fetchWishlist = async () => {
    if (user) {
      try {
        const res = await getWishlistItems();
        if (res.success) setWishlist(res.data.items || []);
      } catch (err) { console.error(err); }
    }
  };

  useEffect(() => { fetchWishlist(); }, [user]);

  const toggleWishlist = async (product) => {
    if (!user) {
      toast.info("Please login to manage wishlist");
      return;
    }

    const isLiked = !wishlist.some(item => item.id === product.id);
    
    if (isLiked) {
      setWishlist(prev => [...prev, product]);
    } else {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
    }

    try {
      const res = await toggleWishlistApi(product.id, isLiked);
      if (res.success) {
        toast.success(isLiked ? "Added to Wishlist" : "Removed from Wishlist");
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
      fetchWishlist(); 
    }
  };

  const isProductLiked = (id) => wishlist.some(item => item.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isProductLiked, loading, setWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);