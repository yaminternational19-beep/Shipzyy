import React, { createContext, useContext, useState, useEffect } from "react";

const OrdersContext = createContext();
export const useOrders = () => useContext(OrdersContext);




export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("orders");
    const parsed = saved ? JSON.parse(saved) : [];
    
    return parsed.length > 0 ? parsed : [];
  });




  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const updateOrders = (updatedOrders) => {
    setOrders(updatedOrders);
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder ,updateOrders}}>
      {children}
    </OrdersContext.Provider>
  );
};


