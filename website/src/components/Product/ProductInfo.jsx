import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../../pages/cart/CartContext"; 

function ProductInfo({ product, requireLogin }) {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart } = useCart();

  const cartItem = cart.find((item) => item.id === product.id);
  const cartQty = cartItem ? cartItem.quantity : 0;

  const currentPrice = parseFloat(product.offer_price || 0).toLocaleString('en-IN');
  const mrp = parseFloat(product.mrp || 0).toLocaleString('en-IN');
  const ratingNum = parseFloat(product.avg_rating || 0);
  const rating = ratingNum.toFixed(1);
  const reviewsCount = product.reviews?.length || 0;
  const isAvailable = parseInt(product.stock_available || 0) > 0;
  const discountNum = parseFloat(product.discount_percentage || 0);

  const ratingColor = ratingNum >= 4 ? 'var(--success)' : ratingNum >= 2.5 ? 'var(--warning)' : 'var(--danger)';

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (requireLogin()) {
      addToCart(product);
    }
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    removeFromCart(product.id);
  };

  const handleBuyNow = () => {
    if (!requireLogin()) return;
    if (cartQty === 0) {
      addToCart(product);
    }
    navigate("/cart");
  };

  return (
    <div className="flex flex-col w-full">
      <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2 flex-wrap">
        <span className="bg-[var(--primary)] text-[var(--secondary)] px-2 sm:px-2.5 py-1 rounded shadow-sm">
          {product.category_name}
        </span> 
        {product.subcategory_name && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]"></span>
            <span className="bg-[var(--bg-soft)] text-[var(--primary)] px-2 sm:px-2.5 py-1 rounded shadow-sm border border-[var(--border)]">
              {product.subcategory_name}
            </span>
          </>
        )}
      </div>
      
      <h1 className="text-[22px] sm:text-[26px] md:text-[30px] font-black text-[var(--text-main)] mb-1.5 sm:mb-2 leading-tight capitalize">
        {product.name}
      </h1>

      {product.company_name && (
        <p className="text-[12px] sm:text-[13px] font-medium text-[var(--text-muted)] mb-3 sm:mb-4">
          Sold by: <span className="text-[var(--text-main)] font-bold">{product.company_name}</span>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border bg-[var(--bg)] shadow-sm"
          style={{ borderColor: ratingColor, color: ratingColor }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
          </svg>
          <span className="font-black text-[13px] sm:text-[14px]">{rating}</span>
        </div>
        <span className="text-[12px] sm:text-[13px] font-bold text-[var(--text-light)]">
          ({reviewsCount} reviews)
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-2 sm:gap-3 mb-4">
        <span className="text-[28px] sm:text-[34px] font-black text-[var(--text-main)] leading-none">
          ₹{currentPrice}
        </span>
        {product.mrp && (
          <span className="text-[14px] sm:text-[16px] text-[var(--text-muted)] line-through font-semibold mb-0.5 sm:mb-1">
            ₹{mrp}
          </span>
        )}
        {discountNum > 0 && (
          <span className="bg-[var(--success)] text-[var(--secondary)] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-black mb-1 sm:mb-1.5 tracking-wide shadow-sm">
            {discountNum.toFixed(0)}% OFF
          </span>
        )}
      </div>

      <div className="mb-5 sm:mb-6">
        <div className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-[13px] font-black uppercase tracking-wider border w-fit ${isAvailable ? 'bg-emerald-50 text-[var(--success)] border-emerald-200' : 'bg-red-50 text-[var(--danger)] border-red-200'}`}>
          <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isAvailable ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`}></span>
          {isAvailable ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>

      <p className="text-[13px] sm:text-[14px] text-[var(--text-light)] leading-relaxed mb-5 sm:mb-6 font-medium">
        {product.description}
      </p>

      {product.variant_name && (
        <div className="mb-5 sm:mb-6">
          <p className="text-[11px] sm:text-[12px] font-bold mb-1.5 sm:mb-2 text-[var(--text-main)] uppercase tracking-wider">Variant</p>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[var(--primary)] text-[var(--secondary)] font-black text-[12px] sm:text-[14px] cursor-default shadow-[var(--shadow-sm)] border-none tracking-wide">
              {product.variant_name} {product.unit !== "piece" ? product.unit : ""}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-4 pt-5 sm:pt-6 border-t border-[var(--border)] w-full">
        
        {cartQty > 0 ? (
          <div className="w-full sm:flex-[0.8] flex items-center justify-between p-1 sm:p-1.5 rounded-xl border border-[var(--primary)] bg-[var(--bg)] shadow-sm">
            <button 
              onClick={handleDecrease}
              className="w-12 sm:w-10 h-12 sm:h-10 flex items-center justify-center text-[var(--primary)] font-black text-xl hover:bg-[var(--bg-soft)] rounded-lg transition-colors"
            >
              -
            </button>
            <span className="font-bold text-lg text-[var(--primary)] w-8 text-center">{cartQty}</span>
            <button 
              onClick={handleIncrease}
              className="w-12 sm:w-10 h-12 sm:h-10 flex items-center justify-center text-[var(--primary)] font-black text-xl hover:bg-[var(--bg-soft)] rounded-lg transition-colors"
            >
              +
            </button>
          </div>
        ) : (
          <button 
            className="w-full sm:flex-1 py-3.5 px-4 rounded-xl border-2 border-[var(--primary)] text-[var(--primary)] bg-[var(--secondary)] font-black text-[13px] sm:text-[14px] uppercase tracking-wider cursor-pointer transition-all duration-250 hover:bg-[var(--primary)] hover:text-[var(--secondary)] hover:shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={handleAddToCart}
            disabled={!isAvailable}
          >
            {isAvailable ? "Add to Cart" : "Out of Stock"}
          </button>
        )}

        <button 
          className="w-full sm:flex-1 py-3.5 px-4 rounded-xl border-none bg-[var(--primary)] text-[var(--secondary)] font-black text-[13px] sm:text-[14px] uppercase tracking-wider cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none" 
          onClick={handleBuyNow}
          disabled={!isAvailable}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}

export default ProductInfo;