import React from "react";
import { useNavigate } from "react-router-dom"; 

const CategoryRow = ({ categories, activeCategory, onSelectCategory }) => {
  const navigate = useNavigate(); 

  const filteredCategories = categories.filter(
    (cat) => cat.subcategories && cat.subcategories.length > 0
  );

  return (
    <div className="w-full mb-10 overflow-hidden px-4">
      
      {/*  Title & Back Button Section */}
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 sm:gap-0">
        
        {/* Left Side: Title */}
        <div className="text-center sm:text-left">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter italic uppercase">
            Shop by <span className="text-cyan-500">Category</span>
          </h2>
          <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
            <div className="h-[2px] w-12 bg-cyan-500 hidden lg:block"></div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-[5px]">
              Explore our curated collections
            </p>
          </div>
        </div>

        {/* Right Side: Back to Home Button */}
        <button 
          onClick={() => navigate("/")} 
          className="group flex items-center gap-2 bg-white hover:bg-cyan-500 border border-white/10 hover:border-cyan-500 text-black-400 hover:text-black px-6 py-3 rounded-full font-black uppercase tracking-widest text-[12px] sm:text-md transition-all duration-300 shadow-xl shrink-0"
        >
          <span className="text-lg leading-none mb-0.5 group-hover:-translate-x-1 transition-transform">←</span>
         Back To Home
        </button>
      </div>

      {/* Categories Scroll Row */}
      <div 
        className="flex gap-8 sm:gap-14 overflow-x-auto pb-8 snap-x scrollbar-hide"
        style={{ 
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
      >
        <style>
          {`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        {filteredCategories.map((cat) => {
          const isActive = activeCategory === cat.name;
          
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="flex flex-col items-center gap-5 cursor-pointer group min-w-[130px] sm:min-w-[180px] snap-start"
            >
              <div className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-[2px] transition-all duration-500 shadow-[0_10px_50px_rgba(0,0,0,0.6)] bg-slate-900 flex items-center justify-center
                ${isActive 
                  ? "border-cyan-500 shadow-cyan-500/30 scale-110" 
                  : "border-white/20 group-hover:border-white/60"}`}>
                
                <img
                  src={cat.icon || cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all duration-500"></div>
              </div>

              <span className={`text-[12px] sm:text-[14px] font-black uppercase tracking-[2px] text-center transition-all duration-300
                ${isActive ? "text-cyan-500" : "text-white/80 group-hover:text-white"}`}>
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryRow;