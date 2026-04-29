import { useState } from "react";
import RatingBreakdown from "./RatingBreakdown";
import ReviewList from "./ReviewList";

function ProductTabs({ product }) {
  const [tab, setTab] = useState("desc");

  const reviewsCount = product.reviews?.length || 0;

  return (
    <div className="w-full max-w-[1400px] mx-auto my-10 px-5">
      <div className="w-full bg-white rounded-[14px] p-6 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        
        {/* TAB HEADER */}
        <div className="flex gap-5 md:gap-9 border-b border-slate-200 mb-8 flex-wrap">
         <button
            className={`bg-transparent border-none py-3.5 text-sm md:text-base font-bold cursor-pointer relative transition-colors duration-200 ${tab === "desc" ? "text-slate-900 after:content-[''] after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[3px] after:bg-cyan-500 after:rounded-[3px]" : "text-slate-500 hover:text-cyan-600"}`}
            onClick={() => setTab("desc")}
          >
            Product Description
          </button>
          <button
            className={`bg-transparent border-none py-3.5 text-sm md:text-base font-bold cursor-pointer relative transition-colors duration-200 ${tab === "reviews" ? "text-slate-900 after:content-[''] after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[3px] after:bg-cyan-500 after:rounded-[3px]" : "text-slate-500 hover:text-cyan-600"}`}
            onClick={() => setTab("reviews")}
          >
            Ratings & Reviews ({reviewsCount})
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="animate-[fadeTab_.25s_ease]">
          {tab === "reviews" && (
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-[50px]">
              {/* 🌟 Pass product data to child components */}
              <RatingBreakdown product={product} />
              <ReviewList product={product} />
            </div>
          )}

          {tab === "desc" && (
            <div className="text-[15px] text-slate-600 leading-[1.7]">
              <p>{product.description}</p>
              {product.specification && (
                <p className="mt-4"><strong>Specification:</strong> {product.specification}</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProductTabs;