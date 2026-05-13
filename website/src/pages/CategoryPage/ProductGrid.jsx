import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../components/Product/Productcard/Productcard";

const ProductGrid = ({ products, activeCategory, activeSub, clearFilters, sortOrder, setSortOrder }) => {

  const processedItems = useMemo(() => {
    const uniqueMap = new Map();
    
    products.forEach(item => {
      const activeCatClean = activeCategory ? activeCategory.trim().toLowerCase() : "";
      const itemCatClean = item.category ? item.category.trim().toLowerCase() : "";
      const isCategoryMatch = !activeCategory || itemCatClean === activeCatClean;

      const activeSubClean = activeSub ? activeSub.trim().toLowerCase() : "";
      const itemSubClean = item.subCategory ? item.subCategory.trim().toLowerCase() : "";
      const isSubMatch = !activeSub || activeSub === "All" || itemSubClean === activeSubClean;

      if (item.id && isCategoryMatch && isSubMatch) {
        uniqueMap.set(item.id, item);
      }
    });

    let uniqueList = Array.from(uniqueMap.values());

    if (sortOrder === "price-low") {
      return uniqueList.sort((a, b) => 
        parseFloat(a.offer_price || a.sale_price || 0) - parseFloat(b.offer_price || b.sale_price || 0)
      );
    } else if (sortOrder === "price-high") {
      return uniqueList.sort((a, b) => 
        parseFloat(b.offer_price || b.sale_price || 0) - parseFloat(a.offer_price || a.sale_price || 0)
      );
    }
    return uniqueList;
  }, [products, sortOrder, activeCategory, activeSub]); 

  return (
    <main className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-white/10">
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter italic uppercase">
          {activeSub === "All" ? "All Products" : activeSub}
        </h2>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black text-white/70 border border-white/10">
            {processedItems.length} ITEMS
          </span>
          <select 
            className="flex-1 sm:flex-none bg-slate-900 text-white text-xs font-black p-3 rounded-xl border border-white/10 outline-none cursor-pointer hover:border-cyan-500 transition-all"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {processedItems.length > 0 ? (
        <motion.div 
          layout 
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {processedItems.map((product) => (
              <motion.div
                key={product.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  opacity: { duration: 0.2 } 
                }}
              >
                <Card product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/10 rounded-[40px] text-center">
          <div className="w-20 h-20 mb-6 flex items-center justify-center bg-white/5 rounded-full text-4xl shadow-inner">🛒</div>
          <h3 className="text-2xl font-black text-white mb-2">No products found!</h3>
          <button 
            className="bg-cyan-500 text-black px-10 py-4 rounded-full font-black uppercase tracking-widest hover:bg-cyan-400 transition-all" 
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      )}
    </main>
  );
};

export default ProductGrid;