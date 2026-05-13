import Card from "../Product/Productcard/Productcard";

function SimilarProducts({ similarProducts, pagination, onLoadMore, isLoadingMore }) {
  
  if (!similarProducts || similarProducts.length === 0) {
    return (
      <section className="w-full mt-10 p-5 md:p-[30px] bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
        <div className="mb-5">
          <h2 className="text-[18px] md:text-[22px] font-extrabold text-[var(--text-main)]">Similar Products</h2>
        </div>
        <div className="text-center py-12 bg-[var(--bg-soft)] rounded-lg border border-dashed border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text-main)]">No product found.</h3>
          <p className="text-[var(--text-muted)] mt-2">We couldn't find any similar items right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full mt-10 p-5 md:p-[30px] bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
      
      <div className="mb-5 flex flex-col md:flex-row md:items-baseline md:justify-between">
        <h2 className="text-[18px] md:text-[22px] font-extrabold text-[var(--text-main)]">Similar Products</h2>
        
        {pagination && (
           <p className="text-[13px] text-[var(--text-muted)] mt-1 md:mt-0 font-semibold uppercase tracking-wider">
             Showing {similarProducts.length} of {pagination.totalRecords}
           </p>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[15px] md:gap-5">
        {similarProducts.map((item, index) => (
          <Card key={`${item.id}-${index}`} product={item} />
        ))}
      </div>

      <div className="mt-10 flex justify-center items-center h-[50px]">
        {pagination?.hasNextPage ? (
          <button 
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className={`px-8 py-3 font-black uppercase tracking-widest text-[13px] border-2 rounded-xl transition-all duration-300 
              ${isLoadingMore 
                ? "bg-[var(--bg-soft)] border-[var(--border)] text-[var(--text-muted)] cursor-wait" 
                : "text-[var(--primary)] border-[var(--primary)] bg-transparent hover:bg-[var(--primary)] hover:text-[var(--secondary)] cursor-pointer hover:-translate-y-1 hover:shadow-lg"
              }`}
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </button>
        ) : (
          <div className="flex items-center gap-3 opacity-60">
            <span className="w-12 h-[1px] bg-[var(--text-muted)]"></span>
            <p className="text-[var(--text-muted)] font-black uppercase tracking-[3px] text-[12px] m-0">
              You've Reached The End
            </p>
            <span className="w-12 h-[1px] bg-[var(--text-muted)]"></span>
          </div>
        )}
      </div>
    </section>
  );
}

export default SimilarProducts;