import { useState, useEffect } from "react";
import { useWishlist } from "../../pages/wishlist/WishlistContext";  
import { useAuth } from "../../context/AuthContext";

function ProductGallery({ product }) {
  const { user } = useAuth();
  const { toggleWishlist, isProductLiked } = useWishlist();

  const imageList = product?.images?.length > 0 
    ? product.images.map((img) => img.image_url) 
    : ["https://via.placeholder.com/400?text=No+Image"];

  const [active, setActive] = useState(imageList[0]);
  const [animating, setAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (imageList.length > 0) setActive(imageList[0]);
  }, [product.id]);

  useEffect(() => {
    if (imageList.length <= 1 || isPaused) return;

    const intervalId = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setActive((prev) => {
          const currentIndex = imageList.indexOf(prev);
          const nextIndex = (currentIndex + 1) % imageList.length;
          return imageList[nextIndex];
        });
        setAnimating(false);
      }, 200);
    }, 1500); 

    return () => clearInterval(intervalId);
  }, [imageList, isPaused]);

  const handleThumbHover = (img) => {
    if (img === active) return;
    setActive(img); 
  };

  const liked = isProductLiked(product.id);

  return (
    <div 
      className="flex flex-col gap-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="w-full h-[320px] md:h-[420px] rounded-xl bg-white flex items-center justify-center overflow-hidden border border-[var(--border)] group relative">
        
        <button 
          onClick={() => toggleWishlist(product)}
          className="absolute top-4 right-4 z-10 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform border border-slate-100"
        >
          {liked ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" className="w-6 h-6">
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          )}
        </button>

        <img
          src={active}
          alt={product.name || "Product"}
          className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${animating ? "opacity-40" : "opacity-100"}`}
        />
      </div>

      {imageList.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
          {imageList.map((img, i) => (
            <img
              key={i}
              src={img}
              onMouseEnter={() => handleThumbHover(img)}
              alt={`thumbnail ${i + 1}`}
              className={`w-[70px] h-[70px] rounded-lg border-2 cursor-pointer p-1 bg-white transition-all duration-300 object-contain flex-shrink-0 
                ${active === img ? "border-[var(--primary)]" : "border-[var(--border)]"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;