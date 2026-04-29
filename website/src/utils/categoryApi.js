import apiService from './api';

export const getSubcategories = async (categoryId = null) => {
  const url = categoryId ? `/subcategories?categoryId=${categoryId}` : "/subcategories";
  const response = await apiService.get(url);
  return response.data;
};