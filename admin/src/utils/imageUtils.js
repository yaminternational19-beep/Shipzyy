export const DEFAULT_IMAGES = {
    PRODUCT: '/admin/no-image.jpg',
    USER: '/admin/user-avatar.png',
    BANNER: '/admin/no-image.jpg',
    CATEGORY: '/admin/no-image.jpg',
    BRAND: '/admin/no-image.jpg'
};

export const getSafeImage = (url, type = 'PRODUCT') => {
    if (!url || url === '' || url === 'null' || url.includes('placeholders/')) {
        return DEFAULT_IMAGES[type] || DEFAULT_IMAGES.PRODUCT;
    }
    return url;
};
