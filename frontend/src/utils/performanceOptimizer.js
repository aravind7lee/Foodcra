// Performance optimization utilities

// Preload critical images immediately
export const preloadCriticalImages = (imageList) => {
  if (!Array.isArray(imageList)) return;
  
  imageList.slice(0, 8).forEach(imageSrc => {
    if (imageSrc && !imageSrc.includes('/src/assets/')) {
      const img = new Image();
      img.onload = () => {}; // Silent success
      img.onerror = () => {}; // Silent failure
      img.src = imageSrc;
    }
  });
};

// Optimize component rendering
export const shouldComponentUpdate = (prevProps, nextProps, keys) => {
  return keys.some(key => prevProps[key] !== nextProps[key]);
};

// Debounce function for search and other operations
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};