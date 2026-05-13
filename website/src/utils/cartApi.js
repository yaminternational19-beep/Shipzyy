import apiService from './api';

// 1. ADD TO CART (POST)
export const addToCartApi = async (productId, quantity = 1) => {
  const response = await apiService.post('/customers/cart', {
    product_id: productId,
    quantity: quantity
  });
  return response.data;
};

// 2. GET CART ITEMS (GET)
export const getCartApi = async () => {
  const response = await apiService.get('/customers/cart');
  return response.data;
};

// 3. REMOVE SINGLE ITEM / UPDATE QUANTITY (DELETE)
export const removeFromCartApi = async (cartId, productId, quantity = 1) => {
  const response = await apiService.delete('/customers/cart', {
    data: { 
      cart_id: cartId,
      product_id: productId,
      quantity: quantity
    }
  });
  return response.data;
};

// 4. CLEAR FULL CART (DELETE)
export const clearAllCartApi = async () => {
  const response = await apiService.delete('/customers/cart/all');
  return response.data;
};