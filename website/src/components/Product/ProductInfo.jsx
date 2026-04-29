import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
// import { useCart } from "../../pages/cart/CartContext"; 
// import { useAuth } from "../../context/AuthContext"; 
import { toast } from "react-toastify";

function ProductInfo({ product }) {
  const navigate = useNavigate();
  // const { user } = useAuth(); 
  // const { addToCart } = useCart();
  
  const [qty, setQty] = useState(1);

  const currentPrice = parseFloat(product.offer_price || 0).toLocaleString('en-IN');
  const mrp = parseFloat(product.mrp || 0).toLocaleString('en-IN');
  const rating = parseFloat(product.avg_rating || 0).toFixed(1);
  const reviewsCount = product.reviews?.length || 0;

  const requireLogin = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.warn("Please login to add items to cart!"); 
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!requireLogin()) return; 

    // addToCart({ ...product, quantity: qty }); // add to cart
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!requireLogin()) return;
    console.log("Proceed to Buy");
  };

  return (
    <div className="flex flex-col">
      <p className="text-[12px] font-extrabold text-cyan-500 uppercase tracking-[1px] mb-1.5">
        {product.subcategory_name || product.category_name}
      </p>
      <h1 className="text-[30px] font-black text-slate-900 mb-3 leading-[1.3] capitalize">
        {product.name}
      </h1>

      <div className="flex gap-2 items-center text-amber-500 font-semibold mb-2">
        <span>⭐ {rating}</span> 
        <span className="text-slate-500 text-sm font-normal">({reviewsCount} reviews)</span>
      </div>

      <div className="flex items-center gap-3.5 my-[22px]">
        {/* 🌟 Cyan Gradient Price */}
        <span className="text-[34px] font-black bg-gradient-to-br from-cyan-500 to-cyan-900 bg-clip-text text-transparent">
          ₹{currentPrice}
        </span>
        {product.mrp && (
          <span className="text-[18px] text-slate-400 line-through">
            ₹{mrp}
          </span>
        )}
        {product.discount_percentage > 0 && (
          <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">
            {parseFloat(product.discount_percentage).toFixed(0)}% OFF
          </span>
        )}
      </div>

      <p className="text-[15px] text-slate-600 leading-relaxed mt-1.5">
        {product.description}
      </p>

      {/* VARIANT SECTION */}
      {product.variant_name && (
        <div className="mt-5">
          <p className="text-sm font-bold mb-2.5">Variant</p>
          <div className="flex gap-2.5 flex-wrap">
            <button className="px-[18px] py-2 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-900 text-white font-semibold cursor-default border-none">
              {product.variant_name} {product.unit !== "piece" ? product.unit : ""}
            </button>
          </div>
        </div>
      )}

      {/* QUANTITY CONTROLS */}
      <div className="flex items-center gap-3.5 my-[22px]">
        <button className="w-10 h-10 border-none bg-slate-100 rounded-lg text-lg cursor-pointer transition-all duration-200 hover:bg-slate-200 hover:text-cyan-600" onClick={() => setQty(qty > 1 ? qty - 1 : 1)}>−</button>
        <span className="text-lg font-bold w-4 text-center">{qty}</span>
        <button className="w-10 h-10 border-none bg-slate-100 rounded-lg text-lg cursor-pointer transition-all duration-200 hover:bg-slate-200 hover:text-cyan-600" onClick={() => setQty(qty + 1)}>+</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3.5 mt-3.5">
        {/* 🌟 Cyan Buttons */}
        <button className="flex-1 p-3.5 rounded-lg border-2 border-cyan-500 bg-white text-cyan-600 font-bold cursor-pointer transition-all duration-250 hover:bg-cyan-500 hover:text-white" onClick={handleAddToCart}>
          Add to Cart
        </button>
        <button className="flex-1 p-3.5 rounded-lg border-none bg-gradient-to-br from-cyan-500 to-cyan-900 text-white font-bold cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)]" onClick={handleBuyNow}>
          Buy Now
        </button>
      </div>

      <div className="mt-3.5 text-sm text-cyan-700 font-semibold flex items-center gap-2">
        🚚 Dispatch in {product.return_days || 1-2} days
        {product.return_allowed === 1 && " • Easy Returns"}
      </div>
    </div>
  );
}

export default ProductInfo;