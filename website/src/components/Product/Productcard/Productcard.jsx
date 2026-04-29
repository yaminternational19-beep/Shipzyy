import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import StarIcon from "@mui/icons-material/Star"; 
import StarHalfIcon from "@mui/icons-material/StarHalf";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../pages/cart/CartContext";
import { useWishlist } from "../../../pages/wishlist/WishlistContext";

const Card = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, addToCart, removeFromCart } = useCart();
  const { toggleWishlist, isProductLiked } = useWishlist();

  const [showAuthModal, setShowAuthModal] = useState(false);

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const liked = isProductLiked(product.id);

  const requireLogin = () => {
    if (!user) { 
      setShowAuthModal(true); 
      return false; 
    }
    return true;
  };

  const goToProduct = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/product/${product.id}`);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (requireLogin()) {
      addToCart(product);
      navigate("/cart"); 
    }
  };

  const offerPrice = parseFloat(product.offer_price || product.sale_price || 0);
  const mrp = parseFloat(product.mrp || product.MRP || 0);
  const discount = product.discount_percentage || product.discount_value || 0;

  return (
    <>
      <div className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:border-cyan-900/20">
        
        {/* Wishlist Button */}
        <button 
          className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:scale-110 transition-transform"
          onClick={(e) => { e.stopPropagation(); if(requireLogin()) toggleWishlist(product); }}
        >
          {liked ? <FavoriteIcon className="text-red-500 !text-lg" /> : <FavoriteBorderIcon className="text-slate-300 !text-lg" />}
        </button>

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-cyan-900 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg">
            {Math.round(discount)}% OFF
          </span>
        )}

        {/* Image Container */}
        <div className="w-full aspect-square bg-slate-50/30 overflow-hidden cursor-pointer flex items-center justify-center" onClick={goToProduct}>
          <img 
            src={product.image || product.product_image || product.primary_image} 
            alt={product.name} 
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" 
            onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=No+Image"; }}
          />
        </div>

        {/* Info Section */}
        <div className="p-3 flex flex-col flex-grow text-slate-900">
          
          <h3 className="text-sm font-black truncate mb-0.5 group-hover:text-cyan-900 transition-colors cursor-pointer" onClick={goToProduct}>
            {product.name}
          </h3>

          <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-tight mb-2 flex-grow cursor-pointer" onClick={goToProduct}>
            {product.description || "Premium quality product."}
          </p>

          {/* Rating Section */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => {
                const rating = parseFloat(product.avg_rating || 0);
                if (star <= Math.floor(rating)) return <StarIcon key={star} className="!text-[18px]" />;
                if (star === Math.ceil(rating) && rating % 1 >= 0.3) return <StarHalfIcon key={star} className="!text-[18px]" />;
                return <StarIcon key={star} className="!text-[18px] text-slate-200" />;
              })}
            </div>
            <span className="text-[12px] font-black ml-1">
              {parseFloat(product.avg_rating || 0).toFixed(1)}
            </span>
          </div>

          {/* Price Row */}
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-lg font-black text-cyan-900">₹{offerPrice}</span>
            {mrp > offerPrice && (
              <span className="text-[10px] text-slate-400 line-through font-bold">₹{mrp}</span>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-auto flex gap-2">
            <button 
              onClick={handleBuyNow} 
              className="flex-[1.5] bg-cyan-900 text-white text-[10px] font-black py-2.5 rounded-xl hover:bg-cyan-950 transition-all uppercase tracking-wider"
            >
              Buy Now
            </button>

            {quantity === 0 ? (
              <button 
                className="flex-[1.5] bg-white border-2 border-cyan-900 text-cyan-900 text-[10px] font-black py-2 rounded-xl hover:bg-cyan-50 transition-colors uppercase"
                onClick={(e) => { e.stopPropagation(); if(requireLogin()) addToCart(product); }}
              >
                Add
              </button>
            ) : (
              <div className="flex-[1.5] flex items-center justify-between bg-cyan-900 text-white rounded-xl px-2 h-[38px]">
                <button onClick={(e) => { e.stopPropagation(); removeFromCart(product.id); }} className="hover:bg-white/20 rounded p-0.5 transition-colors">
                  <RemoveIcon className="!text-md" />
                </button>
                <span className="text-xs font-black">{quantity}</span>
                <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="hover:bg-white/20 rounded p-0.5 transition-colors">
                  <AddIcon className="!text-md" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-[320px] w-full shadow-2xl flex flex-col items-center text-center animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-cyan-900/10 rounded-full flex items-center justify-center mb-4 text-cyan-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.25 8.25v-3a3.25 3.25 0 10-6.5 0v3h6.5z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2">Login Required</h3>
            <p className="text-xs font-bold text-slate-500 mb-6 px-2 leading-relaxed">
              Please login to add items to your cart and complete your purchase.
            </p>

            <div className="flex w-full gap-3">
              <button 
                className="flex-1 bg-slate-100 text-slate-500 text-xs font-black py-3 rounded-xl uppercase tracking-widest"
                onClick={() => setShowAuthModal(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 bg-cyan-900 text-white text-xs font-black py-3 rounded-xl shadow-lg shadow-cyan-900/30 uppercase tracking-widest"
                onClick={() => navigate("/login")}
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .animate-fade-in { animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Card;