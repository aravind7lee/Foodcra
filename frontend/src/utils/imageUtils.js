// Image utility functions to handle broken images
import API_CONFIG from '../config/api';
import { getPlaceholderForFood } from '../assets/placeholder';

// Create fallback image URL
export const getFallbackImage = (imageName) => {
  return getPlaceholderForFood(imageName);
};

// Get image URL with fallback
export const getImageUrl = (imagePath, fallbackName = 'Food Item') => {
  if (!imagePath) return getFallbackImage(fallbackName);
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's a local asset path, try to use it directly
  if (imagePath.startsWith('/src/assets/') || imagePath.startsWith('./src/assets/')) {
    try {
      // Try to import the local asset
      const cleanPath = imagePath.replace('/src/assets/', '').replace('./src/assets/', '');
      return new URL(`../assets/${cleanPath}`, import.meta.url).href;
    } catch (error) {
      return getFallbackImage(fallbackName);
    }
  }
  
  // Try backend URL first, with fallback
  return `${API_CONFIG.getBaseURL()}${API_CONFIG.ENDPOINTS.IMAGES}/${imagePath}`;
};

// Handle image error
export const handleImageError = (event, fallbackName = 'Food Item') => {
  const img = event.target;
  const fallbackSrc = getFallbackImage(fallbackName);
  if (!img.src.startsWith('data:image/svg+xml')) {
    img.src = fallbackSrc;
    // Prevent infinite error loops
    img.onerror = null;
  }
};

// Preload image with fallback
export const preloadImage = (src, fallbackName = 'Food Item') => {
  return new Promise((resolve) => {
    if (src.startsWith('data:')) {
      resolve(src);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(getFallbackImage(fallbackName));
    img.src = src;
    
    // Timeout after 5 seconds
    setTimeout(() => {
      resolve(getFallbackImage(fallbackName));
    }, 5000);
  });
};