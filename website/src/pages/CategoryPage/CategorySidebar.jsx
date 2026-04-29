import React from "react";

const CategorySidebar = ({ subcategories = [], activeSub, setActiveSub }) => {
  
  const subData = [
    { name: "All", icon: "" }, 
    ...subcategories
  ];

  return (
    <aside className="lg:sticky lg:top-32 flex lg:flex-col gap-10 overflow-x-auto lg:overflow-visible pb-8 scrollbar-hide snap-x">
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      {subData.map((sub, idx) => {
        const isActive = activeSub === sub.name;
        const imageSrc = sub.icon || sub.image;
        
        return (
          <button
            key={idx}
            onClick={() => setActiveSub(sub.name)}
            className="flex flex-col items-center gap-4 group outline-none shrink-0 snap-center transition-all"
          >
            <div className={`relative w-24 h-24 lg:w-25 lg:h-25 rounded-full overflow-hidden border-[2px] transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-slate-900 flex items-center justify-center
              ${isActive 
                ? "border-cyan-500 shadow-cyan-500/30 scale-110" 
                : "border-white/20 group-hover:border-white/60"}`}>
              
              {imageSrc ? (
                <img 
                  src={imageSrc} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={sub.name} 
                />
              ) : (
                <div className="text-white text-xs">All</div>
              )}
              
              <div className={`absolute inset-0 transition-all duration-500 ${isActive ? 'bg-transparent' : 'bg-black/10 group-hover:bg-transparent'}`}></div>
            </div>
            
            <span className={`text-[11px] lg:text-[13px] font-black uppercase tracking-[2px] text-center max-w-[100px] leading-tight transition-all
              ${isActive ? "text-cyan-500" : "text-slate-500 group-hover:text-white"}`}>
              {sub.name}
            </span>

            {isActive && (
              <div className="hidden lg:block absolute -right-2 top-1/3 w-1 h-12 bg-cyan-500 rounded-full shadow-[0_0_15px_#06b6d4]" />
            )}
          </button>
        );
      })}
    </aside>
  );
};

export default CategorySidebar;