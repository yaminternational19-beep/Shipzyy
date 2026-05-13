import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductGallery from "../ProductGallery";
import ProductInfo from "../ProductInfo";
import ProductTabs from "../ProductTabs";
import SimilarProducts from "../../SimilarProduct/SimilarProducts";
import { getProductByCode } from "../../../utils/productApi";

function ProductDetails() {
  const { id: code } = useParams();
  const navigate = useNavigate();
  const infoRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductByCode(code); 
        if (response.success) {
          setProduct(response.data.product);
          setSimilarProducts(response.data.product.similar_products || []);
          setPagination(response.data.product.pagination || null);
        }
      } catch (error) {
        console.error(error);
        navigate("/"); 
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0); 
  }, [code, navigate]);

  const loadMoreSimilarProducts = async () => {
    if (!pagination?.hasNextPage) return;

    try {
      setLoadingMore(true);
      const nextPage = pagination.page + 1;
      const response = await getProductByCode(code, nextPage);

      if (response.success) {
        const newProducts = response.data.product.similar_products || [];
        
        setSimilarProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewProducts];
        });

        setPagination(response.data.product.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  const requireLogin = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black uppercase tracking-widest text-slate-500">Loading Product...</p>
      </div>
    );
  }

  if (!product) return <h2 className="text-center text-2xl font-black mt-20 text-slate-900">Product not found</h2>;

  return (
    <div className="max-w-[1200px] mx-auto py-6 px-4 flex flex-col gap-6 pb-[100px] md:pb-10 bg-slate-50">
      
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 w-fit text-slate-800 bg-white border border-slate-200 px-4 py-2 rounded-xl font-black hover:bg-slate-100 transition-all shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-3xl p-4 md:p-8 shadow-sm border border-slate-200 flex flex-col" ref={infoRef}>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <ProductGallery product={product} requireLogin={requireLogin} />
          <ProductInfo product={product} requireLogin={requireLogin} />
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100">
          <ProductTabs product={product} />
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100">
          <SimilarProducts 
            similarProducts={similarProducts} 
            pagination={pagination}
            onLoadMore={loadMoreSimilarProducts}
            isLoadingMore={loadingMore}
          />
        </div>
      </div>

      {showAuthModal && (
        <div 
          className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-[320px] w-full shadow-xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.25 8.25v-3a3.25 3.25 0 10-6.5 0v3h6.5z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2">Login Required</h3>
            <p className="text-[13px] font-bold text-slate-500 mb-6 px-2 leading-relaxed">
              Please login to add items to your cart and complete your purchase.
            </p>

            <div className="flex w-full gap-3">
              <button 
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-black py-3 rounded-xl uppercase tracking-widest transition-colors"
                onClick={() => setShowAuthModal(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-black py-3 rounded-xl shadow-md uppercase tracking-widest transition-colors"
                onClick={() => navigate("/login")}
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;