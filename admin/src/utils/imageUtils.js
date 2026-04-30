export const DEFAULT_IMAGES = {
  PRODUCT: '/no-image.jpg',
  USER: '/user-avatar.png',
  BANNER: '/no-image.jpg',
  CATEGORY: '/no-image.jpg',
  BRAND: '/no-image.jpg'
};

export const getSafeImage = (url, type = 'PRODUCT') => {
  if (!url || url === '' || url === 'null' || url.includes('placeholders/')) {
    return DEFAULT_IMAGES[type] || DEFAULT_IMAGES.PRODUCT;
  }
  return url;
};
