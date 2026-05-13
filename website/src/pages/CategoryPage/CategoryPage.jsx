import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import apiService from "../../utils/api";
import { getSubcategories } from "../../utils/categoryApi";
import { getProducts } from "../../utils/productApi";
import CategoryRow from "./CategoryRow";
import CategorySidebar from "./CategorySidebar";
import ProductGrid from "./ProductGrid";

const CategoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlSubcategory = searchParams.get("subcategory");

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [allFallbackProducts, setAllFallbackProducts] = useState([]); 

  const isFetchingRef = useRef(false);
  const observer = useRef();

  const [activeCategory, setActiveCategory] = useState(urlCategory || "");
  const [activeSub, setActiveSub] = useState(urlSubcategory || "All");
  const [sortOrder, setSortOrder] = useState("featured");

  const normalizeProducts = (records) => {
    return records.map(p => ({
      ...p,
      image: p.primary_image || (p.images && p.images[0]) || (p.all_images && p.all_images[0]?.image_url) || p.product_image || p.image,
      category: p.category || p.category_name,
      subCategory: p.subCategory || p.subcategory || p.subcategory_name
    }));
  };

  const lastProductElementRef = useCallback(node => {
    if (loading || fetchingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingRef.current) {
        setPage(prev => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, fetchingMore, hasNextPage]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setPage(1); 
        const token = localStorage.getItem('refreshToken'); 
        
        const homeResponse = await apiService.get("/customers/home");
        let allCats = homeResponse.data?.data?.categories || [];
        setCategories(allCats);
        
        const initialCat = urlCategory || (allCats.length > 0 ? allCats[0].name : "");
        const initialSub = urlSubcategory || "All";

        setActiveCategory(initialCat);
        setActiveSub(initialSub);

        if (token) {
          const [subRes, prodRes] = await Promise.all([
            getSubcategories(),
            getProducts(1, 10, { category: initialCat, subcategory: initialSub !== "All" ? initialSub : undefined })
          ]);
          if (subRes.success) setSubcategories(subRes.data.records.sort((a, b) => a.id - b.id));
          if (prodRes.success) {
            setProducts(normalizeProducts(prodRes.data.records));
            setHasNextPage(prodRes.data.pagination.hasNextPage);
          }
        } else {
          const fallbackSubs = allCats.flatMap(cat => (cat.subcategories || []).map(sub => ({ ...sub, category: cat.name, icon: sub.image })));
          setSubcategories(fallbackSubs.sort((a, b) => a.id - b.id));
          
          let filteredProds = [];
          allCats.forEach(cat => {
            const catMatch = !initialCat || cat.name.toLowerCase() === initialCat.toLowerCase();
            if (catMatch) {
              (cat.subcategories || []).forEach(sub => {
                const subMatch = !initialSub || initialSub === "All" || sub.name.toLowerCase() === initialSub.toLowerCase();
                if (subMatch) {
                  filteredProds.push(...(sub.products || []));
                }
              });
            }
          });

          const totalProds = normalizeProducts(filteredProds);
          setAllFallbackProducts(totalProds);
          setProducts(totalProds.slice(0, 10)); 
          setHasNextPage(totalProds.length > 10);
        }
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchAllData();
  }, [urlCategory, urlSubcategory]);

  useEffect(() => {
    if (page === 1) return;

    const fetchMore = async () => {
      isFetchingRef.current = true;
      setFetchingMore(true); 
      const token = localStorage.getItem('refreshToken');

      try {
        if (token) {
          const res = await getProducts(page, 10, { 
            category: activeCategory, 
            subcategory: activeSub !== "All" ? activeSub : undefined 
          });
          if (res.success) {
            const newBatch = normalizeProducts(res.data.records);
            setProducts(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const uniqueNew = newBatch.filter(p => !existingIds.has(p.id));
              return [...prev, ...uniqueNew];
            });
            setHasNextPage(res.data.pagination.hasNextPage);
          }
        } else {
          const startIndex = (page - 1) * 10;
          const nextBatch = allFallbackProducts.slice(startIndex, startIndex + 10);
          setProducts(prev => [...prev, ...nextBatch]);
          setHasNextPage(allFallbackProducts.length > startIndex + 10);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => {
          isFetchingRef.current = false;
          setFetchingMore(false);
        }, 500);
      }
    };
    fetchMore();
  }, [page]);

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center p-10 w-full text-cyan-500">
      <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black mt-4 tracking-[0.2em] uppercase">Loading Products...</p>
    </div>
  );

  const handleCategoryClick = (name) => {
    setActiveCategory(name);
    setActiveSub("All"); 
    setSearchParams({ category: name, subcategory: "All" });
    setProducts([]);
  };

  const handleSubcategoryClick = (name) => {
    setActiveSub(name);
    setSearchParams({ category: activeCategory, subcategory: name });
    setProducts([]);
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto">
        <CategoryRow
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={handleCategoryClick}
        />

        <div className="flex flex-col lg:flex-row gap-12 mt-12">
          <div className="lg:w-[250px] shrink-0">
            <CategorySidebar
              subcategories={subcategories.filter(s => {
                return s.category && activeCategory && s.category.toLowerCase() === activeCategory.toLowerCase();
              })}
              activeCategory={activeCategory}
              activeSub={activeSub}
              setActiveSub={handleSubcategoryClick}
            />
          </div>

          <div className="flex-1 min-h-[60vh]">
            {loading && page === 1 ? <LoadingSpinner /> : (
              <>
                <ProductGrid
                  products={products}
                  activeCategory={activeCategory}
                  activeSub={activeSub}
                  sortOrder={sortOrder} 
                  setSortOrder={setSortOrder} 
                  clearFilters={() => {
                    setSearchParams({});
                    setProducts([]);
                    setActiveCategory("");
                    setActiveSub("All");
                  }}
                />
                
                <div ref={lastProductElementRef} className="h-20 w-full flex justify-center items-center mt-6">
                  {fetchingMore && <LoadingSpinner />}
                  {!hasNextPage && products.length > 0 && (
                    <div className="flex items-center gap-4 opacity-50 w-full justify-center">
                      <span className="w-16 h-[1px] bg-white/30"></span>
                      <p className="text-white/70 text-[12px] font-black uppercase tracking-[0.2em] m-0">
                        You've reached the end
                      </p>
                      <span className="w-16 h-[1px] bg-white/30"></span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;