import { useState } from "react";

function ReviewList({ product, isDelivered }) {
  const reviews = product.reviews || [];
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);

  const renderStars = (rating) => {
    const filled = "★".repeat(rating);
    const empty = "☆".repeat(5 - rating);
    return filled + empty;
  };

  const getReviewerName = (name) => {
    if (!name || name.trim() === "" || name.toLowerCase() === "anonymous") {
      return "Shipzy User";
    }
    return name;
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const visibleReviews = reviews.slice(0, visibleCount);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <h3 className="text-xl font-black text-slate-900">
          Customer Reviews
        </h3>
      </div>

      <div className="flex flex-col">
        {reviews.length > 0 ? (
          <>
            {visibleReviews.map((review, index) => (
              <div className="py-6 border-b border-slate-100 last:border-none flex flex-col" key={review.id || index}>
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-[15px] font-black text-slate-900 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm uppercase border border-blue-100">
                      {getReviewerName(review.review_given_by).charAt(0)}
                    </div>
                    {getReviewerName(review.review_given_by)}
                  </strong>
                  {review.created_at && (
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      {review.created_at}
                    </span>
                  )}
                </div>
                
                <p className="text-amber-400 my-2 tracking-widest text-[16px]">
                  {renderStars(review.rating || 5)}
                </p>
                
                <p className="text-[14px] font-bold text-slate-700 leading-relaxed mt-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {review.review}
                </p>

                {review.images && review.images.length > 0 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                    {review.images.map((img, i) => (
                      <img 
                        key={i} 
                        src={img} 
                        alt="review" 
                        onClick={() => setSelectedImage(img)}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-sm hover:scale-105 transition-transform cursor-pointer" 
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {visibleCount < reviews.length && (
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={handleLoadMore}
                  className="px-8 py-3 font-black text-[12px] uppercase tracking-widest text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  Load More Reviews
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 border border-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <p className="text-slate-900 font-black text-lg">No reviews yet</p>
            <p className="text-slate-500 font-bold text-[13px] mt-1">Be the first to review this product.</p>
          </div>
        )}
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-slate-800 hover:bg-slate-200 transition-colors w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md"
            onClick={() => setSelectedImage(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <img 
            src={selectedImage} 
            alt="Review enlarged" 
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default ReviewList;