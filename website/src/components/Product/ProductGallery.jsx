import { useState, useEffect } from "react";

function ProductGallery({ product }) {
  const imageList = product?.images?.length > 0 
    ? product.images.map((img) => img.image_url) 
    : ["https://via.placeholder.com/400?text=No+Image"];

  const [active, setActive] = useState(imageList[0]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (imageList.length > 0) setActive(imageList[0]);
  }, [product.id]);

  const handleThumbClick = (img) => {
    if (img === active) return;
    setAnimating(true);
    setTimeout(() => {
      setActive(img);
      setAnimating(false);
    }, 220);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="w-full h-[320px] md:h-[420px] rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200 group relative">
        <img
          src={active}
          alt={product.name}
          className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${animating ? "opacity-50 transition-opacity duration-200" : "opacity-100"}`}
        />
      </div>

      {/* Thumbnails */}
    {imageList.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2">
          {imageList.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => handleThumbClick(img)}
              alt={`thumbnail ${i + 1}`}
              className={`w-[70px] h-[70px] rounded-lg border-2 cursor-pointer p-1 bg-white transition-all duration-300 object-contain flex-shrink-0 
                ${active === img ? "border-cyan-500" : "border-slate-200 hover:border-cyan-400"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;