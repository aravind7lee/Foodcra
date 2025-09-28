// Image preloader utility for better performance
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = (imageUrls, maxConcurrent = 6) => {
  const promises = [];
  
  for (let i = 0; i < Math.min(imageUrls.length, maxConcurrent); i++) {
    promises.push(
      preloadImage(imageUrls[i]).catch(() => null) // Ignore errors
    );
  }
  
  return Promise.allSettled(promises);
};

export const createImageCache = () => {
  const cache = new Map();
  
  return {
    get: (src) => cache.get(src),
    set: (src, img) => cache.set(src, img),
    has: (src) => cache.has(src),
    preload: (src) => {
      if (!cache.has(src)) {
        preloadImage(src)
          .then(img => cache.set(src, img))
          .catch(() => {}); // Ignore errors
      }
    }
  };
};

// Global image cache instance
export const imageCache = createImageCache();