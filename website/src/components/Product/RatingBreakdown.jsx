import React from "react";

function RatingBreakdown({ product }) {
  const rating = parseFloat(product.avg_rating || 0).toFixed(1);
  const reviews = product.reviews || [];
  const reviewsCount = reviews.length;

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  reviews.forEach(review => {
    if (review.rating && starCounts[review.rating] !== undefined) {
      starCounts[review.rating] += 1;
    }
  });

  const reviewCategories = [
    { label: "Excellent", stars: 5, color: "bg-emerald-500" },
    { label: "Very Good", stars: 4, color: "bg-emerald-400" },
    { label: "Good", stars: 3, color: "bg-amber-400" },
    { label: "Average", stars: 2, color: "bg-orange-400" },
    { label: "Poor", stars: 1, color: "bg-rose-500" }
  ].map(cat => {
    const count = starCounts[cat.stars];
    const fill = reviewsCount > 0 ? `${(count / reviewsCount) * 100}%` : "0%";
    return { ...cat, count, fill };
  });

  const starPercentage = (rating / 5) * 100;

  return (
    <div className="flex flex-col bg-slate-50 p-6 rounded-3xl border border-slate-100">
      <div className="mb-4 text-center">
        <h2 className="text-[54px] font-black text-slate-900 leading-none">
          {rating}
        </h2>
        
        <div className="relative inline-block text-[24px] tracking-widest my-2">
          <div className="text-slate-200">
            ★★★★★
          </div>
          
          <div 
            className="absolute top-0 left-0 overflow-hidden text-amber-400 whitespace-nowrap"
            style={{ width: `${starPercentage}%` }}
          >
            ★★★★★
          </div>
        </div>

        <p className="text-slate-500 text-[13px] font-black uppercase tracking-widest mt-1">
          Based on {reviewsCount} reviews
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        {reviewCategories.map((item) => (
          <div key={item.stars} className="flex items-center gap-3">
            
            <div className="w-[70px]">
              <span className="text-[12px] font-black text-slate-700 uppercase">
                {item.label}
              </span>
            </div>
            
            <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full transition-all duration-500`}
                style={{ width: item.fill }}
              />
            </div>

            <span className="w-8 text-right text-[12px] font-black text-slate-500">
              {item.count}
            </span>
            
          </div>
        ))}
      </div>
    </div>
  );
}

export default RatingBreakdown;