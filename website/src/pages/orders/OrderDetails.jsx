import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import { getOrdersHistory } from "../../utils/orderApi";
import { encodeId } from "../../utils/crypto";

const OrderHistory = () => {
  const navigate = useNavigate(); 
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  const observer = useRef();
  const isFetchingRef = useRef(false);

  const TABS = ["All", "Pending", "Confirmed", "Delivered", "Cancelled"];

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  useEffect(() => {
    setOrders([]);
    setPage(1);
    setHasNextPage(false);
  }, [activeTab]);

  const lastOrderElementRef = useCallback(node => {
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
    const fetchOrders = async () => {
      try {
        if (page === 1) setLoading(true);
        else setFetchingMore(true);

        isFetchingRef.current = true;
        const res = await getOrdersHistory(page, 10);
        
        if (res && res.success) {
          const newOrders = res.data.orders || [];
          setOrders(prev => (page === 1 ? newOrders : [...prev, ...newOrders]));
          setHasNextPage(res.data.pagination.hasNextPage);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setFetchingMore(false);
        isFetchingRef.current = false;
      }
    };
    fetchOrders();
  }, [page, activeTab]);

  const allItems = orders.flatMap(order => 
    order.items?.map(item => ({
      ...item,
      order_id: order.id,
      created_at: order.created_at,
      image: item.image || order.primary_image
    })) || []
  );

  const filteredItems = allItems.filter((item) => {
    if (activeTab === "All") return true;
    const status = item.status?.toLowerCase() || "";
    if (activeTab === "Returned") return status.includes("return");
    return status.includes(activeTab.toLowerCase());
  });

  const getDisplayStatus = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();
    if (["confirmed", "pending", "placed"].includes(s)) {
      return "Order Under Processing";
    }
    return status.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("pending") || s.includes("placed") || s.includes("confirmed")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (s.includes("shipped")) return "bg-yellow-50 text-yellow-700 border-yellow-300";
    if (s.includes("delivered")) return "bg-green-50 text-green-700 border-green-200";
    if (s.includes("cancelled") || s.includes("return")) return "bg-red-50 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-800 border-slate-300";
  };

  if (loading && page === 1) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20">
      <div className="w-12 h-12 border-4 border-[#00f2fe] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pt-[30px] md:pt-[40px] pb-[100px] px-4 md:px-5 min-h-screen">
      <div className="text-center mb-[30px] md:mb-[40px]">
        <h1 className="text-3xl md:text-[36px] font-black text-white">My Orders</h1>
      </div>

      <div className="w-full max-w-[1000px] mx-auto">
        {/* Tabs*/}
        <div className="flex flex-wrap gap-2 justify-center p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-8 md:mb-10">
          {TABS.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`py-2 px-4 md:px-6 rounded-xl text-[11px] md:text-[12px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab 
                  ? "bg-white text-slate-900 shadow-xl" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {filteredItems.length === 0 ? (
            <div className="p-10 md:p-16 text-center bg-white/5 rounded-[24px] border border-dashed border-white/20">
              <p className="text-white/60 font-black text-[13px] md:text-[14px] uppercase tracking-widest">No Products Found</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isLast = index === filteredItems.length - 1;
              const maskedKey = encodeId(item.order_id);
              const showItemReturn = item.status?.toLowerCase() === "delivered" && item.is_return_allowed;

              return (
                <div 
                  key={`${item.item_id}-${index}`}
                  ref={isLast ? lastOrderElementRef : null}
                  onClick={() => navigate(`/orders/${maskedKey}?item_id=${item.item_id}`)}
                  className="bg-white rounded-2xl p-4 flex flex-col md:flex-row gap-4 md:gap-5 cursor-pointer hover:shadow-lg transition-all border border-slate-200"
                >
                  {/* Top Section on Mobile (Image + Info) */}
                  <div className="flex flex-row gap-4 flex-1 w-full items-start">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden shrink-0">
                      <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-1 w-full justify-center">
                      <h4 className="text-[15px] md:text-[17px] font-black text-slate-900 line-clamp-2 md:line-clamp-1">{item.product_name}</h4>
                      <p className="text-[12px] md:text-[13px] font-bold text-slate-500">{item.created_at}</p>
                      <span className="text-[13px] md:text-[14px] font-black text-slate-800 mt-1">Qty: {item.quantity}</span>
                    </div>
                  </div>

                  {/* Bottom Section on Mobile (Price, Status & Return Button) */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t border-slate-100 md:border-0 pt-3 md:pt-0 gap-3 md:gap-2 w-full md:w-auto shrink-0">
                    <div className="flex flex-col items-start md:items-end gap-1.5 md:gap-2">
                      <p className="text-[16px] md:text-[18px] font-black text-slate-900">₹{Number(item.price).toLocaleString('en-IN')}</p>
                      <span className={`px-2 py-1 md:px-3 md:py-1 rounded-md text-[10px] md:text-[12px] font-black uppercase border ${getStatusStyle(item.status)}`}>
                        {getDisplayStatus(item.status)}
                      </span>
                    </div>

                    {showItemReturn && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="px-4 py-2 md:px-5 md:py-2.5 bg-slate-900 text-white font-black text-[10px] md:text-[11px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap"
                      >
                        Return ({item.return_days} Days)
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {fetchingMore && (
          <div className="flex justify-center mt-8">
            <div className="w-8 h-8 border-4 border-[#00f2fe] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;