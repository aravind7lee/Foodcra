import React, { useState, useEffect } from 'react';

const OptimizedImage = ({ src, alt, className, fallbackSrc, onError, ...props }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      e.target.dataset.fallbackUsed = 'true';
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      onLoad={handleLoad}
      onError={handleError}
      loading="eager"
      style={{
        opacity: 1,
        transition: 'transform 0.3s ease',
        backgroundColor: '#f5f5f5',
        ...props.style
      }}
      {...props}
    />
  );
};

export default OptimizedImage;