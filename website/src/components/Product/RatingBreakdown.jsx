function RatingBreakdown({ product }) {
  const rating = parseFloat(product.avg_rating || 0).toFixed(1);
  const reviewsCount = product.reviews?.length || 0;

  const bars = [
    { stars: 5, fill: "80%" },
    { stars: 4, fill: "15%" },
    { stars: 3, fill: "5%" },
    { stars: 2, fill: "0%" },
    { stars: 1, fill: "0%" }
  ];

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <h2 className="text-[42px] md:text-[64px] font-black text-slate-900 leading-none">
          {rating}
        </h2>
        <div className="text-amber-400 text-[18px] my-2 tracking-widest">
          ★★★★★
        </div>
        <p className="text-slate-500 text-[14px] mt-1">
          ({reviewsCount} verified reviews)
        </p>
      </div>

      <div className="flex flex-col gap-3.5 mt-2.5">
        {bars.map((item) => (
          <div key={item.stars} className="flex items-center gap-2.5 text-[14px] text-slate-500">
            <span className="w-10">{item.stars}★</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-[10px] overflow-hidden">
              <div
                className="h-full bg-cyan-500"
                style={{ width: item.fill }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RatingBreakdown;