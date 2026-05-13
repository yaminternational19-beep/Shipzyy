import { useRef } from "react";

function Category({ data = [], onSelect, activeCategoryId }) {
  const scrollRef = useRef(null);

  const validCategories = data.filter(
    (item) => item.subcategories && item.subcategories.length > 0
  );

  if (validCategories.length === 0) return null;

  return (
    <section className="w-full py-8 lg:py-12">
      <div className="flex justify-between items-end mb-8 px-4 sm:px-6">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--secondary)] tracking-tight underline decoration-[var(--success)] decoration-4 underline-offset-8">
            Categories
          </h2>
          <p className="text-[12px] sm:text-[13px] text-[var(--success)] font-bold uppercase tracking-widest mt-3">
            Premium Selection
          </p>
        </div>
      </div>

      <div
        className="flex gap-6 sm:gap-8 lg:gap-10 overflow-x-auto pb-8 scrollbar-hide snap-x px-4 sm:px-6"
        ref={scrollRef}
      >
        {validCategories.map((item) => {
          const isActive = activeCategoryId === item.id;

          return (
            <div
              key={item.id}
              className="flex flex-col items-center gap-4 cursor-pointer group min-w-[100px] sm:min-w-[130px] lg:min-w-[160px] snap-center"
              onClick={() => onSelect && onSelect(item)}
            >
              <div 
                className={`relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-[4px] transition-all duration-500 shadow-[var(--shadow-md)] bg-[var(--card-bg)] ${
                  isActive 
                    ? "border-[var(--success)] scale-105" 
                    : "border-[var(--glass-border)] group-hover:border-[var(--success)]" 
                }`}
              >
                <img
                  src={item.icon || item.image}
                  alt={item.name}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                />
                <div className={`absolute inset-0 transition-all duration-500 ${
                  isActive 
                    ? "bg-black/10" 
                    : "bg-gradient-to-b from-transparent via-transparent to-black/60 group-hover:to-black/20"
                }`}></div>
              </div>

              <span 
                className={`text-[11px] sm:text-[12px] lg:text-[13px] font-black uppercase tracking-widest text-center transition-all duration-300 ${
                  isActive 
                    ? "text-[var(--success)] scale-105" 
                    : "text-[var(--secondary)] group-hover:text-[var(--success)]" 
                }`}
              >
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Category;