// import React, { useState, useEffect } from "react";
// import { getOrdersHistory } from "../../utils/orderApi"; 

// const MyOrdersPage = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         const res = await getOrdersHistory(1, 50);
//         console.log("Orders API Response:", res);
//         if (res && res.success) {
//           setOrders(res.data.orders || []);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrders();
//   }, []);

//   const activeOrders = orders.filter((o) => 
//     !["Delivered", "Cancelled", "Returned"].includes(o.order_status)
//   );
  
//   const historyOrders = orders.filter((o) => 
//     ["Delivered", "Cancelled", "Returned"].includes(o.order_status)
//   );

//   const getStatusStyle = (status) => {
//     const s = status?.toLowerCase() || "";
//     if (s.includes("pending") || s.includes("placed")) {
//       return { pill: "bg-amber-50 text-amber-600", dot: "bg-amber-500", progress: "w-1/4 bg-amber-500" };
//     }
//     if (s.includes("shipped")) {
//       return { pill: "bg-blue-50 text-blue-600", dot: "bg-blue-600", progress: "w-2/4 bg-blue-500" };
//     }
//     if (s.includes("out for delivery")) {
//       return { pill: "bg-purple-50 text-purple-600", dot: "bg-purple-600", progress: "w-3/4 bg-purple-500" };
//     }
//     if (s.includes("delivered")) {
//       return { pill: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-600", progress: "w-full bg-emerald-500" };
//     }
//     if (s.includes("cancelled") || s.includes("returned")) {
//       return { pill: "bg-red-50 text-red-600", dot: "bg-red-600", progress: "w-full bg-red-500" };
//     }
//     return { pill: "bg-slate-100 text-slate-600", dot: "bg-slate-600", progress: "w-0 bg-slate-500" };
//   };

//   const renderOrderCard = (order, isActive) => {
//     const styles = getStatusStyle(order.order_status);
    
//     return (
//       <div key={order.id} className="bg-white rounded-[24px] p-[30px] border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-slate-300">
        
//         <div className="flex justify-between items-start mb-[25px]">
//           <div className="flex flex-col gap-1.5">
//             <span className="text-[12px] text-slate-400 uppercase font-extrabold tracking-widest">Order ID</span>
//             <span className="text-[20px] font-black text-slate-900">#{order.order_number.replace('ORD-', '')}</span>
//           </div>
//           <div className={`px-4 py-2 rounded-full text-[13px] font-extrabold flex items-center gap-2 uppercase tracking-wide ${styles.pill}`}>
//             <span className={`w-2 h-2 rounded-full ${styles.dot}`}></span>
//             {order.order_status}
//           </div>
//         </div>

//         {order.items && order.items.length > 0 && (
//           <div className="mb-[25px] pb-[25px] border-b border-dashed border-slate-200">
//             <div className="flex flex-wrap gap-3 mb-[15px]">
//               {order.items.slice(0, 4).map((item, idx) => (
//                 <div key={idx} className="w-[65px] h-[65px] bg-slate-50 border border-slate-100 rounded-[14px] p-2 flex items-center justify-center">
//                   <img 
//                     src={item.image || "https://via.placeholder.com/65?text=Img"} 
//                     alt={item.product_name} 
//                     title={item.product_name}
//                     className="w-full h-full object-contain"
//                   />
//                 </div>
//               ))}
//               {order.items.length > 4 && (
//                 <div className="w-[65px] h-[65px] bg-slate-100 text-slate-500 font-extrabold text-[16px] rounded-[14px] flex items-center justify-center border-none">
//                   +{order.items.length - 4}
//                 </div>
//               )}
//             </div>
//             <div className="text-[14px] text-slate-500 font-semibold leading-relaxed line-clamp-2">
//               {order.items.map(item => item.product_name).join(" • ")}
//             </div>
//           </div>
//         )}

//         <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-5 sm:gap-0 mb-[20px]">
//           <div className="flex flex-col gap-1.5">
//             <span className="text-[13px] text-slate-500 font-bold">Total Amount</span>
//             <span className="text-[24px] font-black text-slate-900">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <span className="text-[13px] text-slate-500 font-bold">Date</span>
//             <span className="text-[16px] font-bold text-slate-700">{order.created_at}</span>
//           </div>
//         </div>

//         {isActive && (
//           <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2.5">
//             <div className={`h-full rounded-full transition-all duration-1000 ease-in-out ${styles.progress}`}></div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (loading) return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="w-10 h-10 border-4 border-[#00f2fe] border-t-transparent rounded-full animate-spin"></div>
//     </div>
//   );

//   return (
//     <div className="max-w-[900px] mx-auto pt-[100px] px-5 pb-[80px] min-h-screen">
//       <div className="text-center mb-[50px]">
//         <h1 className="text-[36px] font-black text-slate-900 mb-2.5 tracking-tight">My Orders</h1>
//         <p className="text-slate-500 text-[16px] font-medium">Track and manage your recent purchases</p>
//       </div>

//       <div className="flex flex-col gap-[60px]">
        
//         <section>
//           <div className="flex items-center gap-[15px] mb-[25px] border-b-2 border-slate-100 pb-[15px]">
//             <h2 className="text-[24px] font-extrabold text-slate-900 m-0">Active Orders</h2>
//             <span className="bg-[#00f2fe] text-slate-900 px-3 py-1 rounded-full text-[14px] font-extrabold">
//               {activeOrders.length}
//             </span>
//           </div>
          
//           <div className="flex flex-col gap-6">
//             {activeOrders.length === 0 ? (
//               <div className="p-10 text-center bg-slate-50 rounded-[20px] border border-dashed border-slate-300 text-slate-500 font-semibold">
//                 <p>No active orders right now.</p>
//               </div>
//             ) : (
//               activeOrders.map(order => renderOrderCard(order, true))
//             )}
//           </div>
//         </section>

//         <section>
//           <div className="flex items-center gap-[15px] mb-[25px] border-b-2 border-slate-100 pb-[15px]">
//             <h2 className="text-[24px] font-extrabold text-slate-900 m-0">Order History</h2>
//             <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[14px] font-extrabold">
//               {historyOrders.length}
//             </span>
//           </div>
          
//           <div className="flex flex-col gap-6">
//             {historyOrders.length === 0 ? (
//               <div className="p-10 text-center bg-slate-50 rounded-[20px] border border-dashed border-slate-300 text-slate-500 font-semibold">
//                 <p>Your past orders will appear here.</p>
//               </div>
//             ) : (
//               historyOrders.map(order => renderOrderCard(order, false))
//             )}
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// };

// export default MyOrdersPage;