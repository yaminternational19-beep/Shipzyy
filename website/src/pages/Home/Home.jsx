import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api.js";  
import { useAuth } from "../../context/AuthContext"; 

import app from "../../assets/screen/WhatsApp Image 2026-02-20 at 12.54.29 AM.jpeg";
import Category from "../../components/Category/Category.jsx";
import Recommended from "../../components/Recommendation/Recommended.jsx";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [apiData, setApiData] = useState({
    banners: [],
    categories: [],
    bestSellers: []
  });
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, hasNextPage: false });
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchHomeData = async (pageNo = 1) => {
    try {
      if (pageNo === 1) setLoading(true);
      else setLoadMoreLoading(true);

      const response = await api.get(`/customers/home?page=${pageNo}&limit=10`);
      
      if (response.data.success) {
        const data = response.data.data;
        const categories = data.categories || [];
        const newBestSellers = data.best_sellers?.records || [];
        const pagin = data.best_sellers?.pagination;

        setApiData((prev) => ({
          banners: pageNo === 1 ? (data.banners || []) : prev.banners,
          categories: pageNo === 1 ? categories : prev.categories,
          bestSellers: pageNo === 1 ? newBestSellers : [...prev.bestSellers, ...newBestSellers]
        }));

        setPagination({
          page: pagin?.page || 1,
          hasNextPage: pagin?.hasNextPage || false
        });

        if (pageNo === 1 && categories.length > 0) setSelectedCategory(categories[0]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
      setLoadMoreLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData(1);
  }, [user]);

  useEffect(() => {
    if (apiData.banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % apiData.banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [apiData.banners.length]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setTimeout(() => {
      const subSection = document.getElementById("subcategory-section");
      if (subSection) {
        const yOffset = -170;
        const y = subSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 150);
  };

  const handleSubSelect = (subName) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const safeCategory = encodeURIComponent(selectedCategory?.name);
    const safeSubcategory = encodeURIComponent(subName);
    const query = subName === "All" 
      ? `category=${safeCategory}` 
      : `category=${safeCategory}&subcategory=${safeSubcategory}`;
    navigate(`/shop?${query}`);
  };

  const handleLoadMore = () => {
    if (pagination.hasNextPage) {
      fetchHomeData(pagination.page + 1);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--success)] bg-[var(--bg)] font-bold animate-pulse tracking-widest text-xl">LOADING SHIPZZY...</div>;

  return (
    <div className="w-full min-h-screen pb-16 bg-transparent overflow-x-hidden">
      
      <section className="w-full px-4 sm:px-6 mt-14">
        <div className="relative w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-[450px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-[var(--shadow-md)]">
          {apiData.banners.map((item, index) => (
            <div key={item.id || index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
              <img src={item.banner_image} alt={item.banner_name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto px-5">
        
        <Category 
          data={apiData.categories} 
          activeCategoryId={selectedCategory?.id} 
          onSelect={handleCategorySelect} 
        />

        {selectedCategory && (
          <div id="subcategory-section" className="animate-fade-in py-10">
            <div className="flex justify-between items-end mb-8 px-2">
              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-[var(--secondary)] tracking-tight underline decoration-[var(--success)] underline-offset-8">
                  {selectedCategory.name}
                </h2>
                <p className="text-[13px] sm:text-md text-[var(--success)] font-bold uppercase tracking-[4px] mt-2">
                  Discover
                </p>
              </div>
              <div 
                onClick={() => handleSubSelect("All")}
                className="group flex items-center gap-2 sm:gap-3 cursor-pointer mb-1 pr-2"
              >
                <span className="text-[11px] sm:text-[13px] font-black text-[var(--secondary)] uppercase tracking-[2px] group-hover:text-[var(--success)] transition-colors duration-300 mt-0.5">
                  View All
                </span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-[var(--success)] flex items-center justify-center text-[var(--success)] group-hover:bg-[var(--success)] group-hover:text-[var(--bg)] transition-all duration-300 shadow-[var(--shadow-sm)] group-hover:shadow-[0_0_15px_var(--success)] group-hover:scale-105">
                  <span className="text-sm sm:text-base transform group-hover:translate-x-0.5 transition-transform duration-300 font-bold leading-none">
                    →
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
              {selectedCategory.subcategories?.map((sub) => (
                <div 
                  key={sub.id} 
                  onClick={() => handleSubSelect(sub.name)} 
                  className="group min-w-[180px] sm:min-w-[220px] aspect-[3/4] relative rounded-[32px] overflow-hidden cursor-pointer snap-start border border-[var(--border)] hover:border-[var(--success)] transition-all duration-500 shadow-[var(--shadow-md)] bg-[var(--card-bg)]"
                >
                  <img src={sub.image} alt={sub.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
                  <div className="absolute top-4 left-4">
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                      <span className="text-[11px] sm:text-xs font-black text-[var(--secondary)] uppercase">{sub.name}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-5 right-5 w-10 h-10 bg-[var(--success)] rounded-full flex items-center justify-center translate-y-12 group-hover:translate-y-0 transition-transform duration-500 shadow-[var(--shadow-sm)]">
                    <span className="text-[var(--secondary)] font-bold">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <section className="my-20">
          <div className="flex justify-between items-end mb-10 px-2">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-[var(--secondary)] tracking-tight underline decoration-[var(--success)] underline-offset-8">
                Best Sellers
              </h2>
              <p className="text-[13px] sm:text-md text-[var(--success)] font-bold uppercase tracking-[4px] mt-2">
                Top Picks
              </p>
            </div>
          </div>
          <Recommended products={apiData.bestSellers} />
          {pagination.hasNextPage && (
            <div className="mt-12 flex justify-center">
              <button 
                onClick={handleLoadMore}
                disabled={loadMoreLoading}
                className="px-10 py-4 bg-[var(--bg-soft)] border border-[var(--success)] text-[var(--success)] font-black rounded-full hover:bg-[var(--success)] hover:text-[var(--secondary)] transition-all duration-300 disabled:opacity-50 flex items-center gap-3 shadow-[var(--shadow-sm)]"
              >
                {loadMoreLoading ? "LOADING..." : "VIEW MORE PRODUCTS"}
                {!loadMoreLoading && <span className="text-xl">↓</span>}
              </button>
            </div>
          )}
        </section>

        <div className="w-full my-24 flex justify-center px-2">
          <a href="https://play.google.com/store/apps" target="_blank" rel="noreferrer" className="w-full max-w-[1200px]">
            <img src={app} alt="Download App" className="w-full rounded-[40px] shadow-[var(--shadow-float)] object-cover" />
          </a>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default Home;