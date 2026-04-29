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
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [allFallbackProducts, setAllFallbackProducts] = useState([]); 

  const [activeCategory, setActiveCategory] = useState(urlCategory || "");
  const [activeSub, setActiveSub] = useState(urlSubcategory || "All");
  const [sortOrder, setSortOrder] = useState("featured");

  const subcategoryRef = useRef(null);
  const productGridRef = useRef(null);
  const observer = useRef();

  const normalizeProducts = (records) => {
    return records.map(p => ({
      ...p,
      image: p.primary_image || 
             (p.images && p.images[0]) || 
             (p.all_images && p.all_images[0]?.image_url) || 
             p.product_image || 
             p.image,
      category: p.category || p.category_name,
      subCategory: p.subCategory || p.subcategory_name
    }));
  };

  const lastProductElementRef = useCallback(node => {
    if (loading || fetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, fetchingMore, hasNextPage]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const homeResponse = await apiService.get("/customers/home");
        let allCats = homeResponse.data?.data?.categories || [];
        setCategories(allCats);
        
        const initialCat = urlCategory || (allCats.length > 0 ? allCats[0].name : "");
        setActiveCategory(initialCat);

        if (token) {
          const [subRes, prodRes] = await Promise.all([
            getSubcategories(),
            getProducts(1, 10, { category: initialCat })
          ]);
          if (subRes.success) setSubcategories(subRes.data.records.sort((a, b) => a.id - b.id));
          if (prodRes.success) {
            setProducts(normalizeProducts(prodRes.data.records));
            setHasNextPage(prodRes.data.pagination.hasNextPage);
            setPage(1);
          }
        } else {
          const fallbackSubs = allCats.flatMap(cat =>
            (cat.subcategories || []).map(sub => ({ ...sub, category: cat.name, icon: sub.image }))
          );
          setSubcategories(fallbackSubs.sort((a, b) => a.id - b.id));

          const totalProds = normalizeProducts(allCats.flatMap(cat =>
            (cat.subcategories || []).flatMap(sub => sub.products || [])
          ));

          setAllFallbackProducts(totalProds);
          setProducts(totalProds.slice(0, 10)); 
          setHasNextPage(totalProds.length > 10);
          setPage(1);
        }
      } catch (err) { console.error(err); } 
      finally { setTimeout(() => setLoading(false), 500); }
    };
    fetchAllData();
  }, [urlCategory]);

  useEffect(() => {
    if (page === 1 || fetchingMore) return;

    const fetchMore = async () => {
      setFetchingMore(true);
      const token = localStorage.getItem('accessToken');

      if (token) {
        const res = await getProducts(page, 10, { category: activeCategory, subcategory: activeSub !== "All" ? activeSub : undefined });
        if (res.success) {
          setProducts(prev => [...prev, ...normalizeProducts(res.data.records)]);
          setHasNextPage(res.data.pagination.hasNextPage);
        }
      } else {
        setTimeout(() => {
          const startIndex = (page - 1) * 10;
          const nextBatch = allFallbackProducts.slice(startIndex, startIndex + 10);
          setProducts(prev => [...prev, ...nextBatch]);
          setHasNextPage(allFallbackProducts.length > startIndex + 10);
          setFetchingMore(false);
        }, 500);
        return;
      }
      setFetchingMore(false);
    };
    fetchMore();
  }, [page]);

  useEffect(() => {
    if (!activeCategory || products.length === 0) {
      setFilteredProducts([]);
      return;
    }
    const categoryMatches = products.filter(p => p.category === activeCategory);
    if (activeSub === "All") {
      setFilteredProducts(categoryMatches);
    } else {
      setFilteredProducts(categoryMatches.filter(p => p.subCategory === activeSub));
    }
  }, [activeCategory, activeSub, products]);

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center p-10 w-full text-cyan-500">
      <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black mt-4 tracking-[0.2em] uppercase">Loading Items</p>
    </div>
  );

  return (
    <div className="min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto">
        <CategoryRow
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={(name) => {
            setActiveCategory(name);
            setActiveSub("All");
            setPage(1);
            setSearchParams({ category: name });
          }}
        />

        <div className="flex flex-col lg:flex-row gap-12 mt-12">
          <div className="lg:w-[250px] shrink-0 scroll-mt-32" ref={subcategoryRef}>
            <CategorySidebar
              subcategories={subcategories.filter(s => s.category === activeCategory)}
              activeCategory={activeCategory}
              activeSub={activeSub}
              setActiveSub={(name) => {
                setActiveSub(name);
                setPage(1);
                if (name === "All") setSearchParams({ category: activeCategory });
                else setSearchParams({ category: activeCategory, subcategory: name });
              }}
            />
          </div>

          <div className="flex-1" ref={productGridRef}>
            {loading ? <LoadingSpinner /> : (
              <>
             <ProductGrid
  products={filteredProducts}
  loading={loading}
  activeCategory={activeCategory}
  activeSub={activeSub}
  sortOrder={sortOrder} 
  setSortOrder={setSortOrder} 
  clearFilters={() => {
    setActiveSub("All");
    setPage(1);
    setSearchParams({ category: activeCategory });
  }}
/>
                <div ref={lastProductElementRef} className="h-20 w-full flex justify-center items-center mt-6">
                  {fetchingMore && <LoadingSpinner />}
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