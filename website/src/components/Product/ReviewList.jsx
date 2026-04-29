function ReviewList({ product }) {
  const reviews = product.reviews || [];

  const renderStars = (rating) => {
    const filled = "★".repeat(rating);
    const empty = "☆".repeat(5 - rating);
    return filled + empty;
  };

  return (
    <div className="flex flex-col">
      <h3 className="text-[20px] font-bold text-slate-900 mb-2.5">
        Review this product
      </h3>

      <button 
 className="self-start mt-4 py-3 px-6 bg-cyan-600 text-white border-none rounded-md font-bold cursor-pointer transition-opacity duration-200 hover:opacity-90 mb-6">        Write a customer review
      </button>

      <div className="mt-5 flex flex-col">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div className="py-[22px] border-b border-slate-200 last:border-none" key={index}>
              <strong className="text-[16px] text-slate-900">
                {review.user_name || "Anonymous User"}
              </strong>
              
              <p className="text-amber-400 my-1 tracking-[2px] text-[15px]">
                {renderStars(review.rating || 5)}
              </p>
              
              <p className="text-[15px] text-slate-600 leading-[1.7] mt-2">
                {review.comment}
              </p>
            </div>
          ))
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-slate-400 font-medium">No reviews yet for this product.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewList;