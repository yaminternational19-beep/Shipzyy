import apiService from './api';

export const getWishlistItems = async () => {
  const response = await apiService.get('/customers/wishlist');
  return response.data;
};

export const toggleWishlistApi = async (productId, isLiked) => {
  const response = await apiService.post('/customers/wishlist', {
    product_id: productId,
    is_liked: isLiked
  });
  return response.data;
};

export const clearAllWishlistApi = async () => {
  const response = await apiService.delete('/customers/wishlist/all');
  return response.data;
};