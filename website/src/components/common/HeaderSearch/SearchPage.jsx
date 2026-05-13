import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { searchProducts } from "../../../utils/searchApi";
import { getHomeData } from "../../../utils/homeApi";
import Card from "../../../components/Product/Productcard/Productcard";

function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentSearches, setRecentSearches] = useState(JSON.parse(localStorage.getItem("recentSearches") || "[]"));
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      const res = await getHomeData(1, 20); 
      if (res?.success) {
        const filtered = (res.data.categories || []).filter(
          (cat) => cat.subcategories && cat.subcategories.length > 0
        );
        setCategories(filtered);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setIsSearching(true);
        try {
          const res = await searchProducts(query.trim());
          if (res?.success) setSearchResults(res.data.products || []);
        } catch (err) { setSearchResults([]); }
        finally { setIsSearching(false); }
      } else { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      addToRecent(query.trim());
    }
  };

  const addToRecent = (term) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* --- Header --- */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-100 p-4 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 flex items-center justify-center bg-slate-900 text-white rounded-2xl shrink-0"
          >
            <ArrowBackIcon />
          </button>
          
          <div className="flex-1 flex items-center gap-3 px-5 h-14 rounded-2xl bg-slate-100 border-2 border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
            <SearchIcon className="text-slate-400" />
            <input 
              autoFocus
              type="text"
              placeholder="Search groceries..."
              className="flex-1 bg-transparent outline-none font-black text-lg text-slate-800"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {query && <CloseIcon className="cursor-pointer text-slate-400" onClick={() => setQuery("")} />}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-4 md:p-8">
        {!query ? (
          <div className="space-y-10">
            
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                    <HistoryIcon fontSize="small" /> Recent
                  </h3>
                  <button onClick={clearRecent} className="text-rose-500 font-black text-[10px] uppercase">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s, i) => (
                    <button key={i} onClick={() => setQuery(s)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- Categories Grid --- */}
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-6 px-1">Shop by Category</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-8">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setQuery(cat.name); addToRecent(cat.name); }}
                    className="flex flex-col items-center group"
                  >
                    {/* Image Container*/}
                    <div className="w-full aspect-square rounded-[24px] overflow-hidden bg-slate-100 border border-slate-100 group-hover:scale-105 group-hover:shadow-xl transition-all duration-300">
                      <img 
                        src={cat.icon} 
                        alt={cat.name} 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                      />
                    </div>
                    {/* Name below box */}
                    <span className="mt-3 text-[11px] md:text-xs font-black text-slate-800 uppercase tracking-tighter text-center leading-tight">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Search Results */
          <div className="space-y-6">
             <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-black text-slate-800">"{query}"</h2>
                {isSearching && <div className="w-5 h-5 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
               {searchResults.map((product) => (
                 <div key={product.id} onClick={() => addToRecent(product.name)}>
                   <Card product={product} />
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;