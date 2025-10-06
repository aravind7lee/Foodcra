// Image preloader utility for better performance
class ImageCache {
  constructor() {
    this.cache = new Map();
    this.loading = new Set();
  }

  preload(src) {
    if (this.cache.has(src) || this.loading.has(src)) {
      return Promise.resolve();
    }

    this.loading.add(src);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(src, img);
        this.loading.delete(src);
        resolve(img);
      };
      img.onerror = () => {
        this.loading.delete(src);
        resolve(null); // Resolve with null instead of rejecting
      };
      img.src = src;
    });
  }

  get(src) {
    return this.cache.get(src);
  }

  has(src) {
    return this.cache.has(src);
  }
}

export const imageCache = new ImageCache();

export const preloadImages = async (urls, concurrency = 3) => {
  const chunks = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    chunks.push(urls.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    await Promise.allSettled(
      chunk.map(url => imageCache.preload(url))
    );
  }
};