// API Configuration with fallback and error handling
const API_CONFIG = {
  // Production backend
  PRODUCTION_URL: 'https://foodcra-backend.onrender.com',
  
  // Development fallback (you can set up local backend)
  DEVELOPMENT_URL: 'http://localhost:4000',
  
  // Current environment
  IS_DEVELOPMENT: import.meta.env.DEV,
  
  // Get base URL with fallback
  getBaseURL: () => {
    return API_CONFIG.IS_DEVELOPMENT 
      ? API_CONFIG.DEVELOPMENT_URL 
      : API_CONFIG.PRODUCTION_URL;
  },
  
  // API endpoints
  ENDPOINTS: {
    FOOD_LIST: '/api/food/list',
    CART_GET: '/api/cart/get',
    CART_ADD: '/api/cart/add',
    CART_REMOVE: '/api/cart/remove',
    RATING_BULK: '/api/rating/bulk',
    RATING_USER_BULK: '/api/rating/user-bulk',
    IMAGES: '/images'
  }
};

export default API_CONFIG;