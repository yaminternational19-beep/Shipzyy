import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import apiService from "../../../utils/api"; 
import ProductGallery from "../ProductGallery";
import ProductInfo from "../ProductInfo";
import ProductTabs from "../ProductTabs";
import SimilarProducts from "../../SimilarProduct/SimilarProducts";

function ProductDetails() {
  const { id } = useParams();
  const infoRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        //  API Call
        const response = await apiService.get(`/customers/products/${id}`);
        if (response.data.success) {
          setProduct(response.data.data.product);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0); 
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black uppercase tracking-widest text-slate-400">Loading Product...</p>
      </div>
    );
  }

  if (!product) return <h2 className="text-center text-2xl font-black mt-20">Product not found</h2>;

  return (
    <div className="max-w-[1200px] mx-auto py-10 px-5 flex flex-col gap-10 pb-[100px] md:pb-10">
      
      <div 
        className="grid grid-cols-1 md:grid-cols-2 gap-[30px] md:gap-[50px] items-start bg-gradient-to-br from-white to-[#faf5ff] rounded-[18px] p-[25px] md:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.08)]" 
        ref={infoRef}
      >
        {/* LEFT → IMAGE */}
        <ProductGallery product={product} />

        {/* RIGHT → INFO */}
        <ProductInfo product={product} />
      </div>

      {/* BELOW → TABS + REVIEWS */}
      <ProductTabs product={product} />

      <SimilarProducts currentProduct={product} />
    </div>
  );
}

export default ProductDetails;