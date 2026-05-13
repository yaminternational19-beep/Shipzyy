import React from "react";
import RatingBreakdown from "./RatingBreakdown";
import ReviewList from "./ReviewList";

function ProductTabs({ product }) {
  const reviewsCount = product.reviews?.length || 0;

  return (
    <div className="w-full flex flex-col gap-8 mt-6">
      
      <section id="product-description" className="w-full bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-[20px] md:text-[24px] font-black text-slate-900 mb-6 pb-4 border-b border-slate-100">
          Product Details
        </h2>

        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-[16px] font-black text-slate-800 mb-2">Description</h3>
            <p className="text-[14px] font-bold text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {product.description || "No description available for this product."}
            </p>
          </div>

          {product.specification && (
            <div>
              <h3 className="text-[16px] font-black text-slate-800 mb-2">Specification</h3>
              <p className="text-[14px] font-bold text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {product.specification}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-[16px] font-black text-slate-800 mb-4">Other Details</h3>
            <div className="overflow-hidden border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-[14px] font-bold">
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-slate-900 w-1/3 border-r border-slate-200 uppercase tracking-wider text-[11px] font-black">Category</th>
                    <td className="px-4 py-3 bg-white text-slate-700">{product.category_name || "N/A"}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-slate-900 w-1/3 border-r border-slate-200 uppercase tracking-wider text-[11px] font-black">Subcategory</th>
                    <td className="px-4 py-3 bg-white text-slate-700">{product.subcategory_name || "N/A"}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-slate-900 w-1/3 border-r border-slate-200 uppercase tracking-wider text-[11px] font-black">Made In</th>
                    <td className="px-4 py-3 bg-white text-slate-700 capitalize">{product.made_in || "N/A"}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-slate-900 w-1/3 border-r border-slate-200 uppercase tracking-wider text-[11px] font-black">Unit</th>
                    <td className="px-4 py-3 bg-white text-slate-700 capitalize">{product.unit || "N/A"}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-slate-900 w-1/3 border-r border-slate-200 uppercase tracking-wider text-[11px] font-black">Return Policy</th>
                    <td className="px-4 py-3 bg-white text-slate-700">
                      {product.return_allowed === 1 ? `${product.return_days} Days Returnable` : "Non-Returnable"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="product-reviews" className="w-full bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-[20px] md:text-[24px] font-black text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-3">
          Ratings & Reviews 
          <span className="text-[14px] text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
            {reviewsCount}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 md:gap-12 items-start">
          <div className="md:sticky md:top-[100px]">
            <RatingBreakdown product={product} />
          </div>

          <div>
            <ReviewList product={product} />
          </div>
        </div>
      </section>

    </div>
  );
}

export default ProductTabs;